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

Authoritative over **the present moment and nothing else**. What happened is the
venue's to sign and the participant's to keep, so anything that must survive a
restart has to reach the venue before it is acknowledged to anybody.

**Room** *(ours)* — one gathering inside a hub: a table, a watch party, an
auction. It exists while people are in it and not otherwise, which is why a hub
restarting is an inconvenience rather than a loss.

**Ticket** *(ours)* — a short-lived note from a venue saying *this person may sit
in this seat in this room*, signed with the key that venue already publishes.

It exists so that the hub can stay ignorant. Everything hard — resolving a
federated address, checking a delegation, deciding who sits where — has already
happened by the time somebody reaches a room, and a hub can do none of it. So it
is told the answer and has only a signature to check.

That is also why there is **no shared secret anywhere on the join path**. A hub
cannot impersonate the venue and a stolen ticket is worth one seat for a few
minutes.

It is no longer true that a hub holds no credential at all. It holds one, for
one direction, described next — and that entry is worth reading, because it is
the only place in StreetMesh where anything is trusted because of a secret
rather than because of a signature.

**Announcement** *(ours)* — a hub telling a venue that something changed in one
of its rooms: somebody arrived or left, or a game ended.

This exists because asking is not always possible. The two moments a venue most
needs to know about both happen when nobody is looking — a table emptying, and a
game ending after every player has closed their tab. There is nobody left to
knock, the room is disposed shortly afterwards, and what happened is gone.

So the hub speaks, and is recognised by a **shared secret**, because it has no
key of its own to sign with. That is a real weakening and worth stating plainly:
everything else here is trusted because of a signature that can be checked by
anybody, and this is trusted because two servers were told the same string.

What it buys is narrow. A venue believes the state of a room it opened and the
result of a gathering it started. Nothing about *who anybody is* comes back this
way — that arrived in a ticket the venue signed itself.

The address is not configured. Every ticket names the venue that signed it, and
the hub already resolves that DID to fetch the key it verifies with, so where to
call back arrives with the authority to open the room. A hub serving several
venues cannot be pointed at the wrong one.

**Seat** *(ours)* — the right to a particular chair in a room, held by the venue.
Distinct from being *in* the room, and the distinction is load-bearing: a seat
survives closing a tab, because otherwise an opponent could take your chair while
you reconnected. Who is actually present is the hub's answer; who may play is the
venue's.

**Gathering** *(ours)* — the venue's durable record of a room: which experience,
who sat where, and how it ended. A room is memory and stops existing; a gathering
is what is left when it does.

**Settling** *(ours)* — turning a finished gathering into records the
participants keep. The hub decided what happened and can sign nothing; the venue
can sign and did not watch. Settling is where those two meet, and it is the point
of the whole arrangement.

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

A handle is a **hostname**, which is not a formatting detail: it is what another
server puts into DNS, and it constrains what an address can look like. A resident
of `stme.sh` is `collegeman.stme.sh` and cannot be `stme.sh/@collegeman` — the
second is a URL, and handle resolution has nowhere to send it.

An earlier prototype accepted both shapes, and that has been dropped rather than
carried forward: one address per person, and it is the one every other server on
the network already knows how to resolve.

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

There are **two**, and their order is the design. PLC treats the list as an order
of authority: an operation signed by a higher key can undo one signed by a lower.
The resident's is first and is handed to them at sign-up and never stored, so
moving out never needs the server's cooperation. The domicile's is second, which
is enough to change somebody's handle for them and not enough to overrule them.
One key in both places would have made leaving a favour again.

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

A drawer nobody has declared is **private**, not refused. This matters more than
it sounds: refusing would mean a domicile had to be configured for chess before
it could receive a chess result, so a venue could only settle records to
operators who had already heard of it — two operators agreeing privately rather
than federation. A resident agreeing to a **scope** naming that record type is
what makes it allowed, and that agreement arrives with the request rather than
ahead of it. So the declared list says what a server *publishes*, not what it
will accept.

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

That cuts both ways, and it is worth knowing which way: because the signature
covers the encoded bytes, **moving a field in the header changes every signature**
even though the document means the same thing. A conformance vector caught
exactly that here.

**JWK** *(standard, IETF RFC 7517)* — a key written as JSON. We name keys with a
multikey nearly everywhere, because that is what a DID document publishes; a JWK
is needed in one place only, and unavoidably: a DPoP proof carries its key inside
itself, since the server receiving it has never seen that key and has nowhere to
look it up.

**Thumbprint** *(standard, IETF RFC 7638)* — a key's fingerprint, used wherever
something names a key rather than carrying it. Its trap is the same shape as
DAG-CBOR's: only the members that define the key, in a fixed order, no
whitespace. Get it slightly wrong and you produce a perfectly well-formed
fingerprint that matches nothing, forever.

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

