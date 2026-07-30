# The wire surface, as first measured

**Historical.** Recorded 2026-07-30 against the first working implementation —
two live servers, a venue and a domicile, exchanging real records. That
implementation has since been taken apart, and several things below were
deliberately not carried forward. The specification and the conformance vectors
are the current authority; this is where they came from.

It is kept because it was measured rather than remembered. Every endpoint,
document shape and field here is what two servers actually exchanged, which made
it possible to write a specification from evidence instead of from memory — and,
more usefully, to see which parts were designed and which had merely accumulated.

Three things it fed: the normative sections of the specification, the package
decomposition below, and the move onto ATProtocol.

## How to read the tables

**Proven** — two independent servers have done this repeatedly, including
today. **Works** — exercised end to end at least once, single path, no
adversarial testing. **Unproven** — written and reviewed, never demonstrated.

Repositories divide on whether a thing *implements* the protocol or is *built
with* it. `Protocol-*` implements; `Laravel-*` builds. That is why the two
families are named differently, and it is worth preserving.

| Tag | Repository | Composer | What belongs there |
|---|---|---|---|
| **spec** | `StreetMesh/Protocol` | — | The definition: guides, specification, and `conformance/` vectors. No implementation. |
| **PHP** | `StreetMesh/Protocol-PHP` | `streetmesh/protocol` | Framework-free PHP. Things that take bytes and return bytes: value objects, encoding, signing, DID and handle resolution. No HTTP client, no container, no config. Testable against nothing but the vectors. |
| **Core** | `StreetMesh/Protocol-Laravel` | `streetmesh/protocol-laravel` | Everything that touches Laravel: routes, controllers, models, migrations, Passport wiring, the service provider, the byte-integrity guarantee. Knows *when* to verify a signature; `Protocol-PHP` knows *how*. |
| **Domicile** | `StreetMesh/Laravel-Domicile` | | Resident-facing UI: dashboard, activity feed, data browser, messaging. |
| **Venue** | `StreetMesh/Laravel-Venue` | | Visitor-facing UI, venue-anchored chat, the experience menu, Colyseus authorization. |
| **Chess** | `StreetMesh/Laravel-Chess` | | The chess experience. |
| **Hub** | an npm package | | The authoritative multiplayer host, on Colyseus: room hosting, ticket verification, and peer media. Every experience needs it; only the room rules are per-experience. |
| **Server** | `StreetMesh/Server` | — | *Where do I start if I want to run a StreetMesh server — domicile, venue, or both?* A stock Laravel application with the packages wired and nothing else. |
| **Home** | `StreetMesh/Home` | — | *What can a dedicated domicile look like?* A worked example, and the one that actually runs. |
| **Games** | `StreetMesh/Games` | — | *What can a dedicated venue look like?* The same, for the other capability. |
| — | nothing | | Prototype scaffolding that does not survive extraction. |

`Server` is the starting point; `Home` and `Games` are worked examples of it,
each configured for one capability and each deployed. That arrangement also
settles a question the prototype fudged: a domicile and a venue are separate
applications in separate checkouts, as anybody running them would have it, and
a server that is both is a matter of configuration rather than of sharing a
directory.

Two things the flat naming does not show, and which a reader will otherwise
assume wrongly. **`Protocol-Laravel` sits on top of `Protocol-PHP` rather than
beside it** — a future `Protocol-TS` would be the sibling. And
`streetmesh/protocol-laravel` inverts Packagist's usual `vendor/laravel-thing`
habit on purpose, because grouping by protocol-versus-product is more use here
than matching a browsing convention.

---

## 1. Addressing

Two shapes, because domiciles come in two shapes. Both are accepted as input
anywhere an address is asked for.

```
alice.apartments.test        a resident with a host of their own    (pattern: wildcard)
alice@apartments.test        a resident under a shared host         (pattern: path)
```

**An address deliberately does not tell you where the resident's page is.**
Under the path shape there is no origin to derive. Resolving an address
therefore means asking the domicile, which is the only party entitled to say.
This is the single most load-bearing discovery of the prototype and it caused
two separate bugs before it was understood.

Places are addressed as ordinary `https` URLs, with a fragment naming a spot
within the place:

```
https://chess.test/tables/7          the table
https://chess.test/tables/7#white    the seat at it
```

