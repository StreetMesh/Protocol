# Glossary

Plain definitions of every term StreetMesh uses, what problem each one solves,
and — because it matters more than it looks — whether it is ours or borrowed.

**(ours)** invented for StreetMesh · **(ATProto)** taken from ATProtocol ·
**(standard)** an existing open standard

Very little here is ours. That is deliberate: a federated protocol is only worth
anything if other people's software already speaks most of it.

---

## Places and roles

**Domicile** *(ours)* — the server a person lives on. It holds who they are and
the records of what they have done. A person picks one the way they pick an email
provider, and can leave for another without losing either their name or their
history.

**Venue** *(ours)* — a server that hosts things people do together: a chess club,
a shop, a hall. Nobody has an account at a venue. You arrive with a name issued
somewhere else, do something, and leave with a record of it.

A server can be both. They are capabilities rather than types.

**Resident** *(ours)* — a person as their domicile knows them.

**Visitor** *(ours)* — the same person as a venue sees them: someone from
elsewhere, here for a while, whose identity the venue borrows rather than owns.

**Experience** *(ours)* — something a venue hosts that people take part in and
that produces a record. Chess is one. A purchase is another, and deliberately so.

**Place** *(ours)* — somewhere addressable. `https://games.example/tables/7` is a
table; `#white` on the end is the seat at it. An ordinary web address on purpose,
so it can be pasted into a chat, bookmarked, or followed by anything at all.

**Front page** *(ours)* — what anybody sees at the root of a server, signed in
or not. There is one root, so a server offering more than one capability has to
say which greets people. Configurable, and deliberately not something a package
can claim: two routes sharing a path do not collide loudly in Laravel, so a
package taking the root would win or lose on boot order with nobody deciding.

**Home page** *(ours)* — what somebody signed in sees. Per person, and composed
of **widgets** offered by whatever capabilities are installed, arranged by the
operator. The one surface where two capabilities genuinely overlap: a person on
a server that is both a home and a gathering place has business with both, on
one screen.

Distinct from the front page, and worth keeping distinct — they have different
audiences, and conflating them makes a venue look as though it has no answer to
"whose page is this," when in fact a visitor *is* signed in, just by a
delegation from elsewhere rather than an account here.

**Widget** *(ours)* — a panel a capability offers for a home page it does not
own. Offered rather than placed: a server is something somebody runs, not
something they receive.

**Hub** *(ours)* — the part of a venue that runs live shared state: whose turn it
is, who is in the room, where their cursor is. Separate from the durable half
because the two have opposite requirements — one must be fast and can be rebuilt,
the other must survive.

---

## Identity

**DID** *(standard, W3C)* — a permanent identifier for a person or a server. The
point is that it does not change when they move. Looks like
`did:plc:z72i7hdynmk6r22z27h6tvur`.

**DID document** *(standard)* — what you get when you look a DID up: its current
seals, and where its owner lives.

**`did:plc`** *(ATProto)* — the kind of DID we use. Its identifier is derived from
a mathematical fingerprint of the operation that created it, so it means nothing
in itself. Meaninglessness is the feature: an identifier that revealed where you
live would stop being true when you moved. Recorded in a public register that
also keeps a dated history of every seal you have used.

**`did:web`** *(standard)* — the other kind, where the identifier *is* a web
address. Simpler, no register needed, and supported — but it changes if you move,
and it keeps no seal history, so it cannot answer "which seal were you using last
year?" We support it and the code is explicit about what it cannot tell you.

**PLC directory** *(ATProto)* — the public register behind `did:plc`. Worth being
exact about what it is trusted for: every entry is signed by a key its owner
holds, so the register **cannot forge an identity, invent one, or reassign one.**
It can only decline to answer. Trusted for availability, not for truth — a much
weaker requirement than "central registry" suggests.

**Handle** *(ATProto)* — the readable name a person actually types, like
`alice@domicile.test`. Points at a DID. The DID is permanent and ugly; the handle
is friendly and changeable.

**Handle resolution** *(ATProto)* — looking up which DID a handle points at, and
checking that the DID names the handle back. **Both directions matter.** One
alone would let anybody able to publish a name hang it on a stranger's identity.

**Signing key** *(ATProto)* — the seal used day to day. Usually held by the server
you live on.

**Rotation key** *(ATProto)* — the key that can change your DID document,
including replacing the signing key and pointing your identity at a different
server. **This is what "you can move" actually means.** A domicile holding the
only rotation key makes leaving a favour it grants — which is the arrangement
StreetMesh exists to argue against, so a resident holds one of their own.

**Key rotation** — changing your seal. Happens for ordinary reasons: routine
practice, moving servers, someone leaving. It is the reason verification has to
ask *when* rather than only *what*.

**Audit log** *(ATProto)* — the dated history of an identity's operations. What
makes it possible to check a two-year-old record against the seal that was
actually current when it was made. `did:web` has no equivalent.

**Multikey** *(standard, W3C)* — how a key is written down so any software
recognizes it: a short prefix saying what kind of key it is, then the key, then an
encoding. `z6Mk…` is one kind, `zQ3sh…` another.

---

## Records

