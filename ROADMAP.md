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
| [`Server`](https://github.com/StreetMesh/Server) | Where do I start if I want to run a StreetMesh server — domicile, venue, or both? | Stock Laravel with every package wired in, and a worked example of each capability. |

**`Server` is both the starting point and the worked example**, and there is
deliberately nothing else. An earlier version of this plan named two further
repositories — `Home`, a dedicated domicile, and `Games`, a dedicated venue — as
the servers that would prove the stack by running it. Neither was ever built, and
the reason is worth keeping: **the difference between them is configuration.**

One checkout with every capability installed, deployed twice with different
switches, is a domicile and a venue. That is the arrangement running now — a
domicile at `stme.sh` and a venue at `tabletop.streetmesh.com`, from one
repository and one commit. Two example repositories would have been two copies of
the same application, drifting.

What the prototype fudged is still settled the same way: a domicile and a venue
are separate *applications*, with separate databases and separate identities.
They are not separate *codebases*.

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
7. **`Laravel-Chess`, and one server deployed as two.** The experience, and the
   proof that the whole stack runs — a domicile and a venue from one codebase,
   on separate deployments.

Steps 1–6 are done. Step 7 runs on a single machine — a game played to its end
between two residents, each holding a signed record of it on the server they live
on — and the two halves are now deployed separately and reachable over the open
network: a domicile at `stme.sh`, a venue at `tabletop.streetmesh.com`, and the
venue's hub beside it.

What is left of 7 is the part it exists to prove: a game between two people on
**different servers**, over the network rather than over localhost, each ending
up holding their own record of it.

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

**A server has one hub, and it has to come from somewhere.** An experience used
to ship a hub, which gives a server as many hubs as it has things to do. Saying
"one hub per server, experiences ship rooms" is easy; the mechanism is not,
because the thing that runs a hub has Node and nothing else — no PHP, no
Composer, no submodules — while the list of installed experiences lives in a PHP
registry. So the server generates its hub and the result is committed, which is
generated code in a repository and paid for deliberately. See
[`decisions/hub-runtime.md`](decisions/hub-runtime.md).

**A safety check that cannot tell "unsafe" from "cannot tell" stops
everything.** A deploy refused to run against a dirty checkout. A build container
leaves git describing nothing — every tracked file staged-deleted, every file
untracked — which is indistinguishable from a working tree somebody threw away,
so it refused every deploy for an afternoon. It abstains now when the index holds
nothing, because then it has no basis for an opinion.

**A test suite will publish to a public registry if you let it.** Minting a
resident became a network write, and a package suite inherited `plc.directory`
as a default — about thirty permanent, global entries for hosts that exist on one
laptop. There are now three guards, and the useful one is that no package suite
can reach the network at all.

### Left behind

**Addresses that are not hostnames.** An earlier prototype accepted
`streetmesh.com/@collegeman` alongside `collegeman.streetmesh.com`. A handle is a
hostname — that is how every other server on the network resolves one — so the
first could only ever have been a local convenience that had to be translated
before it meant anything. Considered and dropped: one address per person.

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

**A spatial interface.** WebXR, presentation profiles, avatar *models*. The
architecture decisions are recorded; none of them is load-bearing for a chess
table.

The 2D half of an avatar is built and is not deferred: a resident publishes an
icon at their own address and anywhere they go fetches it from there. That was
worth doing ahead of the rest because it settles the question the whole idea
turns on — whether a face is a thing you own or a thing a venue keeps — at the
cost of one picture rather than a renderer. The model is still deferred, and
`decisions/avatars.md` records what it still has to answer.

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
