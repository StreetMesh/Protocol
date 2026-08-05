# Whether a hub may speak, and what it costs

**Historical.** How the one exception to one-way trust was settled, written as
it was found. The conclusion reverses a position stated confidently in the
glossary — that a hub holds no credential at all — and the reversal is the
useful part.

---

## The position it reverses

Every exchange between a venue and its hub was one-way by design, and the design
was deliberate. A **ticket** is signed by the venue and merely verified by the
hub. A **result** is asked for by the venue rather than announced by the hub. The
glossary put it plainly:

> That is also why there is no shared secret anywhere on the join path. A hub
> holds no credential at all: it cannot impersonate the venue, cannot assert
> anything back to it, and is worth nothing to steal.

That is a good property and worth defending. A hub is the least trustworthy thing
in the arrangement: it runs somebody else's game logic, it is reachable by every
participant, and it holds the live state of everything happening at a venue. The
less it can assert, the less a compromise of it is worth.

## What broke it

Asking works only while there is somebody to ask on your behalf. Two moments are
not like that, and both are ordinary rather than exotic.

**A table empties.** The last person leaves, the room is disposed, and the venue
has no reason to ask about a room it will never hear of again. Anything counting
occupancy goes on counting people who left.

**A game ends after everybody has closed their tab.** This is not an edge case;
it is how most games of chess actually finish. The browser was the only thing
that knew to tell the venue, and by the time it matters there is no browser. The
room is disposed shortly afterwards and what happened is gone for good — no
record for either player, and a gathering left open in the venue's database
forever.

Both were reproduced before anything was built. A game played to checkmate with
both clients disconnecting settled nothing, and the venue could not have known.

## What was considered

**Poll.** The venue asks every open gathering on a timer. Correct and wasteful,
and the interval decides how long a finished game goes unrecorded. Rejected: the
thing being polled for happens perhaps twice an hour per table.

**Push as a hint, pull for the truth.** The hub says only "something changed at
room X" and the venue then asks. Attractive because it needs no credential: a
forged hint costs one request. Rejected on the second reading — the venue would
be pulling from the same hub whose word it declined to take, so the ceremony buys
nothing except a round trip. The trust is identical; only the choreography
differs.

**A key for the hub.** It signs, the venue verifies, nothing is shared. This is
the right answer and it is not free: the hub becomes a thing with a private key
to provision, protect and rotate, deployed on infrastructure a venue operator may
not run. It is also the thing the whole ticket design exists to avoid.

**A shared secret.** Chosen.

## The decision

**A hub may assert to a venue, over a shared secret, and only about rooms that
venue opened.**

Three constraints keep it small.

**Scope.** The venue believes the state of a room and the result of a gathering.
Nothing about *who anybody is* travels this way — that arrived in a ticket the
venue signed itself, and identity never comes back over this channel.

**The address is derived, not configured.** Every ticket names the venue that
signed it, and the hub already resolves that DID to fetch the verifying key. So
where to call back arrives with the authority that opened the room. A hub serving
several venues cannot be talked into announcing to the wrong one, and there is no
setting that can drift from reality.

**Rotation is designed in.** The secret is a list, newest first. Add the new one,
deploy both sides in either order, then remove the old. A single value replaced
in place has a window where the two disagree, and that window is an outage.

The venue refuses to serve without a secret. The failure without one is silence —
results never arrive, nothing errors, and the venue looks perfectly well — so it
has to be loud and it has to be at boot.

## What this costs, stated plainly

Everything else in StreetMesh is trusted because of a signature anybody can
check. This is trusted because two servers were told the same string. A stolen
secret lets somebody tell a venue that a game ended and how — which the venue
will sign into the participants' records.

That is the actual exposure, and it is worth weighing against what it replaces:
without it, results are lost routinely rather than forged rarely.

The upgrade path is open. Giving the hub a key of its own turns this from a
shared secret into a signature and changes nothing else about the shape: the same
announcement, the same scope, the same derived address. Nothing here depends on
the secret being a secret rather than a key.