**Record** *(ATProto)* — one thing that happened, held by the person it happened
to. Written once and never edited. Not tidiness: if a record could change after
being cited, then a reference to it would name whatever is there now rather than
what was cited, and every copy of it elsewhere would drift apart silently. A
correction is a new record that says what it corrects.

**Collection** *(ATProto)* — the drawer a record goes in, named for what kind of
thing it is: `com.streetmesh.games.chess`. In StreetMesh the drawer also decides
who may see it.

**NSID** *(ATProto)* — the naming scheme for collections: a domain name backwards,
then what the thing is. Backwards so that whoever controls the domain controls
the name, without a registry.

**Lexicon** *(ATProto)* — the written schema for a kind of record: which fields
exist, which are required, what each means. `com.streetmesh.games.chess` has one.

**Record key** *(ATProto, often "TID")* — a record's name within its drawer,
derived from the moment it was made and written in an alphabet arranged so that
**sorting the names sorts the times.** Listing a history in order becomes free.

**AT-URI** *(ATProto)* — a record's full address:
`at://did:plc:…/com.streetmesh.games.chess/3mqcp5qjdfs26` — whose, what kind,
which one. Not a web address, deliberately: the first part is a DID, so the
address survives its subject moving.

**CID / content addressing** *(standard, IPLD)* — naming a record by a fingerprint
of its contents. Alter one character and the name no longer matches. What lets
one record cite another and mean *"that record, as it was"* rather than
*"whatever is at that address now"* — which a refund, a correction or a dispute
needs in order to be a fact rather than an honour system.

**Visibility** *(ours)* — whether a drawer is public or private. **It belongs to
the drawer, never to the individual record.** A per-record setting would be an
input, and an input can be wrong, forged, or flipped by a bug in a form.
Publishing cannot be undone, so the safest design is one where nothing anywhere
accepts "should this be public?" as an argument.

**Repository / "repo"** *(ATProto)* — a person's whole collection of public
records, arranged so it can be handed over wholesale. Our store is *a repository
plus a locked drawer*, since ATProto has no private records at all.

**PDS (Personal Data Server)** *(ATProto)* — a server that speaks the full
repository protocol. Their name for what a domicile does. Deferred: we hold
records in the same shape without yet speaking the wire format.

---

## Signing and encoding

**Signature** — a mark only the holder of a key can make and **anyone** can check
without contacting them. The asymmetry is the whole point: a venue that has shut
down can still be verified.

**Attestation** *(ours)* — a signed statement by one party about something that
happened to another. A venue says who won; the player keeps the venue's signed
note. **This is the idea ATProto has no equivalent for** — in ATProto everything
in your cabinet is written and signed by you.

**JWS** *(standard, IETF RFC 7515)* — the standard envelope for a signed
statement. What is underneath "Sign in with Google". Three chunks joined by dots.

Its one load-bearing property: **the signature covers the encoded text, exactly as
it travels.** There is nothing for the recipient to rebuild, so nothing in
between can quietly reinterpret it.

**Canonicalization** — the rule for turning a structure into bytes so two
programs agree on which bytes to sign. **We no longer have one**, and that is a
feature. Signing a structure means the verifier rebuilds the bytes from whatever
it decoded, and everything in between gets a vote — a web framework tidying
input, a JSON library ordering keys differently, an empty string becoming
nothing. Encoding first and signing what you encoded removes the whole category.

**DAG-CBOR** *(standard, IPLD)* — a compact binary format with exactly one valid
way to write any given value. Used where a fingerprint has to be reproducible.
Its one trap: **keys sort by length first, then alphabetically** — not the plain
alphabetical order most libraries default to.

**Ed25519 / P-256 / secp256k1** *(standard)* — three families of signing key.
Ed25519 is the nicest and ATProto does not permit it for identity, so identity
keys are P-256, which is the one PHP handles without an extension.

**Conformance vector** — a frozen example with its expected answer, in plain
JSON. The arbiter. A claim about the wire that is not in the vectors is an
opinion, and an implementation is conforming when it reproduces them — not when
its author believes it follows the spec.

---

## Permission

**Delegation** — a venue acting on your behalf at your domicile, because you said
it could. Standard OAuth, the same mechanism as "sign in with" anywhere else.

**Revocation** — withdrawing that. It must genuinely **refuse**, not merely stop
working, and must not be routed around by renewing. That failure is the
delegation doing its job.

**Settlement** *(ours)* — getting a finished record home to the people it belongs
to. Named while delivery was the mechanism. Now that an attestation can be
checked by anyone, delivery is closer to an optimization, and this may end up
dissolving into "publish it and let them collect it."

---

## Deferred

Terms that will appear when full ATProto interoperability arrives, listed so they
are not mysterious when they do.

**Merkle Search Tree** *(ATProto)* — how a repository is structured internally so
that a fingerprint of the whole thing can be computed cheaply.

**CAR file** *(ATProto)* — the file format a repository is handed over in.

**Commit** *(ATProto)* — your own signature over your whole cabinet, proving the
contents are yours and that your server has not quietly added anything. **We do
not have this yet**, and it is the one substantive gap rather than a mechanical
one.

**Firehose** *(ATProto)* — the live stream of everything changing across the
network, which other servers subscribe to.

**Label** *(ATProto)* — a third party's annotation on content, used for
moderation. The nearest thing ATProto has to an attestation, and it lives with
the labeller rather than with the subject.
