# Conformance

Executable vectors for the parts of StreetMesh that two independent servers must
agree on byte for byte. This directory, not any implementation, is what
"conforming" means.

```sh
node runners/verify.mjs
```

## Why these exist

StreetMesh spent two days failing to deliver records between two servers that
both believed they were right. The key was correct, the canonicalisation was
correct, and games settled or did not depending on whether they happened to
contain an empty string. It was found by measuring, not by arguing, and it would
have been found in seconds by a vector.

So: a claim about the wire that is not in this directory is an opinion. These
files are the arbiter, and they are deliberately language-agnostic — plain JSON,
no framework, no PHP — so that somebody writing a StreetMesh server in Go or
Rust can prove they conform without reading anyone else's implementation.

## What is here

| File | Pins |
|---|---|
| `encoding/dag-cbor.json` | Deterministic CBOR, including the map key ordering that decides every `did:plc` |
| `encoding/multikey.json` | Public keys as multibase multicodec, on all three curves in play |
| `identity/did-plc.json` | Deriving a `did:plc` from its genesis operation |
| `signing/jws.json` | Compact JWS with `alg` EdDSA, including a record carrying a blank field |
| `signing/p256.json` | ES256 signatures as raw `r‖s`, not DER |
| `lexicons/com.streetmesh.games.chess.json` | The first record schema |

## How they are produced, and why that is not circular

The vectors are **generated from the working PHP implementation** rather than
written by hand, because a hand-written fixture records what somebody believed
and a generated one records what two servers actually did.

That would be circular on its own, so two things break the circle:

1. **The identity vectors are real.** `identity/did-plc.json` holds the genuine
   genesis operations of live ATProtocol accounts, fetched from the public
   directory, alongside the DIDs the network already assigned them. Reproducing
   those is agreement with the world rather than with us — and because a DID is
   the hash of a DAG-CBOR encoding, it transitively pins the encoding too.

2. **The runner is a second implementation.** `runners/verify.mjs` is written in
   another language on another crypto stack — Node and OpenSSL rather than PHP
   and libsodium — from the specifications rather than by translating the PHP,
   and shares no code with what generated the vectors. It also re-signs the JWS
   from its claims and checks it lands on the same string, so the format is
   determined by the specification rather than by one language's quirks.

If the runner and the vectors ever disagree, at least one of them is wrong and
neither gets the benefit of the doubt.

## The two rules most likely to be got wrong

**DAG-CBOR map keys sort by length first, then bytewise.** That is RFC 7049's
canonical order, not the plain lexicographic order RFC 8949 later adopted and
most CBOR libraries default to. Backwards, and every DID you compute is wrong in
a way that presents as a signature problem.

**A signed document is verified exactly as received.** No trimming, no
null-coercion, no re-ordering, no re-serialisation. `signing/jws.json` contains a
record whose `detail.pgn` is an empty string precisely so that an implementation
which tidies its input cannot pass. Web frameworks do this by default; ours did.

## Regenerating

From the prototype, while it remains the reference implementation:

```sh
cd ../../Chess/server && ./sm chess sm:conformance
```

Regenerate deliberately, not habitually. A vector that changes because an
implementation changed is the implementation announcing a breaking change, and
should be read as one.
