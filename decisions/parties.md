# Being here with other people

**Historical.** How a party stopped being a thing your own server held and
became a thing a venue offers, written as it was found. Two positions were held
confidently and abandoned, and one of them was abandoned because of a cheating
vector nobody had thought of — which is the useful part.

---

## What a party is

A few people who arrived at a venue together and stay in earshot of each other
while they wander between the experiences it offers. Invite-only. Its audio and
video supersede whatever the room they are in offers; its text sits alongside
the room's rather than replacing it.

The whole feature is one sentence of model: **people in a space can
communicate.** A lobby, a table and a party are the same kind of thing —
somewhere you can be — so posting a message to any of them reaches everybody in
it. That sentence was already latent in the prototype, which mounted one chat
component twice, at `/lobby` and at `/tables/{key}`, with the model noting that
"rooms are addressed by path, so the lobby and a table are the same kind of
thing." Naming it was most of the work.

## The first position it reverses: a party belonged to your domicile

The original idea was larger and better-sounding. A party would be held by the
server a person *lives* on, so that it followed them across the whole spatial
web: you and three friends stay together whether you are at one venue or four,
because the thing binding you is anchored to your identity rather than to
anybody's premises. "The party keeps them together, no matter what they are
doing on the wider web."

Three arguments supported it, and all three are still true:

- A domicile is the only server with a durable relationship to a person, so it
  is the only one that can hold something meant to outlive a visit.
- It is the only one that could vouch for who somebody's people are.
- It is the only one that could reasonably carry a standing operational cost on
  their behalf — a relay is *"ruinous as a requirement"* for a venue, which has
  no relationship with you, and merely expensive for the server you already pay.

### What broke it

A private voice channel between two people at a competitive table is an
earpiece.

The prototype's whole argument is a game of chess played between two people on
different servers, and a federated party would have put a second, inaudible
conversation into exactly that game — with the venue hosting it unable to see
that it was happening, because the party belonged to somebody else's server. The
experience being cheated at would have had no say and no visibility.

That was decisive on its own. Three further costs came off with it once the
position was abandoned, and they are worth recording because each was load-bearing
and none had been priced:

- **A relationship model.** Nothing anywhere in StreetMesh knows who anybody's
  friends are. A domicile knows who lives on it and nothing else. Federated
  parties needed that model, and it is a large surface with federation questions
  of its own.
- **A new capability.** Domicile and venue are the two, and several documents say
  so. A third would have been a real third thing rather than a configuration
  difference, which is the distinction `Home` and `Games` were dropped for
  failing.
- **Cross-server presence.** A party wants to show where its members are, which
  is the first thing that would ever have made a domicile want to know what
  somebody is doing *right now* — against a design whose whole claim is that a
  domicile holds records rather than surveillance.

The last one has a clean answer that survived into the venue-scoped version and
is worth keeping in view if this is ever revisited: **the client is the join
point.** A browser in two rooms can tell one where it is without either server
asking the other. No presence channel between servers, no venue reporting on
anybody.

## The second position it reverses: the experience decided

The replacement put parties at the venue and let each experience declare whether
it admitted them — chess says no, a 3D role-playing game says yes, a party
crosses between two experiences only if the destination allows it. That model
was worked out in some detail, including that the crossing rule had to be
unilateral rather than pairwise (a pairwise matrix grows quadratically as a
venue installs experiences, and no experience author can reason about the other
entries) and that a party passing through an experience that refuses them should
be *suspended* rather than dissolved.

### What broke it

Two things, and the second is the stronger.

**The knowledge is in the wrong place.** An experience author cannot know which
venue their package will be installed into, or what else will be installed
alongside it. An operator can read their own configuration. Putting the switch
with the author means asking somebody to make a judgement about a situation they
cannot see.

**The switch and the constraint that bounds it were in different hands.** How
many people can be in a party is decided by the media: peer-to-peer means
everybody uploads a copy of their stream to everybody else, and it stops working
somewhere past four. Which media driver a venue runs is already the operator's
decision, and deliberately so — it is the one choice with real infrastructure and
real cost attached. An experience-level party flag would have let a package
author switch on something the operator's infrastructure cannot carry.

## What replaced both

**Parties are on or off for the whole venue, by the operator's hand, and no
experience is consulted.** A venue with parties on and a competitive experience
installed has handed its players a private channel their opponents cannot hear;
that is the operator's call to make and their consequence to own.

The rest follows from that:

- **Invite-only.** Somebody already inside points at a name they can see in the
  room they are both in, and that person answers. This avoids the relationship
  model for a third time: an invitation is an act, here and now, rather than a
  query against a social graph. *Amended below — a code was added afterwards.*