| Class | Framework-free? | Destination | Status |
|---|---|---|---|
| `StreetMesh\Uid` | yes | PHP | Proven |
| `StreetMesh\Address` | yes | PHP | Proven |

## 2. Discovery

First contact. Nothing is arranged in advance; a venue that has never heard of
a domicile fetches one document and knows enough to register itself, ask for
permission, and deliver a record later.

### `GET /.well-known/streetmesh` — what a server is

Unauthenticated. Cached by callers for 300s.

```json
{
  "streetmesh": "0.1",
  "host": "apartments.test",
  "name": "Apartments",
  "capabilities": ["domicile"],
  "public_key": "EYtQql30dUGcOAD+nVUuOFiFQ9jcXprVFDlwv7GIczA=",
  "residents": { "pattern": "path", "template": "https://apartments.test/@{username}" },
  "endpoints": {
    "registration":  "https://apartments.test/oauth/register",
    "authorization": "https://apartments.test/oauth/authorize",
    "token":         "https://apartments.test/oauth/token"
  },
  "scopes": ["identity:read", "records:write"]
}
```

`residents`, `endpoints` and `scopes` appear only when the server is a
domicile. `capabilities` is a set, not a type — a server may be both.

`public_key` is base64 standard-alphabet Ed25519, 32 bytes.

### `GET <resident base>/.well-known/streetmesh` — what a resident is

Unauthenticated.

```json
{
  "streetmesh": "0.1",
  "uid": "alice@apartments.test",
  "domicile": "apartments.test",
  "home": "https://apartments.test/@alice",
  "public_key": "…",
  "endpoints": { "registration": "…", "authorization": "…", "token": "…",
                 "identity": "https://apartments.test/@alice/identity",
                 "records":  "https://apartments.test/@alice/records" },
  "scopes": ["identity:read", "records:write"]
}
```

`home` exists because a venue genuinely cannot compute it (see §1). It was
added on 2026-07-29 to make "Here now" linkable. **It is not a did:web or
ATProto field** — it is ours, and it is the clearest example of a hole patched
under pressure that a specification should reconsider rather than inherit.

| Endpoint | Destination | Status |
|---|---|---|
| server discovery | Core | Proven |
| resident discovery | Core | Proven |
| `RemoteServer` (fetch, cache, resident-template expansion) | Core | Proven |

## 3. Registration — a venue introduces itself

### `POST /oauth/register`

Open registration, deliberately. If a venue and a domicile had to be paired by
hand, every new server would need permission from every existing one, and the
network would centralize on whoever was easiest to get paired with.

```json
{ "client_name": "The Chess Club",
  "host": "chess.test",
  "redirect_uris": ["https://chess.test/visit/callback"] }
```

Two checks, both necessary: the host must answer its own discovery document as
a `venue` *at the host it claims*, and every redirect URI must point back at
that same host. Response is `client_id` / `client_secret`.

Re-registering an existing host mints a fresh secret, because secrets are
stored hashed and cannot be read back. That makes this the recovery path for a
venue that has lost its credentials.

| | Destination | Status |
|---|---|---|
| `ClientRegistrationController` | Core | Proven |

## 4. Delegation — OAuth 2.0 + PKCE

Standard Passport authorization-code flow with PKCE. The venue sends the
visitor to their own domicile; the domicile asks them; the venue gets tokens.

Scopes, and there are only two:

| Scope | Meaning |
|---|---|
| `identity:read` | See your name and how you like to be shown |
| `records:write` | Write records of what you do here to your own server |

Revocation at the domicile genuinely refuses: `Settlement::accessTokenFor()`
will refresh an expired token, but a revoked delegation cannot be refreshed
around. **That failure is the delegation working**, and it is a cultural
commitment expressed as a mechanism.

| | Destination | Status |
|---|---|---|
| Passport routes, `Pkce`, `RemoteResident::authorizationUrl/exchangeCode/refresh` | Core | Proven |
| `VisitController` (visit → callback → visitor session) | Venue | Proven |

## 5. Identity read

### `GET <resident base>/identity`

Bearer token, scope `identity:read`.

```json
{ "uid": "alice@apartments.test", "display_name": "Alice", "initials": "A" }
```

The token proves somebody granted access; it does not prove *whose* origin is
being read. Both this and records assert `$bearer->id === $resident->user_id`,
without which a token for Alice would read Bob simply by being pointed at Bob's
origin.

