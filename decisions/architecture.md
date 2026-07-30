# Architecture

**Historical.** Written while the first implementation was being built, and kept
because the decisions still hold and the rejected framings still deserve to stay
rejected. Where it refers to a codebase, it means that first implementation.

**Status:** Working notes from a design conversation. Decisions here are provisional
and pre-spec. Nothing below is implemented.
**Date:** 2026-07-27
**Purpose:** Context handoff for coding agents. Read the Constraints section before
proposing any client-side implementation.

---

## 1. What StreetMesh Is

A federated spatial web. Layered, bottom-up:

| Layer | Owns | Notes |
|---|---|---|
| **Protocol** | Federation, server-to-server exchange, identity, portability | The only thing all servers share. Bottom layer, highest change cost. |
| **Presentation Profiles** | Standardized schemas for a *class* of experience (e.g. 3D Spatial Profile) | Newly identified layer. See §4. Does not yet exist. |
| **Servers** | Their own UI, entirely | Heterogeneous by design. |
| **Clients** | Rendering, input | Web client is served by the visiting server. Native clients are profile-bound. |

Servers are deliberately unalike. Canonical example:

- **Server A** — home server. No graphical UI. Dashboard, feed, transactions.
- **Server B** — social gaming. Top-down 2D. Avatar is a 90s sprite.
- **Server C** — FPS world.

The only thing A, B, and C have in common is the Protocol.

**Guiding principle:** the end user owns their data. A spatial web that thrives on
standards and constraints without central ownership.

### Existing prior art in this codebase

There is already a `StreetMesh\StoryEngine` Laravel package with:

- `Place` entities and `PlaceBinding`
- Visibility levels: `private | server | federated`
- Federated publication consent (both PlaceBinding visibility *and* a
  `protocol_publishable` flag must agree)
- `place_binder => null` — the host Server registers its own implementation
- Protocol contract tests validating federated beats against the Protocol schema

The `place_binder` pattern is already "the server defines its own presentation." The
architecture below is largely a formalization of a decision this package made first.

---

## 2. North Star (vertical slice)

Two users join a server. The server feels like an old town walking mall. They
converge at a central point and play a game of chess.

Working backward from this is the build order.

**Why chess:** it is the smallest complete instance of the general primitive —
two parties, a proposed state transition, validation against shared rules, mutual
commitment, a durable outcome. That is also the shape of a purchase. Chess and
pluggable ecommerce should be designed against one primitive, not two. Chess is the
better first target because it has no payment-rail distractions.

---

## 3. Decisions

### D1 — No downloadable client for web access
Access via standards-compliant browser, period. The visiting server serves the client.
This is definitional, not a preference.

### D2 — Native clients are for comfort, not graphics
Unity native clients exist for headsets and native devices. Their mandate is
**same content, better frame stability and comfort** — sustained frame pacing,
reprojection, foveated rendering. Explicitly *not* better visuals.

*Rationale:* content is user-supplied glTF normalized by the proxy to a fixed material
profile. Unity's real rendering advantages (baked GI, custom shaders, authored material
complexity) apply to content shipped in a build, which StreetMesh has almost none of.
Worse, if the native client renders meaningfully better, creators author for native and
the web experience becomes the degraded one — breaking D1 from the content side, where
it is harder to notice and harder to undo.

### D3 — The web client sets the capability envelope
The Protocol never exposes anything a browser cannot implement. Native clients may do
more internally; they may never require more from the Protocol. Design against Unity's
ceiling and you spec something browsers cannot do.

### D4 — The visiting server proxies all resources
Client talks only to the server that served it. That server fetches remote assets
server-to-server and re-serves them same-origin.

Buys:
- Eliminates the CORP/COEP problem entirely (see §5)
- A server-side place to validate and reject hostile assets
- Normalization: transcode to KTX2, generate LODs, clamp to a fixed material profile
- Caching
- Limits IP/user-agent exposure to servers the user deliberately visits

Costs — plan for these explicitly:
- Every server's storage and bandwidth scale with what its users **look at**, not what
  it hosts. This is the Mastodon media-repo problem. See §7.
- Cache staleness (user updates avatar, proxies serve the old one)
- Redistribution liability — worth a lawyer before launch, not after

Precedent: Matrix homeservers proxy remote media exactly this way.

**Note:** the home server remains the *data authority*. It is not the network
chokepoint. The proxy is the visiting server.

### D5 — Transport: WebTransport
Baseline as of Safari 26.4 (March 2026). Chrome 97+, Edge 98+, Firefox 114+,
Safari 26.4+ (macOS and iOS), Samsung Internet 18+.

⚠️ Many compatibility tables and tutorials still say Safari has no WebTransport
support. They are stale. Verify against WebKit release notes, not aggregators.

Keep a WebSocket fallback for older Safari for a while, but design to WebTransport.

Split the wire protocol:
- **Control plane** — CBOR or JSON over reliable streams. Readable and self-describing.
  Inspectability and spec stability matter more than bytes here; specs that are hard to
  read by hand are specs nobody implements independently.
