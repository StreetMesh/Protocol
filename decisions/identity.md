# Identity, signing, and who says what happened

**Historical.** The record of how identity and record signing were settled,
written as the questions were answered rather than afterwards. Every finding
below was demonstrated — against two live servers, and against real identifiers
fetched from the public network — rather than argued.

Three questions gated everything else: whether an identity is a DID and which
method, what a record is signed as, and who authors it. The conclusions are now
implemented and pinned by conformance vectors. The reasoning is here because
several of these reverse a position that had been stated confidently and was
wrong, and the reversals are the useful part.

---

## Question 2 first, because it is unambiguous

**Adopt compact JWS. Delete `Canonical`.**

Our scheme signed a PHP array, sent JSON, and had the verifier re-derive the
bytes from what it decoded. A JWS signs the encoded payload itself, so there is
nothing to re-derive.

Put the record that broke settlement through the exact middleware that broke it:

```
record    yjcawfeo:black          (detail.pgn = "")
kid       did:web:chess.test#streetmesh
length    901 bytes, one opaque string

after ConvertEmptyStringsToNull + TrimStrings   unchanged
verifies                                        yes
pgn survives as                                 ''
```

The empty string is *inside* the signed payload, so nothing between two servers
can reach it. This is not a fix for the bug we had — it is the removal of the
category.

Consequences worth stating:

- **`Canonical.php` stops existing.** So does the canonicalization section of the
  specification, and the conformance vectors that would have pinned it. A rule
  nobody has to agree on is better than a rule everybody implements correctly.
- `RoomTicket` already worked this way and was never buggy; records did not and
  were. The codebase already contained the answer in one place.
- **Cost:** a stored record is an opaque string, so a domicile must decode it to
  display or index it. Store the decoded copy alongside and treat the JWS as
  authoritative.
- **Pin `alg`.** Accepting whatever the header claims is the classic JOSE
  footgun. `Jws::keyId()` refuses anything but `EdDSA`.

## Question 3 — who authors a record

**The record becomes resident-authored, carrying a venue-signed attestation.**

Acting as a server that holds nothing but the document — no OAuth client, no
registration, no StreetMesh endpoint:

```
kid says    did:web:chess.test#streetmesh
so resolve  https://chess.test/.well-known/did.json
key found   TMY5+57tFvQ2vJ30T67aK0MN…
verifies    yes
attests     win at chess.test
subject     alice@apartments.test
```

The venue's signature stands entirely on its own, needing only DNS and the
document. That is exactly the property required to nest it:

- **outer** — the resident's repo record. Their commit, their key. ATProto-native.
- **inner** — the venue's JWS. Their key, their DID. The attestation.

This resolves the trust-model mismatch flagged in `WIRE.md` §9: ATProto insists
a repo record is signed by its owner, and StreetMesh insists the venue is the
one asserting what happened. Both are satisfied by nesting rather than by
choosing.

### The consequence nobody asked for

If an attestation is a self-contained verifiable object, **the venue does not
have to deliver it.** It can hand the JWS to the player's browser, or publish
it, and the player's own server can collect it whenever it likes.

`Settlement`, `Settlement::owing()`, `sm:settle`, `KEEP_TRYING_FOR_DAYS`, the
`settled_at`/`settlement_error` columns and the hourly schedule all exist
because a venue must push to a server that might be down. Under this model
pushing becomes an optimization rather than the mechanism, and "still owed"
stops being a state the system has to track. That is a large simplification
arriving from a direction we were not looking in.

## Question 1 — is an identity a DID, and which method

**Yes to DIDs, and `did:plc` is the method.** Revised after a second pass: the
first version of this document said "not yet to a method," which was hedging.
Below is why did:web looked right, why it isn't, and what did:plc costs.

did:web fits, and produces documents any DID library reads:

```json
{
  "id": "did:web:apartments.test:%40alice",
  "alsoKnownAs": ["acct:alice@apartments.test", "https://apartments.test/@alice"],
  "verificationMethod": [{
    "type": "Multikey",
    "publicKeyMultibase": "z6MkjfYTQh3CHz84SH4cVYjFsojs9idB7S7VZzpb2of6QdwS"
  }],
  "service": [{ "type": "StreetMeshDomicile", "serviceEndpoint": "https://apartments.test" }]
}
```

