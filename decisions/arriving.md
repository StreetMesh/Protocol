# Arriving as somebody you are not

**Historical.** Found in production, three days before it would have been found
by strangers. A venue asked a domicile about one person, was answered about
another, and wrote both down in the same row. Nothing in the exchange was
malformed and neither server did anything the specification forbids.

---

## What happens

Somebody types a handle at a venue's door. The venue resolves that handle to an
identity — it has to, to learn which server can grant permission over it — and
sends them there with `login_hint` set to the handle they typed.

`login_hint` is a hint. Nothing in OAuth obliges the far server to honour it,
and a domicile has no way to. It authenticates whoever is signed in to it, which
is the only question it can answer, and returns that identity as `sub`.

So the two ends answer different questions. The venue asks *"is this
mrslandingham?"* and the domicile answers *"this is whoever is signed in here."*
Most of the time those coincide. When they do not, nothing says so.

## What it costs, if nobody checks

The venue holds two facts that disagree: the handle it was given, and the
identity it was handed. Everything a person *sees* comes from the first, and
everything the venue *does* keys on the second.

- Anybody can appear at a venue under anybody else's name. They need no
  credential belonging to that person — only one belonging to themselves.
- A record signed on their behalf is written into a stranger's repository,
  because the identity is what addresses a repository and the handle is only a
  label.
- Every screen agrees with the impersonation, so there is nothing to notice.

That last one is why this sat undiscovered. The symptom that eventually surfaced
was two browsers sharing a party, which points nowhere near the cause.

## What was decided

**A venue keeps the identity it resolved at the door, and refuses a token issued
for any other.**

The value already existed — resolving the handle is how the venue found the
authorization server in the first place — and was discarded immediately after
use. Keeping it costs nothing and makes the comparison possible.

## What it was decided instead of

**Adopting whoever came back.** Take `sub` as the truth and rewrite the handle to
match. Rejected: it seats a person at a door they did not open. Somebody who
typed a friend's handle by mistake would silently become themselves at a venue
they never chose to enter under their own name, and a shared computer would hand
one person's session to the next.

**Keeping the handle and ignoring `sub`.** Rejected outright. That is the venue
asserting something the domicile never said, and it is the impersonation, kept
deliberately.

**Requiring domiciles to honour `login_hint`.** Rejected as unenforceable. A
protocol cannot make a server answer a question it was not asked, and any venue
that trusted the requirement would be trusting every domicile it has never met.
The check belongs where the mismatch is detectable, which is the side that knows
what it asked.

## What settled it

A password manager. Two accounts were stored with distinct usernames and the
same email in a second fill field, so signing in as one person produced the
other. No malice, no malformed request, no bug in either server — an ordinary
autofill was sufficient to impersonate somebody at a venue.

That is the argument against treating this as an edge case. The cheapest
available path to impersonation was a form filling itself in.

## Where it does not belong

Not in [`conformance/`](../conformance). Nothing here is a disagreement about
bytes, and both servers can be byte-perfect while the exchange still ends in the
wrong person. Conformance vectors pin what two servers must agree on; this pins
what a relying party must do with an answer it agrees with completely.

## Still open

**Whether a venue should say which identity it expected.** The refusal names
both, which is what makes it actionable. Whether that leaks anything worth
protecting — it tells whoever is refused which identity a handle belongs to,
which is already public in a DID document — has not been argued properly.

**Nothing about refresh** — it turned out to be covered already. A refresh is
exchanged through the same code that keeps a first token, so a domicile that
answered a refresh with a different identity is refused on the same grounds.
That was luck rather than design, and it is written down here so the next person
to reorganise that path knows what they would be removing.
