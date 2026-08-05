# v0

**A game of chess, played between two people who live on different servers,
where each of them ends up holding their own verifiable record of it.**

Unfamiliar terms are defined in [the glossary](GLOSSARY.md).

That is the whole of v0. It is small on purpose: every part of the argument —
federated identity, delegated permission, a record that outlives the venue that
issued it, live shared state — has to be real for it to work at all, and none of
it can be faked by a demo.

## The repositories

Divided on whether a thing *implements* the protocol or is *built with* it.
`Protocol-*` implements; `Laravel-*` builds; the last three are servers you can
run.

| | Answers | |
|---|---|---|
| [`Protocol`](https://github.com/StreetMesh/Protocol) | What is StreetMesh, exactly? | Guides, decisions, conformance vectors. No implementation. |
| [`Protocol-PHP`](https://github.com/StreetMesh/Protocol-PHP) | | `streetmesh/protocol` — framework-free PHP. Bytes in, bytes out. |
| [`Protocol-Laravel`](https://github.com/StreetMesh/Protocol-Laravel) | | `streetmesh/protocol-laravel` — the same, bound to the framework: routes, models, migrations, storage, HTTP, cache. |
| `Laravel-Domicile` | | Resident-facing UI: dashboard, activity feed, data browser. |
| `Laravel-Venue` | | Visitor-facing UI, venue-anchored chat, the experience menu, realtime authorization. |
| `Laravel-Chess` | | The chess experience. |
| `Hub` | | npm. The authoritative multiplayer host, on Colyseus: rooms, ticket verification, peer media. Only the room rules are per-experience. Named in the original plan; this is that. |
| [`Server`](https://github.com/StreetMesh/Server) | Where do I start if I want to run a StreetMesh server — domicile, venue, or both? | Stock Laravel with the packages wired and nothing else. |
| `Home` | What can a dedicated domicile look like? | A worked example, and the one that actually runs. |
| `Games` | What can a dedicated venue look like? | The same, for the other capability. |

`Server` is the starting point. `Home` and `Games` are worked examples of it,
each configured for one capability and each deployed — which also settles a
question the prototype fudged: a domicile and a venue are separate applications
in separate checkouts, and a server that is both is a matter of configuration
rather than of sharing a directory.

## Order

Each step is finished when the one after it can rely on it without qualification.

1. **Vectors before extraction.** Conformance vectors for anything two servers
   must agree on, so later work has a safety net that is not an opinion. *Done.*
2. **`Protocol-PHP`.** The framework-free layer, measured against the vectors by
   two independent implementations. *Done.*
3. **`Protocol-Laravel`.** Identity, delegated permission, records. The bindings
   that make the framework-free layer usable: storage, HTTP, cache, queue.
4. **`Server`.** Prove a bare domicile federates with no interface package
   installed. Establishes how much glue is irreducible.
5. **The interface split.** Install `Laravel-Domicile` and `Laravel-Venue`
   together as the thinnest possible packages and settle who owns the apex, the
   dashboard, the layout and the navigation — **before** either has features.
   This is the likeliest source of pain in the plan.
6. **Venue substrate and `Hub`.** The experience menu, realtime authorization,
   and the multiplayer host every experience depends on.
7. **`Laravel-Chess`, `Home`, `Games`.** The experience, and the two servers that
   prove the whole stack by running it.

Steps 1–6 are done, and 7 runs on a single machine: a game is played to its end
between two residents, and each of them holds a signed record of it on the server
they live on. What is left of 7 is the part it exists to prove — the two halves
on separate deployments, talking over the open network rather than over
localhost.

### Found along the way

Things the plan did not anticipate, recorded because each of them cost real time
and none of them was visible from the outside.

**A hub has to be able to speak.** The design had every exchange one-way: the
venue signs, the hub verifies, the venue asks. That holds until the two moments
that matter most — a table emptying, and a game ending after every player has
closed their tab — both of which happen when there is nobody left to ask on
anybody's behalf. This is now an **announcement** over a shared secret, and it is
the only place in StreetMesh where something is trusted because of a secret
rather than a signature. See GLOSSARY.

**Half of everything we signed was invalid.** ATProtocol requires low-S ECDSA
signatures; OpenSSL produces either half at random and verifies both. Nothing
local can see it, because signing and verifying are the same library agreeing
with itself. Found only by submitting to a real PLC directory.

**A test suite will publish to a public registry if you let it.** Minting a
resident became a network write, and a package suite inherited `plc.directory`
as a default — about thirty permanent, global entries for hosts that exist on one
laptop. There are now three guards, and the useful one is that no package suite
can reach the network at all.

### Open

**Addresses that are not hostnames.** A handle is a hostname, so a resident of
`streetmesh.com` is `collegeman.streetmesh.com`. Whether a domicile should also
accept and resolve `streetmesh.com/@collegeman` — as something a person types
rather than as a handle, which it cannot be — is undecided. The prototype
supported both shapes; this does not.

## Not in v0

Deferred deliberately, and each for a stated reason rather than by omission.

**A full Personal Data Server.** Merkle Search Trees, CAR files, commit signing,
the firehose. Full ATProtocol interoperability is the destination, and it does
not get to delay a working chess game on a foundation that stays still. The
record store is built repo-shaped so that adding this later is additive: records
addressed by collection and key, immutable, able to reference one another, keyed
so they sort by time, carrying a visibility no code path may flip, and opaque to
the database. Held to, a PDS becomes a second reader over the same store.

**Messaging between domiciles.** Protocol design rather than interface work, and
ATProtocol does not supply it either — messages are not repo records, which is
why they live outside the protocol there too.

**Commerce.** The primitive already exists: a venue-signed attestation held by
the participant is a receipt as much as it is a game result. What it needs
beyond v0 is references between records for refunds and disputes, private
records, and a value rail that is deliberately somebody else's problem.

**A spatial interface.** WebXR, presentation profiles, avatars. The architecture
decisions are recorded; none of them is load-bearing for a chess table.

## What v0 must demonstrate

Not features — properties. Each of these is a claim the project makes, and each
is either true in v0 or the release is not v0.

1. A person's identity does not belong to the server they live on, and survives
   them moving.
2. A venue cannot write whatever it likes to somebody's home.
3. Revoking a venue refuses it, and cannot be worked around by renewing.
4. A record verifies with nothing but the document and public infrastructure —
   after the venue is gone, and after it has rotated its keys.
5. A signed document is verified exactly as received, byte for byte.
6. A venue stops calling a stranger's server eventually.