- **Hot path** (transforms, presence) — tight binary over unreliable datagrams.

### D6 — Share the schema, not the code
One wire-format definition, codegen to C# and TypeScript.

*Rejected:* shared Rust core compiled to WASM for web + native plugin for Unity. Sounds
elegant; delivers FFI marshaling in Unity, a nastier build matrix, and a much narrower
contributor pool for a project whose thesis is open participation.

### D7 — Web client stack: three.js-native
Flagship web client is three.js-native TypeScript. Needle Engine is *optional*, and only
for using Unity or Blender as authoring tools for first-party spaces — which is what it
is genuinely good at. All three.js APIs remain accessible under Needle.

**Constraint:** networking, identity, and scene-graph logic stay in plain TypeScript that
would survive dropping Needle. Needle must not become the abstraction the Protocol client
is written against.

*Rejected:* Unity-for-web (Option A). See §5 for the decisive reason.
*Rejected:* "Needle for web, Unity to author the UI" (Option B as originally framed).
Unity-authored UI is the most lossy thing to export and the place where the web platform
is most overwhelmingly better — DOM/CSS gives accessibility, IME and text input,
responsive layout, native focus handling. A browser's chrome should be browser chrome.

### D8 — Presentation Profiles are a required, explicit layer
This is the consequence of D1 + heterogeneous servers, and it is load-bearing.

A Unity native client **cannot** receive and execute arbitrary presentation code from an
arbitrary server. App store rules prohibit it; security prohibits it. So a native client
can only render servers whose presentation fits a schema it already shipped.

Therefore "only the Protocol in common" is too weak to support native clients at all.
Options are:
1. Client for one specific world (a game client, not a browser) — not what we want
2. Data-only client (dashboard, feed) — useful but limited
3. **Client implementing a standardized, versioned Presentation Profile** — the target

Servers speaking the 3D Spatial Profile are natively visitable. Servers that don't are
web-only, permanently and by design. That is acceptable (RSS works this way) **provided
the profile is an explicit versioned spec with its own conformance suite**, not something
that emerges accidentally from whatever the first 3D server happens to do.

⚠️ Profiles are also the exact mechanism by which interoperability dissolves. See §7.

### D9 — An avatar is an identity, not a file
Server B renders you as a sprite; Server C as an FPS character. "Avatar" is an identity
with per-profile representations.

glTF/VRM is the representation for the **3D Spatial Profile**, not for StreetMesh.

Open: does the home server store a *set* of representations, or canonical identity
attributes that servers derive from? This determines whether adding a new profile later
forces every user to upload something new.

### D10 — The venue hosts; the participants own the record
The mall runs the chess game, provides the board, renders the plaza. When the game ends,
the result is written to **both players' home servers**. The venue may keep a copy but is
not the authority. If the venue disappears, both players still have the game.

Generalized: the store hosts the transaction, the buyer owns the receipt. This is the
testable form of the data-ownership principle and the thing platform commerce cannot do.

### D11 — Addresses must name places and objects, not just servers
A StreetMesh URI must be able to name *that spot, in that plaza, at that table* — not
merely a server.

The web is a web because of the link, not because of HTTP. If addresses only name
servers, this is a directory of destinations. If they name a place and an object within
a place, sharing, bookmarking, embedding, search, and "meet me here" all fall out of one
decision. Cheap to specify now; nearly impossible to retrofit.

### D12 — One primitive for shared authoritative state + settlement
Chess and ecommerce are the same shape. Design them together.

---

## 4. Rejected Framings (do not re-litigate without new information)

| Framing | Why rejected |
|---|---|
| "Unity all the way down, including web" | §5 — managed C# cannot thread in the browser |
| "Needle for web, Unity authors the UI" | Unity UI export is lossy; DOM/CSS is strictly better on web |
| "Build *the* StreetMesh browser" | There is no singular client. Servers define presentation. Clients are per-profile. |
| "Native client should look better" | D2 — creators would author for native, degrading the web |
| Shared Rust/WASM protocol core | D6 — build and contributor cost exceeds the duplication it saves |

---

## 5. Load-Bearing Technical Constraints

**Unity Web cannot multithread managed C#.** The synchronous thread signaling GC requires
is unavailable in browsers. Unity Web multithreading is native C/C++ only. glTFast's glTF
parsing and instantiation is C#, therefore main-thread-bound. Every avatar load contends
with rendering.

Cesium hit this and wrote a **custom C++ thread pool** for web builds specifically,
queueing Unity-touching work back onto the main thread. A Unity-funded team building a
streaming-3D product had to drop to C++ to make runtime asset streaming viable. Their web
support is still labeled experimental. This is the single decisive constraint against
Unity-for-web.

**Two asset pipelines vs one.** In Unity, build-time content is Unity-native (prefabs,
materials, shader variants) and runtime content is glTF mapped onto it. Permanent fidelity
gap unless all authored content is constrained to the glTF PBR model — at which point glTF
is canonical anyway, with an engine in the way. In three.js there is one representation:
authored world and stranger's avatar arrive through the same loader.

