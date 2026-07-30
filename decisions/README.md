# Decisions

Why StreetMesh is shaped the way it is.

The guides describe what the protocol is. These describe what was decided,
what it was decided instead of, and what evidence settled it — which is the part
that gets lost first and is most expensive to reconstruct, because a conclusion
without its reasoning gets re-litigated by the next person to find it
surprising.

| | |
|---|---|
| [`architecture.md`](architecture.md) | Twelve numbered decisions about the system as a whole, the framings that were rejected, and the constraints everything else has to live within |
| [`identity.md`](identity.md) | Why identity is `did:plc`, why records are JWS, who signs what, and what each of those costs |
| [`wire-surface.md`](wire-surface.md) | What actually crossed the wire in the first working implementation, measured rather than remembered, and which parts of it were accidents |

## How to read them

**These are historical.** They record decisions at the moment they were made,
against a prototype that has since been taken apart. Where a document describes
an endpoint, a class or a file, it is describing what existed when the decision
was taken — not instructing anybody to build that. The specification and the
conformance vectors are the current authority; these say how it got that way.

Two habits they were written with, and worth keeping:

**Measured, not remembered.** Where a document reports behavior, it reports what
was observed by running something — two servers exchanging real records, real
identifiers derived from the live network, a diff that did or did not appear.
Several conclusions here reversed an earlier position that had been argued
confidently and was simply wrong.

**Accidents are named as accidents.** A working implementation accumulates
decisions nobody made — a field added under deadline, a vocabulary that
generalized halfway, a name that stuck. `wire-surface.md` lists those explicitly
so they can be dropped rather than inherited, since the failure mode for a
protocol extracted from a prototype is canonizing whatever the prototype
happened to do.