- **One party at a time.** The invariant the feature rests on. Two would be two
  voice channels, which is precisely the hidden side channel superseding exists
  to prevent.
- **Voice and video supersede; text layers.** Superseding voice is a fact about
  ears rather than a policy — you cannot listen to two conversations — and it is
  what makes a party structurally unable to be a second live channel. Text is not
  like that: a party member cut off from the room's chat would miss whatever
  everybody around them is reacting to.
- **The roster shows it.** Somebody in a party is present at the table and
  unhearable there, and a person who cannot be told that is a person talking to a
  wall without knowing why. With no structural protection against side channels,
  making them legible is the whole of the mitigation — and a venue that allows a
  private channel has not thereby decided to hide it.
- **The venue caps the size**, and the cap is clamped to what the media can
  actually carry. Refused rather than degraded: a mesh that sags with each
  arrival is the failure nobody can diagnose, because everything goes on
  appearing to work.

A party is a second room, not a mode of the first. Somebody in one is in two at
once — the table they are at, and the people they arrived with — and the table
knows they are in a party while the party knows nothing whatever about the table.

## Where it lives

Entirely in the venue and the hub. **Nothing about a party is protocol**, and
that is the same reasoning media already follows: a server that hosts no
experiences needs none of it, and the protocol has to stay implementable by
somebody who only wants a domicile. Domiciles do not have comms, and this
decision left that true rather than bending it.

The one wire change is a claim on the ticket the venue already signs — the room
name of the holder's party, or empty. The hub reads it the way it reads every
other claim, and enforces without understanding why.

## What it costs

The scope. A venue-scoped party does not follow anybody to another venue, and
"the party keeps them together no matter what they are doing on the wider
spatial web" is now scoped to one operator's server. That was the poetic core of
the original idea and this version does not deliver it.

It is the right trade — the federated version needed a relationship model, a new
capability and cross-server presence, and it bought a cheating vector on the way
— but it is a trade rather than a free simplification. The door is not shut: a
venue-level party that works is exactly the thing that would be federated later,
and the client-as-join-point trick still applies if it ever is.

## The amendment: a word you can say out loud

Invite-only was stated above without qualification — *"there is no open door and
no code"* — and that lasted until the first time somebody wanted to get a friend
sitting next to them into a party. A party now also carries a short code, and
anybody who has it can join.

This is weaker and it is worth being exact about how. An invitation is an act
between two people who are both present: it is offered to a name the offerer can
see, and answered by the person it was addressed to. A code is a thing that can
be pasted into a message, forwarded, or read over a shoulder — the party cannot
tell how anybody came by it, and there is no moment where an existing member
approves the arrival.

What makes that acceptable rather than a reversal of the whole idea is how small
the blast radius is. A party holds four people at one venue. The code dies with
the party, admits nobody once it is full, and anybody inside can both see who
turned up and replace the code with a new one. The word itself avoids the
characters that sound alike, because the entire point is saying it across a
table rather than sending it.

Both ways in are kept, and the strict one is still the default the interface
leads with.

## What is still open

**Chat is polled, and should not stay that way.** Two seconds, asking a question
whose answer is almost always "nothing". The prototype polled because there was
nothing to push with; the server this lands in has Reverb configured, and the
number of things to poll grows with the number of spaces somebody is in — which
a party doubles by construction.

**Nothing enforces the mesh ceiling in the room.** The venue refuses to mint a
ticket past its cap, which is the authoritative place and the only one that
knows the number. The hub admits whoever holds a ticket, deliberately: the venue
decides who may be somewhere, and the hub checks only that the venue said so.

**There is no relay driver.** Until there is, the ceiling is a fact rather than a
setting, and a venue wanting a party of eight cannot have one.

**An experience cannot warn about itself.** The decision above is that
experiences get no say, and that stands. What is *not* settled is whether an
experience should be able to declare "I am unsafe with parties" as advice an
operator can read at boot and ignore — which would leave the decision exactly
where it is while removing the part that is silent and arrives late. The hazard
is real: parties get switched on for one experience, another is installed six
months later, possibly as somebody else's dependency, and nothing anywhere
notices. It is the same class of failure that made scopes declared rather than
configured.

**The 3D features are unbuilt and have already shaped this.** "Call the party to
me" tells you a party is a group rather than a channel: a channel does not know
where its members are and a group does. The roster carries each member's current
space for that reason, at a cost of one string, and summoning is later a message
rather than a retrofit. It also only means anything inside one operator's space,
which is a second argument for where this ended up.