| | Destination | Status |
|---|---|---|
| `IdentityController` | Core | Proven |

## 6. Record delivery — the claim of the whole system

### `POST <resident base>/records`

Bearer token, scope `records:write`.

```json
{
  "type": "chess.game",
  "record_id": "yjcawfeo:white",
  "issued_at": "2026-07-29T18:19:58+00:00",
  "body": { "…": "see below" },
  "signature": "base64 Ed25519 over Canonical::encode(body)"
}
```

The body, written to be legible on its own by somebody reading it out of their
own server years later, with the venue gone:

```json
{
  "type": "chess.game",
  "venue": "chess.test",
  "venue_name": "The Chess Club",
  "address": "https://chess.test/tables/yjcawfeo#white",
  "concluded_at": "2026-07-29T18:19:58+00:00",
  "subject": "alice@apartments.test",
  "seat": "white",
  "result": "win",
  "participants": [ { "uid": "…", "name": "…", "seat": "black" }, … ],
  "outcome": { "winner": "white", "reason": "resignation" },
  "detail": { "pgn": "…", "moves": [ … ] }
}
```

The issuer is **whoever holds the token**, not whoever the body claims to be:
the host is resolved from the OAuth client behind the access token, its key is
fetched from its published discovery document, and the signature is checked
against that. A body claiming to come from somewhere reputable proves nothing.

### The signing rule, and the trap in it

`SigningKey::sign()` signs `Canonical::encode($document)` — keys sorted
recursively, `JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE |
JSON_PRESERVE_ZERO_FRACTION`. The verifier re-canonicalizes the *decoded* body
and checks that.

**This round-trip is where records failed for two days.** Signing and
verification were both correct; a global Laravel middleware
(`ConvertEmptyStringsToNull`) rewrote `{"pgn":""}` to `{"pgn":null}` before
verification, so games that recorded no moves failed while otherwise identical
games succeeded. An exemption existed, but matched the path `records` — which
is only the path under the *wildcard* addressing shape. On a path-addressed
domicile the real path is `@alice/records`, so the guard never fired. Fixed
2026-07-30; all ten outstanding records now deliver and verify.

Two lessons, both belonging in a specification rather than in a comment:

1. **A signed document must be verified as received, byte for byte.** Any
   normalization between the wire and the verifier is corruption. Because
   `ConvertEmptyStringsToNull::skipWhen()` and `TrimStrings::skipWhen()` are
   static hooks, **Core can guarantee this from a service provider** instead of
   each implementor remembering it. That is one of the strongest arguments for
   the package split.
2. **Re-serialize-and-hope is the wrong shape.** `RoomTicket` already does it
   correctly — it signs the base64url-encoded payload *exactly as it will
   travel*, with a comment saying why. Records should do the same. That is also
   precisely what JWS does, and it is why moving onto existing standards is
   cheaper than perfecting ours.

| | Destination | Status |
|---|---|---|
| `Canonical`, `SigningKey` | PHP | Proven |
| `RecordsController` | Core | Proven |
| `Settlement` (delivery, retry, cutoff) | Core | Proven |
| `sm:settle` + hourly schedule | Core | Works — no scheduler runs in production |
| `Settlement::body()` shape | Chess (it is chess-shaped) | Proven |

## 7. The realtime seam — **not protocol**

Explicitly outside the protocol. No other server ever calls these, and another
implementation is free to split its halves along a different line or not at
all. Recording it because the boundary itself is the novel part of StreetMesh
and ATProto has nothing to say about it.

### Browser → host

| Endpoint | Purpose |
|---|---|
| `POST /tables/{engagement}/ticket` | Permission to join a room. Returns `endpoint`, `room`, `slug` (`host:slug`), `seat`, `ticket`, `media`. |
| `GET  /tables/{engagement}/signals` | Drain WebRTC notes addressed to me. |
| `POST /tables/{engagement}/signals` | Post a WebRTC note to another *seated* participant. |

### Host → realtime, and back

The realtime half publishes a key at
`GET /.well-known/streetmesh-realtime`, and `GET /health` answers "are you
there" without listing who is playing what. The host verifies journalling
against that key, which is why **there is no shared secret between the halves**.

| Endpoint (on the host) | Purpose |
|---|---|
| `GET  /realtime/engagements/{engagement}` | What the room needs to start. |
| `POST /realtime/engagements/{engagement}/journal` | Durable move list. |
| `POST /realtime/engagements/{engagement}/outcome` | Conclusion, which triggers settlement. |