`z6Mk…` is the standard Ed25519 multikey prefix; encoding is lossless across
200 random keys. And **the `home` field dissolves** — under did:web the subject's
page is the document's parent, so the thing we bolted on last week falls out of
the identifier for free.

### The finding that should stop us committing to did:web

did:web's identifier *is* its location. So:

| | identifier |
|---|---|
| alice, path-addressed domicile | `did:web:apartments.test:%40alice` |
| the same human, wildcard-addressed | `did:web:alice.apartments.test` |
| the same human, having moved | something else again |

One person, three identifiers, decided by an arrangement they did not choose.
That is the exact coupling `Uid` was written to avoid — and it quietly damages
the central claim, because a record about
`did:web:apartments.test:%40alice` describes an identifier she stops controlling
the day she moves. Her history fragments across every domicile she has lived at.

did:plc solves it, being location-independent with the handle as a mutable
pointer — at the cost of a directory Bluesky operates, which sits badly with the
introduction's praise of DIDs for *"identity verification without central
registries."* **That is a values decision, not a technical one, and it is yours.**

### did:plc, spiked properly

The identifier is the hash of the operation that created it, so it says nothing
about location. Implemented and **validated against production data** — DAG-CBOR
encoding, sha256, base32, first 24 characters — by re-deriving real DIDs from
their real genesis operations fetched read-only from the directory:

```
bsky.app        did:plc:z72i7hdynmk6r22z27h6tvur   ✓ reproduced exactly
atproto.com     did:plc:ewvi7nxzyoun6zhxrhs64oiz   ✓ reproduced exactly
jay.bsky.team   did:plc:oky5czdrnfjpqslsw2a5iclo   ✓ reproduced exactly
```

Three for three, which means the encoding is right rather than plausible. The
one rule worth knowing: DAG-CBOR sorts map keys **length first, then bytewise**
— RFC 7049's canonical order, not the plain lexicographic order RFC 8949 later
adopted. Get it backwards and every DID is wrong in a way that presents as a
signature problem.

And we can mint our own:

```
did            did:plc:45vsx3mflmaiw5ksoo73q6ff
rotation key   did:key:zDnaeoUNtnCBqBobNj5HdZYhswSX9czgLu6WZJnkV5JMU345S
signing key    did:key:zDnaenxaBUdnFoj1S6RXo2wE6tiv36wTrSjNMyr39YSncA1Mx
handle         at://alice.domicile.test
```

Not published — creating a real directory entry is a public act and needs asking
first.

### The bill: Ed25519 has to go

**A PLC operation may name keys only on secp256k1 or P-256.** Ed25519 is not
permitted anywhere ATProto-facing. Our `SigningKey` is libsodium Ed25519 from
top to bottom, so it cannot be the identity key.

Of the two permitted curves, **P-256 is the one PHP does without an extension**
(secp256k1 needs one). Verified: keygen, ES256 signing, verification, tamper
rejection and multikey round-tripping, clean across 100 keys. So this is a
morning's work rather than a blocker — with one trap worth recording, since a
reference implementation exists partly to save people the hour: PHP defaults
`private_key_bits` to 0 when it finds no `openssl.cnf` and then refuses to
generate anything under 384 bits, so an EC key needs a `private_key_bits` value
that is otherwise entirely ignored.

Ed25519 does *not* have to go everywhere. Room tickets, and anything else purely
internal to a StreetMesh server, can keep it. The constraint applies only where
ATProto has to read what we produce.

### The finding that is actually about values

A PLC identity has two kinds of key, and the difference decides whether any of
this is true:

- **signing key** — signs repo commits. Lives on the server you live on.
- **rotation keys** — can rewrite the DID document, including replacing the
  signing key and pointing the identity at a different server.

Rotation keys are what "you can move" *means*. If a domicile holds the only
rotation key, then a resident can leave only if their domicile cooperates —
which is precisely the arrangement StreetMesh exists to argue against, arrived at
by default rather than by decision.

**So: a resident must hold a rotation key of their own.** That is a protocol
requirement, not an implementation detail, and it belongs in the invariants.