**glTFast shader variant stripping.** Materials break in builds when shader variants are
missing. Including all variants bloats the build; the alternative is harvesting a variant
collection by running against every glTF you expect — impossible on an open network.
*Partially repaired by D4:* if the proxy normalizes everything to a fixed material profile,
the variant set becomes finite and enumerable. This repairs one objection to Unity-for-web.
The threading constraint above is not repaired by anything.

**Cross-origin isolation vs federation.** `COEP: require-corp` flips subresource defaults
to deny; every cross-origin asset must opt in via `Cross-Origin-Resource-Policy`. Arbitrary
user-run servers will not set it. **Resolved by D4** — all assets are same-origin. Do not
reintroduce direct cross-origin asset fetching.

Two residual notes:
- `COOP: same-origin` severs `window.opener`, breaking popup-based OAuth. Relevant if
  there is any third-party identity story.
- three.js Draco/KTX2/meshopt decoders run in ordinary Web Workers with transferable
  buffers — no SharedArrayBuffer, so no isolation requirement. This graceful degradation
  is not available to Unity Web at any price.

---

## 6. Open Questions

- **Delegation model.** A visiting server holds a credential to the user's home server.
  Scope granularity? Revocation? Is offline S2S access permitted at all? Blast radius when
  a visiting server is compromised? Cheap now, very expensive after servers exist.
- **Avatar representation storage** (D9) — set of representations vs derived.
- **Key custody.** If each server ships its own client build, visiting a server means
  executing that server's code, and a malicious server can ship a modified client that
  exfiltrates keys. Normal for the web, sharper in federation. Mitigations: keep identity
  material outside the served client (extension, separate origin, hardware), or pin
  reference builds with subresource integrity. Retrofitting key custody is miserable.
- **iOS Safari WebXR** immersive session support — historically absent; Vision Pro Safari
  is a separate story. **Verify before promising headset-via-browser.**
- **Browser asset cache eviction** — repeat visits re-downloading the world. Investigate
  `navigator.storage.persist()` early.
- **Governance** — who owns the spec, who can change it, what happens if the founder loses
  interest. Easiest to settle while abstract.
- **Minimum viable server operating cost** — must be measured, not estimated. See §7.

---

## 7. Known Failure Modes for Projects of This Shape

**Extension proliferation (XMPP).** Excellent core spec, open extension process, and no two
implementations supported the same subset. Federation became technically true and
practically meaningless. This is the direct risk of D8. Mitigation: few profiles, versioned,
conformance binary rather than a menu of optional capabilities, strong default "no" to new
profiles. A protocol that says no is what makes portability real.

**Operational cost floor (SMTP, Mastodon).** Won on standards, centralized anyway, because
operating burden made scale decisive. D4 creates this exposure directly — server cost scales
with what users *look at*. If running a server exceeds what a hobbyist absorbs, the result is
federation on paper and three big instances in fact. Treat minimum-viable-server cost as a
first-class design constraint measured early, not an optimization pass later.

**Flagship implementation becomes the spec (ActivityPub / Mastodon).** Same structural setup
here: one author writing the Protocol, the flagship server, and the flagship client.
Mitigation is structural, not disciplinary — the conformance suite is the authority, and
something other than the flagship must prove the spec is implementable.

---

## 8. Next Actions

1. **Runtime loading spike — one week, both stacks.**
   Load 12 distinct glTF/GLB avatars from 12 different origins that set no CORP header,
   Draco + KTX2 compressed, on a mid-range Android phone. Measure frame hitching during
   load, peak memory, time-to-first-avatar.
   Then repeat with a deliberately hostile asset — 8K textures, decompression bomb,
   million-triangle mesh — and measure how hard it is to reject at the fetch/proxy layer.
   *The second test is the one people skip and the one that determines shippability.*

2. **Specify addressing (D11) before anything else in the Protocol.** Highest
   retrofit cost of any open item.

3. **Conformance suite as executable spec.** Machine-readable, one command, runs in CI.
   Both clients must pass.

4. **Read-only Unity viewer, early.** No editing, no full UI — connect, parse, load
   avatars, render, walk around. A few weeks of work that forces every Protocol assumption
   through a C# implementation while the spec is still cheap to change. Do this well before
   the real native client.

5. **Second minimal server, different language, different author.** Not a product — a
   conformance canary. Every place they have to ask what something means is an
   underspecified part of the spec, and there is no other way to find those.

6. **Vertical slice:** two users, mall plaza, converge, chess, result written to both home
   servers.

---

## 9. Note on Augmented Coding

AI-assisted implementation collapses much of the two-client duplication cost that would
otherwise argue against maintaining separate web and native clients. That is a real tailwind
for this architecture.

The less obvious effect: it raises the value of a **machine-readable spec and a one-command
conformance suite** considerably. If someone can stand up a StreetMesh server in an
afternoon, there will be many more servers. The only thing separating a thriving ecosystem
from a fragmented one is whether "am I conformant?" is a question an implementer can answer
in ten seconds without asking anyone.

Spec an LLM can read, suite CI can run.