**Low-S** *(ATProto)* — for every ECDSA signature `(r, s)` there is an equally
valid `(r, n − s)`. ATProtocol requires the lower of the two and rejects the
other; OpenSSL picks between them at random and verifies both without complaint.

Listed because the failure is invisible from inside: a round trip through your
own library passes on a signature the network will not take, so roughly half of
everything you sign is refused elsewhere and nothing local ever says so. Measured
here before it was fixed: 103 signatures in 200.

**Conformance vector** — a frozen example with its expected answer, in plain
JSON. The arbiter. A claim about the wire that is not in the vectors is an
opinion, and an implementation is conforming when it reproduces them — not when
its author believes it follows the spec.

---

## Permission

**Delegation** — a venue acting on your behalf at your domicile, because you said
it could. OAuth, and recognizably the mechanism behind "sign in with" anywhere
else — but ATProtocol's profile of it, which differs in three ways that are not
details. All three are described below: nothing is registered in advance, every
request is pushed, and every request is signed.

**Authorization server** *(standard)* — whoever can grant permission over an
account. **Resource server** *(standard)* — whoever holds the thing permission is
being granted over. Usually the same machine and deliberately not the same idea:
a domicile may keep your records and let a server run by somebody else do the
asking, and a venue finds out which by asking the resource rather than assuming.

**Client metadata document** *(ATProto)* — how a venue says what it is. A URL
serving a JSON document, and **that URL is the venue's identifier**. This is the
replacement for registering: there is no sign-up call, no shared secret, no
record on either side to keep in step or go stale. Two servers that have never
met agree on nothing in advance — one of them just reads the other's document.

Worth dwelling on, because the obvious design is the other one. Our prototype
built a registration endpoint, a table and a handshake to solve this, and the
standard's answer deletes all three.

**PAR (pushed authorization request)** *(standard)* — sending the details of what
you are asking for directly to the authorization server first, and getting back a
short handle to put in the browser redirect. Mandatory here. It keeps the request
off the URL, where it could otherwise be read or altered on its way through the
person's own browser.

**DPoP (demonstrating proof of possession)** *(standard, RFC 9449)* — proof that
whoever is holding a token is whoever it was issued to. Mandatory here, for every
request.

The contrast is the point. A **bearer token** is a password: whatever gets hold of
one can spend it, so a copy of the token is a copy of the authority — and tokens
end up in logs, proxies, browser extensions and crash reports. A DPoP token is
bound to a key. Each request carries a fresh short-lived signature over that
method and that URL, made with a key the token names by fingerprint, and the key
never leaves the venue. A stolen token is then worth nothing.

**Nonce** *(standard)* — a value the authorization server hands out and requires
echoed back in the next proof, rotating every few minutes. Being told to use a
new one is an ordinary event in the middle of a working conversation rather than
a failure — a client that treats it as an error works until the first rotation
and then stops.

**Scope** *(standard)* — what is being asked for, named. Every session here
carries `atproto`, which is the claim to follow this profile at all. Anything of
ours beyond that is an **extension** and has to be written down and named as one:
a scope invented locally is a word no other server on the network knows, which is
the difference between extending a protocol and quietly leaving it.

**Revocation** — withdrawing permission. It must genuinely **refuse**, not merely
stop working, and must not be routed around by renewing. That failure is the
delegation doing its job.

**Settlement** *(ours)* — getting a finished record home to the people it belongs
to. Named while delivery was the mechanism. Now that an attestation can be
checked by anyone, delivery is closer to an optimization, and this may end up
dissolving into "publish it and let them collect it."

---

## Built, not yet served

Implemented and checked against the live network, but our servers do not hand
them to anybody yet. Listed apart from the deferred terms below because the
distinction is real: the hard part of each of these is done.

**Merkle Search Tree** *(ATProto)* — how a repository is structured internally so
that a fingerprint of the whole thing can be computed cheaply. Implemented, and
validated by rebuilding real strangers' repositories from their records alone —
up to 205,922 records and 54,922 nodes — and getting the same names their own
servers gave them.

**CAR file** *(ATProto)* — the file format a repository is handed over in. Read;
not yet written.

**Commit** *(ATProto)* — your own signature over your whole cabinet, proving the
contents are yours and that your server has not quietly added anything. Built and
in use. An earlier version of this entry called it "the one substantive gap,"
which it was at the time and no longer is.

What is left for full interoperability is not building these but handing them
over on request, which is what a **PDS** does and ours does not do yet.

---

## Deferred

Terms that will appear when full ATProto interoperability arrives, listed so they
are not mysterious when they do.

**Firehose** *(ATProto)* — the live stream of everything changing across the
network, which other servers subscribe to.

**Label** *(ATProto)* — a third party's annotation on content, used for
moderation. The nearest thing ATProto has to an attestation, and it lives with
the labeller rather than with the subject.