It also lands a real problem in `Laravel-Domicile`'s lap. A passkey cannot do
this — WebAuthn will not sign an arbitrary payload of our choosing — so holding
a rotation key means a recovery phrase or an exported key file, and a UX for
people who will lose it. Worth knowing now rather than in Phase 5.

## The alias mechanism — handle resolution

A DID is unreadable on purpose, so something has to keep it off the screen. That
something is **not did:web**. did:web is an alternative *method* — a did:web
identity and a did:plc identity are two identities, not two names for one.

The alias is the handle, and it has to work in both directions:

```
alice.domicile.test  ──→  did:plc:…      the domicile says so
did:plc:…            ──→  at://alice…    the identity says so
```

Either alone lets somebody hang a familiar name on a stranger's identity, so
both are checked. Demonstrated against a live handle:

```
handle                atproto.com
resolves to           did:plc:ewvi7nxzyoun6zhxrhs64oiz
document claims back  at://atproto.com          ✓ both directions agree
```

Resolution tries `https://<handle>/.well-known/atproto-did` first and falls back
to a DNS TXT record at `_atproto.<handle>`. The well-known form is preferable
because it needs no zone access — a domicile that can serve a host can publish
it, which is not true of a TXT record.

### This decides the addressing question

Run the same thing against our own domicile and it fails, correctly:

```
handle       alice.apartments.test
             [alice.apartments.test] does not resolve to an identity.
```

**An ATProto handle is a domain name.** A domicile that puts residents on paths
has no hostname to give them, so it cannot offer handles at all without
publishing a DNS TXT record per resident. Wildcard addressing has stopped being
one of two equal choices and become the one that works.

The prototype supports both shapes and treats that flexibility as a feature.
For ATProto interop it isn't one, and `WIRE.md` §1 should be read in that light.

## Handle shape — not the fork it looked like

`WIRE.md` §11.2 framed this as a decision. The spike says it mostly isn't:
`alsoKnownAs` carries both forms at once, and `acct:alice@apartments.test` is an
existing URI scheme for a user-at-host address — so our email-shaped address
needs no scheme of its own.

Recommendation: **keep `alice@apartments.test` as the display form.** It is
already in the UI, it reads as a person at a place, and it distinguishes people
from servers, which a bare hostname cannot. Add the domain form to
`alsoKnownAs` when ATProto handle interop matters. Nothing is foreclosed.

---

## Decisions, for the record

1. **Records are compact JWS, `alg: EdDSA`, `kid` naming a DID verification
   method.** `Canonical` is deleted rather than specified.
2. **A record is resident-authored and carries a venue-signed attestation.**
   Delivery becomes an optimization; re-examine `Settlement` before porting it
   into Core.
3. **Identity is `did:plc`, with `did:web` supported as the alternative** — which
   is ATProto's own arrangement. Identifier is split from name: the DID is
   permanent, the handle is changeable and points at it.
4. **`alice@domicile.test` stays the display form, over a hostname handle.**
   The underlying handle must be `alice.domicile.test` because ATProto handles
   are domain names; the `@` form is a rendering of it, carried alongside in
   `alsoKnownAs` as an `acct:` URI. **Path addressing cannot carry a handle** and
   is therefore out for any domicile wanting interop.
5. **No third-party ATProto library.** Everything here — DAG-CBOR, base32,
   multikey, base58btc, P-256, JWS, handle resolution — is written against PHP's
   own extensions, and `composer.json` was not touched. See "On dependencies".
6. **Identity keys become P-256.** Ed25519 stays for anything that never leaves
   a StreetMesh server, such as room tickets.
7. **A resident holds a rotation key of their own.** Otherwise moving out
   requires the domicile's permission, and the central claim is false.
8. **One checkout per site.** The multi-instance arrangement is deleted rather
   than carried forward — see `WIRE.md` §10.
9. **Option C: ATProto identity now, repo-shaped store, PDS after v0.** Full
   interoperability is the destination; it does not get to delay an end-to-end
   working Chess on a stable Core. See below for what keeps that honest.
10. **A game result is public. A message, a venue's chat, and who was in a room
    with whom are not.** Public is irreversible — a record replicated out of a
    repo cannot be recalled — so the split is decided before anything is written
    rather than discovered later.

---

## What "repo-shaped" has to mean