### The ticket

`base64url(payload).base64url(signature)`, signed **over the encoded payload**
with the host's published key.

```json
{ "iss": "chess.test", "sub": "alice@apartments.test", "name": "Alice",
  "initials": "A", "accent": "#…", "room": "yjcawfeo", "seat": "white",
  "exp": 1234567890, "jti": "uuid" }
```

60-second lifetime; single-use, tracked in-process (a multi-process realtime
deployment would need shared storage — **currently unproven**).

| | Destination | Status |
|---|---|---|
| `RoomTicket`, ticket verification | Core + a JS counterpart | Proven |
| `Realtime\*` hosts (`CloudHost`, `ForgeHost`, `LocalHost`, `Probe`) | Venue | Works |
| `TableTicketController`, `TableSignalController`, `Mailbox` | Venue | Works |
| `Media\*` (`PeerMedia`, `LiveKitMedia`, `MediaManager`) | Venue | Unproven — `CEILING`/`limit`/`relayed` are advertised and enforced nowhere |
| `rooms/ChessRoom.ts`, `schema/ChessState.ts` | Chess | Works |
| `auth/ticket.ts`, `identity.ts`, `config.ts`, `host.ts` | `Hub`, not Chess | Works |

**Note on the realtime split:** `Laravel-Venue-Chess` carrying "the Colyseus
game server" means the *chess room* only. Ticket verification, identity and
host config are generic and are needed by every experience — so the JS side
needs its own base package (`@streetmesh/realtime`) that each experience
depends on. That is a package the v0 list does not yet name.

## 8. Invariants that must hold

Candidates for the first conformance tests, because each one is a value
expressed as a mechanism rather than as prose.

1. A signed document is verified exactly as received. No trimming, no
   null-coercion, no re-ordering. (Broken until 2026-07-30.)
2. A record survives its issuer — verifiable against a published key with the
   venue gone. (Holds; all ten stored records verify.)
3. Revocation refuses and cannot be refreshed around. (Holds.)
4. A token for one address cannot read or write another. (Holds, tested.)
5. A venue registers only if it answers as a venue at the host it claims, and
   only for redirects back to that host. (Holds, tested.)
6. A venue stops calling a stranger's server eventually —
   `KEEP_TRYING_FOR_DAYS = 7`. (Holds.)
