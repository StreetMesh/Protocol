# Audio and Video

**Historical.** How audio and video were built in the first implementation,
written as it was found and kept because most of it is not about media at all —
it is about what a browser costs you when you deviate from what the platform
already does. The section that matters most is §9's *mistake worth recording*,
where an architecture was shaped to make a symptom unreachable rather than to
find out what caused it, and every fix compensated for the shape instead of
correcting it.

The code this describes did not survive extraction. The design did: the split
between deciding and carrying, media following the seats rather than the room,
and the driver seam are all still the arrangement. The browser half was written
around one prototype's table and is a rewrite rather than a move.

Read alongside [`parties.md`](parties.md), which is what finally made the
participant ceiling here matter, and [`realtime.md`](realtime.md), which settles
the one direction of trust this document assumes.

**Status when written:** Built, peer-to-peer. The handshake goes through the host; the media goes
directly between the two browsers and touches no server. The LiveKit driver is a seam
that throws with instructions.
**Date:** 2026-07-29
**Verified:** two players, Safari and Chrome, on one machine — video crosses in both
directions and survives a reload. Audio, and any two networks that cannot reach each
other directly, are both untested. See §10.

---

## 1. Where it sits

Media is the purest hot-path thing in the system. A stream is worthless one second
later, is never journalled, and never appears in a signed record. By the rule the
two halves already follow — *does it end up in a record?* — all of it belongs to the
realtime side.

But *permission* to have media is a question about people, and people are the host's
business. So the split matches the one already in place:

- **The host decides and authorizes.** Who may speak and be seen in a given place,
  and it mints the short-lived credentials that make that possible. The same shape as
  room tickets: the host already knows who you are, so it signs a permission slip.
- **The realtime half carries presence** — who is here, and where their pointer is.

The handshake was expected to go through the realtime half too, as hot-path traffic.
It does not, and §9 says why: it is not gameplay, it is a few messages that stop for
good once two browsers have found each other, and the room's transport is tuned for
the opposite of that. It goes to the host over ordinary HTTP.

Nothing about media touches the durable half. No recording, ever.

## 2. Media follows the seats, not the room

A room and a media session are not the same set of people. A chess table may hold
spectators; the conversation is between the two players.

So membership of a media session is decided by the host, per experience, and handed to
the realtime half as a claim in the ticket it already issues. The room enforces what it
is told and understands nothing about why — it never learns what a seat means, only
that this participant may exchange media with that one.

That keeps every policy question in one place. "Spectators can listen but not speak"
becomes a change to what the host asserts, not a change to the room.

## 3. Where the media flows is a driver

The same shape as where the rooms run:

```php
'media' => [
    'driver' => env('SM_MEDIA_DRIVER', 'peer'),

    'hosts' => [
        // 'peer' has no entry: browsers talking directly needs nothing configured
        'livekit' => ['url' => ..., 'key' => ...], // a media server relays
    ],
],
```

`peer` deliberately has no configuration block. An early sketch gave it one, for the
addresses it uses to get through a router. Those are a property of peer-to-peer rather
than a decision an operator makes, and a knob nobody has a reason to turn is one more
thing to get wrong before anything works at all.

**peer** — every participant connects to every other. No media infrastructure at all
beyond NAT traversal. Each client uploads a copy of its stream per peer, so it stops
being viable somewhere around four people. For two players at a table it is ideal, and
it keeps the minimum viable venue runnable by one person on one machine — the property
this architecture keeps having to defend.

**livekit** — everyone publishes once and a media server forwards. Scales to a plaza.
Real infrastructure, real cost, and a standing operational burden for every venue that
wants voice. Worth it when a lobby needs to hold a crowd; ruinous as a requirement.

Starting with `peer` and shaping the seam for `livekit` means a venue that only hosts
two-player tables never runs a media server, and one that wants a plaza can.

## 4. The wrinkle: this driver reaches into the browser

Where the rooms run is invisible to the browser — it speaks Colyseus either way. Media
is not like that. Peer-to-peer means `RTCPeerConnection` and hand-rolled signalling;
LiveKit means their client library and no signalling of our own. **The driver changes
what the browser does**, so the abstraction has a client-side half as well as a server
one.