Option C is only real if the store's *semantics* already match a repo, so that
adding MST, CAR and a firehose later is additive rather than a rewrite. Left
vague, "we'll add a PDS later" becomes "we rewrote the record layer." So it is
a constraint list rather than an intention:

1. **A record is addressed by collection and key** — `com.streetmesh.chess.game`
   plus a record key, not an auto-increment id. The NSID is the schema's name and
   the vocabulary layer Components has to define anyway.
2. **Records are immutable.** Nothing is edited in place. A correction is a new
   record that supersedes an old one.
3. **Records reference other records** by collection and key. Needed for
   supersession, and — see commerce below — for refunds, disputes and anything
   else where the second fact is about the first.
4. **Record keys sort by time.** ATProto's TID format gives ordering for free;
   inventing our own means re-keying every record on the day we adopt theirs.
5. **Every record declares its visibility, and it is not a column somebody can
   flip.** Public records are repo-eligible; private ones can never be, and no
   code path may promote one. This is the guarantee that keeps decision 10 true.
6. **A record body is opaque to the database.** No foreign keys into it, no
   queries against its interior. Anything needing an index gets a projection
   alongside, never a join into the record.

Held to, a PDS becomes a second reader over the same store. Not held to, it
becomes Phase 9.

**Explicitly not in v0:** Merkle Search Trees, CAR files, commit signing,
`com.atproto.sync.*`, the firehose. Those are the price of interoperability and
they are worth paying — after Chess works end to end on a Core that does not
move under it.

## Still open, and now sharper

- **Key rotation and history.** A DID document publishes today's key; a record
  signed years ago needs the key that was current then. did:plc is much better
  placed here than did:web, because the audit log *is* the history — every
  operation is retained and timestamped, so a verifier can ask which key was
  valid when. Nothing implements that yet, and it is now the largest untouched
  gap.
- **Rotation key custody.** Decided in principle above; the UX is unsolved and
  belongs to `Laravel-Domicile`.
- **Handle verification.** A handle must prove the domicile agreed to host it.
  ATProto does this with a DNS TXT record at `_atproto.<handle>` or a
  `/.well-known/atproto-did` endpoint, which is a small amount of work we have
  not done.
- **PHP library depth.** We hand-rolled DAG-CBOR, base32, multikey, P-256 and
  JWS in an afternoon and validated all of it, so the gap is real but shallow at
  identity level. Repo-level ATProto — MSTs, CAR files, commit signing — is a
  much larger surface and remains unmeasured. Phase 1 should measure it before
  Phase 3 depends on it.

---

## On dependencies

Nothing in this spike adds a package. `composer.json` and `composer.lock` are
byte-identical to where they were before it started, and the only imports across
the whole `Did/` namespace are our own classes, Laravel's `Http` facade and SPL
exceptions.

What it rests on instead are PHP's bundled extensions — `openssl` for P-256,
`sodium` for Ed25519, `gmp` for base58btc arithmetic, `hash` for sha256. Worth
separating those from "a dependency": **we are not implementing cryptography.**
OpenSSL does the mathematics. What is hand-written is encoding and format
conversion — DER to raw signatures, point compression, multicodec prefixes,
base32, DAG-CBOR — which is exactly the sort of thing test vectors settle, and
which we settled against real production DIDs.

For the identity layer this is the right call and the ecosystem agrees by
absence: there is no mature PHP ATProto library to depend on, and a reference
implementation resting on an unmaintained wrapper would be a worse artifact than
one that owns its own primitives.

Where the calculation changes is **repo-level ATProto** — Merkle Search Trees,
CAR files, commit signing, sync. That is a much larger surface than identity,
easy to get subtly wrong, and not something an afternoon settles. Two things
follow:

- Phase 1 should measure that surface before Phase 3 depends on it.
- It may not be needed at all. If a domicile *is* a PDS, it is unavoidable. If a
  domicile merely federates ATProto identity while keeping records in its own
  store, none of it is required. **That scope question is unresolved and is worth
  answering before anybody writes an MST in PHP.**

One caution, stated plainly: signature format conversion is crypto-adjacent, and
bugs there are a real class of vulnerability rather than a correctness nuisance.
`P256::derToRaw` and its inverse are the two functions in this spike that most
deserve conformance vectors of their own.