7. A domicile publishes where its residents are; nobody guesses. (Holds.)
8. **Unenforced:** a non-human presence must be able to declare itself
   unspoofably. Named in the Protocol introduction ("AI companions without
   human impersonation") and implemented nowhere.
9. **Broken:** a venue that has lost its credentials can recover.
   `ClientRegistrationController` is explicitly written to be that recovery path,
   but `DomicileRegistration::meet()` returns the stored row and never
   re-registers — so a domicile that forgets or rotates its clients permanently
   breaks every venue that ever registered with it, with no path back short of
   deleting a database row by hand. Found 2026-07-30 while restoring a
   local environment.

## 9. ATProtocol mapping

| Here | ATProto | Fit |
|---|---|---|
| Domicile | **PDS** | Very strong. Same concept, already specified, with account migration. |
| Address (`alice@apartments.test`) | Handle (`alice.apartments.test`) | Strong, but shape differs — theirs is domain-only, ours is email-shaped and already in the UI. A user-visible decision. |
| `uid` | DID (`did:plc` / `did:web`) | Replace. Ours is a handle used as an identifier, which ATProto explicitly separates. |
| Server discovery document | DID document + `did:web` resolution | Replace. `home` and `residents.template` mostly dissolve. |
| `Canonical` + Ed25519 | DAG-CBOR + signed commits / JWS | Replace. This is where the bug lived; the standard exists for exactly this reason. |
| Record | Record in a repo, keyed by NSID collection | Strong — **but see the mismatch below.** |
| `type: "chess.game"` | NSID, e.g. `com.streetmesh.chess.game` | Adopt, plus a Lexicon schema. This is the Components vocabulary layer. |
| Delegation (OAuth + PKCE) | ATProto OAuth (PAR, DPoP, PKCE) | Strong, incremental. |
| Presence, rooms, cursors, tickets, signalling | **nothing** | Keep native. Ephemeral 16Hz state must never touch a Merkle repo. This is the genuinely novel surface. |
| Venue-anchored chat | nothing standard | Open. |
| Domicile↔domicile messaging | not in the protocol (Bluesky DMs are a centralized service) | **Open protocol design, not UI work.** |

### The one real mismatch

ATProto's trust model is *your repo, your key, your commit*. StreetMesh's
record model is *the venue's attestation about you, held by you*. A venue
cannot sign into a resident's repo.

So the venue's signature has to live **inside** the record as a detached claim,
verifiable against the venue's DID independently of the repo commit chain. That
composes, but only deliberately — and it is the core of what StreetMesh
actually claims, so it needs writing down carefully whichever substrate wins.

## 10. Prototype accidents not to canonise

Extracting interfaces from this code today would freeze these in.

- **`Engagement` / `EngagementParticipant`.** Chess-shaped words generalised
  halfway. The essay's vocabulary (domicile, venue, presence) and the code's
  vocabulary have never met. Names in a prototype are cheap; names in a
  protocol become JSON field names every implementor inherits.
- **`record_id` = `"{slug}:{seat}"`.** Convenient, unspecified, and assumes
  seats.
- **`home` in the resident document.** A hole patched under pressure.
- **`type: "chess.game"`.** Not a namespace, and one experience deep.
- **`Settlement::body()`.** Sound in structure, chess-specific in content. The
  envelope belongs to Core; the body belongs to the experience.
- **`Protocol::VERSION = '0.1'`** on every document, with no negotiation rule
  for what a mismatch means.
- **The whole multi-instance arrangement.** `instances/`, the `sm` script,
  `SM_INSTANCE`, `Instance::resolve()` and the relocated environment, database
  and storage paths exist so one checkout could serve two hosts on one laptop.
  Nobody deploys a real site that way, and a reference implementation that reads
  as though they might is a reference to the wrong thing. **It must not enter
  Core, Server, or any package.**

  Measured rather than assumed: the mechanism appears in exactly five files —
  `app/StreetMesh/Instance.php`, one line at the end of `bootstrap/app.php`,
  `phpunit.xml`, `composer.json` and `PlatformEnvironment.php`. It is referenced
  by no controller, no route file, and nothing in `app/StreetMesh/` except
  itself. Deleting it is a subtraction, not a refactor.

  In its place: one checkout per site, stock Laravel layout, each with its own
  `.env` and `database/database.sqlite`, which is what Herd expects by default.
  `domicile.test` and `venue.test` name the roles better than `apartments.test`
  and `chess.test` name instances of them. A server that is both a domicile and
  a venue stays possible — that is a matter of configuration, not of sharing a
  folder.

## 11. Open questions the specification has to answer

1. Is a StreetMesh identity a DID, and if so `did:plc` or `did:web`? Everything
   in §9 depends on this.
2. Handle shape: `alice@apartments.test` or `alice.apartments.test`?
3. Does the record become an ATProto repo record with an embedded venue
   attestation, or stay a delivered signed document? (See §9.)
4. Where is the boundary between Domicile and Venue when both are installed in
   one `Server`? The prototype shares an apex and switches on capability; two
   packages will both want `/`, `/dashboard`, a layout, and a nav. **This is
   the most likely source of pain in the v0 plan and worth designing before any
   code moves.**
5. Is domicile↔domicile messaging federated? If yes it is a new protocol
   surface — delivery, ordering, read state, group membership — and the largest
   unknown on the v0 list. It is not a UI package.
6. What does a version mismatch mean?
7. ~~How much glue is irreducible in `Server`?~~ **Answered.** `skipWhen()` moves
   the middleware guards into Core, and the multi-instance switch is deleted
   rather than moved (§10). What remains in `bootstrap/app.php` is stock
   Laravel plus Core's service provider.

## Appendix: what is already framework-free

Extraction is much closer than the monolith suggests. These have no Laravel
imports at all and could move to `Protocol-PHP` unchanged:

```
StreetMesh\Uid          StreetMesh\Address        StreetMesh\Canonical
StreetMesh\SigningKey   StreetMesh\Protocol
Engagement\Conclusion   Engagement\Experience
```

One step away: `Pkce` uses only `Illuminate\Support\Str` for random generation,
and `Server` only `Config`. `Discovery` needs nothing but the models it reads.
Everything else in `app/StreetMesh/` is Laravel integration and belongs in
Core.