The way to keep that from leaking into every venue's UI is to make the component's
contract be *tiles and controls*, not *connections*:

```blade
<x-stage :engagement="$table" />
```

The component asks the host for credentials, gets told which driver is in play, and
loads the matching implementation. What a venue's UI sees is a list of participants
with streams attached, and mute and camera controls. A 2D sprite venue and a 3D one
would draw those completely differently while sharing everything below.

Two implementations behind one contract is a real cost, and it is the honest price of
letting an operator choose. It is worth paying once, here, rather than in every venue.

## 5. NAT traversal

Some pairs of networks cannot reach each other directly, and STUN alone will not save
them. A relay is the answer *when that happens* — it is not a prerequisite, and this was
written as though it were.

Peer-to-peer is the goal, not a stage on the way to something else. A relay is a fallback
for the pairs it fails for, and it arrives as a driver holding one credential rather than
as configuration every venue must fill in before anything works. Nothing about it is
built, and nothing needs to be until a pair of real players cannot connect.

Worth keeping in view for when it is: relayed media is billed to the venue, so that
venue's cost scales with conversation. Direct media costs the venue nothing at all,
which is the strongest argument for keeping it the default rather than the fallback.

## 6. Consent

Media is opt-in, per session, never automatic. Nothing acquires a microphone because
you walked into a room. There is an unmistakable indicator while a device is live, and
turning it off is one action and always available.

This is not only manners. A venue is somebody else's server, and the whole argument for
delegation being narrow and revocable applies more sharply to a microphone than to a
game record.

## 7. Not in scope

- **Recording.** Not now, and not without a design that treats it as a durable artefact
  with consent from everyone in the room — which would make it the host's business and
  a signed record, not a media feature.
- **Lobby media.** Deliberately deferred; it is the experiment that will justify the
  LiveKit driver.
- **Spectator audio.** The claim model allows it later without changing the room.

## 8. Protocol

None of this belongs in the Protocol. A server that hosts no experiences needs no media,
and the Protocol must stay implementable by someone who only wants a domicile. Media is
a Presentation Profile concern, in the same bracket as which room library a venue speaks.

## 9. What it turned into

The shape held. Three seams, one per half plus the browser:

- `app/StreetMesh/Media/` — `MediaHost`, `PeerMedia`, `LiveKitMedia`, `MediaManager`,
  behind the `Media` facade. Same manager/driver pattern as `Realtime`.
- `TableTicketController` decides, once, whether the visitor holds a seat. That single
  conclusion becomes both the `media` claim in the room ticket and the decision to mint
  credentials — there is no second question to ask and no second request to make.
- **The realtime half carries none of it.** An earlier cut relayed the handshake through
  the room and put media flags in the room's state. That was wrong twice over: it is not
  gameplay, and the room's transport caps a message at 4KB — fine for a move, and about
  half of what a video offer needs, so enabling a camera closed the socket. The handshake
  now goes to the host over ordinary HTTP, and the room is back to knowing nothing about
  media.
- `Mailbox` holds the few notes each side leaves the other, for two minutes, keyed by who
  they are for. Both people are writing at once during a handshake, so it takes a lock —
  read-then-write loses notes exactly when it matters.
- `resources/js/media/` is the browser half, five modules with one job each: `devices`
  (the camera and microphone), `peer` (one connection), `signals` (the box), `stage`
  (who we should be connected to, and what the page shows), `log`. `stage` mixes into the
  component that already owns the room, so there is one ticket and one socket.
  `resources/views/components/stage.blade.php` is the part a venue replaces.

### The mistake worth recording

The first working version of `peer.js` avoided renegotiation entirely. It declared empty
audio and video lines before anybody had a camera on, and turning one on swapped a track
into a sender that already existed. That was a reaction to a Chrome error during an early
renegotiation which was never diagnosed — the architecture was shaped to make the error
unreachable rather than to find out what caused it.

It cost more than it saved, and each cost arrived disguised as a separate bug: lines whose
direction had to be widened by hand, which sent audio one way only; lines matched by
position, which produced answers the other side rejected; and — the one that took longest
— lines carrying no track, and therefore no stream name, for which **WebKit raises no
track event at all**, so Safari never learned the line was there. Every fix compensated
for the shape instead of correcting it.

What is there now is the ordinary pattern, and it is ordinary on purpose. Perfect
negotiation, as the specification authors describe it. Tracks are added and removed;
the browser decides when that needs negotiating and says so; both sides may start at once
and one of them gives way. Addresses trickle. A connection that cannot find a route is
asked to find another rather than rebuilt, which keeps everything the two sides already
agreed about what they are sending.

**Where the platform has an opinion, follow it.** Every deviation here was mine, none was
justified, and each one cost a day.

Resolved along the way:

- **One capture, always.** Asking WebKit for a camera while it holds a microphone ends the
  microphone's track rather than adding to it, so adding a kind re-asks for everything
  wanted in a single call. A sender left holding a dead track goes silent with the button
  still lit and nothing to say why.
- **Every note names the attempt it belongs to.** Perfect negotiation settles two offers
  arriving on one connection. It has nothing to say about an answer to an offer made by a
  connection that has since been thrown away — which is what a reload on the other side
  leaves in the box, and applying one to its replacement puts that connection into a state
  it never recovers from.
- **Presence comes from the tracks, not from the room.** Whether somebody's camera is on
  is answered by whether their video track is arriving and unmuted, which is the truth
  rather than a report of it — and it needs no state anywhere.
- **Diagnostics go to the console, never the page.** A connection state, a close code and
  a browser exception are what an engineer reads while fixing this; on screen they turn a
  player into an instrument reader for a machine that already knows. The page gets written
  prose or nothing. This is also what made the last bug findable — two log lines named it.
- **Device UI** is the venue's. The component owns two toggles and the tiles; anything
  richer is a venue replacing one Blade file.

## The amendment: presence left too

§1 says the realtime half carries presence, and for an experience it still does —
who is at a table, and where their pointer is, is state a room agrees on.

For a **party** it no longer does, and the reasoning that moved the handshake in
§9 turns out to have covered this as well. A room hands out an identity of its
own and takes it back when the socket drops, so a browser that blinked read to
everybody else as one person leaving and another arriving, and every peer
connection was rebuilt for somebody who had not moved. That is the same mistake
as relaying the handshake: asking a process built to agree on state a question
about a conversation.

A party's presence now rides on the poll that was already carrying its notes,
and the browser names its own connection rather than being issued one. See
[`parties.md`](parties.md).

The rule in §1 is unchanged in spirit and sharper in wording: **the host decides
who may speak and who is there to speak to; the realtime half carries what a
room has to agree on.** A party has nothing a room has to agree on.

## 10. Still open

- **Audio is untested.** Video crosses both ways between Safari and Chrome; nobody has
  yet pressed Speak.
- **No relay, and NAT traversal is unproven.** Both browsers were on one machine, so they
  met over addresses on that machine and nothing harder was ever attempted. Two players
  whose networks cannot reach each other directly are told so and nothing more can be done
  for them yet. Worth building when it happens to somebody real.
- **`peer` advertises a participant limit that nothing enforces.** `PeerMedia::CEILING`
  and the `limit` in the credentials are read by no one. A mesh that quietly degrades with
  each arrival is the failure nobody can diagnose, so this should refuse rather than sag —
  but the room it would protect does not exist yet.
- **The browser half is tested by a harness that is not in the repository.** Two stages
  run against a fake connection and a fake box, covering the cases that actually broke:
  each direction of video, microphone-then-camera, reload, a stale answer, a failed route.
  It has caught five real bugs. There is no JavaScript test runner here yet, which is the
  only thing standing between it and being permanent.
- Does the host advertise media capability in discovery, so a visiting client knows what
  to expect before joining? Leaning yes, at the profile level.
- Collection is polled — twice a second while connecting, once a second after. Settled is
  not idle: a camera turned on is a fresh negotiation arriving unannounced, so the slow
  pace is what somebody waits through before they are seen. If the lobby ever gets media,
  the number of boxes to poll grows with the room and that will want revisiting.
