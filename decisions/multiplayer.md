# Multiplayer — Colyseus

**Historical.** The first account of the two halves and the line between them,
written against the prototype and kept whole. It is the earliest of these
documents and the broadest, and parts of it have since been revised by ones
written later — read it for §1's boundary, §3's authority and §4's trust in both
directions, which are the sections that turned out to be about the architecture
rather than about one library.

Superseded in places, deliberately not edited:

- **§10, removing the shared secret**, was reopened and reversed.
  [`realtime.md`](realtime.md) is the current answer, and the reversal is the
  interesting part of it.
- **§5's "an experience ships a hub"** is gone. A server has at most one hub, the
  hub is generic, and experiences ship rooms installed into it —
  [`hub-runtime.md`](hub-runtime.md) records how that was found.
- **§6's room shape and §7's layout** are chess, not protocol. They are kept here
  for provenance rather than as instruction; the room they describe now lives
  with the experience that owns it.
- **§9's 4KB message cap** is why the media handshake does not go through the
  room. See [`media.md`](media.md) §9.

**Status when written:** Built. The first cut in §8 is working end to end.
**Date:** 2026-07-27
**Supersedes:** the Livewire-polling realtime approach in the earlier prototype.

**Verified:** two clients play through the room; illegal and out-of-turn moves are
refused by the room; cursors propagate; every move is journalled; the conclusion is
reported, signed by the host, and settled to both players' home servers. Killing the
realtime process mid-game with `kill -9` and restarting it rebuilds the room from the
journal with the correct position and turn.

**Version note:** pinned to Colyseus **0.16**, not 0.17. There is no 0.17 JavaScript
client — `colyseus.js` latest is 0.16.22 — and since the web client sets the capability
envelope, the client decides the version. Server and client share
`@colyseus/schema` 3.0.76 exactly. Revisit when a 0.17 client ships.

---

## 1. The boundary

**Every experience has two halves.**

| Half | Runs on | Owns |
|---|---|---|
| **Host** | Laravel (PHP) | Who may be here, seats, chat, the durable record, settlement |
| **Realtime** | Colyseus (Node) | The rules, live authoritative state, moves, presence |

This is the decision, and it applies even where it looks like overkill. Chess is
turn-based and would survive an HTTP round-trip per move; the point is that the
boundary is the same for chess as it will be for a shooter, so nothing has to be
rearranged when the first latency-sensitive profile arrives.

Colyseus never touches the social layer. Chat, voice and video negotiation, presence
lists as *people*, identity, and delegation are all Laravel's. Colyseus does rooms,
matchmaking, rules, and the hot path.

**Colyseus is not a third party.** The Laravel process and the Colyseus process are
two halves of one StreetMesh server, run by one operator, in one trust domain. That
is what makes it acceptable for Laravel to sign a record describing a game it did not
itself adjudicate.

---

## 2. Where this sits in the layers

**Colyseus belongs to the Presentation Profile, not to the Protocol.**

If the Protocol required Colyseus, every server implementation would have to speak a
binary wire format defined by one library's source, and a second implementer in Go
would have to reimplement schema delta decoding before saying hello. That is the
"flagship implementation becomes the spec" failure mode, and it breaks the goal of a
server being standable-up in an afternoon.

- **Protocol** — discovery, addressing, identity, delegation, records, settlement.
  HTTP and JSON. Unchanged by any of this. A domicile with no graphical UI runs no
  Node at all.
- **Profile** — "to be in this experience together you speak Colyseus rooms, this
  schema, at the endpoint advertised in discovery." Versioned, with its own
  conformance suite.

Consequence worth keeping: adopting Colyseus raises the operating floor only for
servers that host experiences. It does not tax someone running a home server.

---

## 3. Authority, and the problem it creates

The room is authoritative over the rules. That is settled. It creates one real
problem which the design has to answer rather than ignore.

**A Colyseus room is memory. A record is forever.** If the Node process restarts
mid-game, an in-memory room takes the game with it — and the thing that eventually
gets signed and written to two other servers would be describing state that no
longer exists anywhere.

**Answer: the room journals to the host.** Every accepted state transition is
appended, through the host, to the engagement's durable state:

```
client --move--> room (validates, applies)
                  |
                  +--journal--> Laravel   (append move, persist state)
                  +--broadcast-> everyone
```

This buys three things at once:

1. **Crash recovery.** A room being created rehydrates from the host's journal
   instead of starting empty.
2. **An honest record.** Laravel signs a record containing the actual move list,
   because it has been holding it all along, rather than trusting a summary handed
   over at the end.
3. **A readable audit trail** for a game whose adjudication happened elsewhere.

Journalling every transition is fine for anything turn-based. A spatial profile would
checkpoint on an interval instead, and journal only the transitions that can end up
in a record. Positions are never journalled — they are never settled.

**The test for which side state belongs on stays:** does it end up in a signed
record? If yes it is journalled to the host. If no it lives and dies in the room.

---

## 4. Trust in both directions

Two processes, two credentials, and the record-signing key stays in exactly one place.

**Laravel → room (a ticket).** The client asks Laravel for permission to join. Laravel
— which has already resolved the visitor's federated identity — mints a short-lived,
single-use, room-scoped ticket asserting `{uid, name, seat, room, exp}`, signed with
the server's existing Ed25519 `ServerIdentity` key. Colyseus verifies it in
`static onAuth(token, options, context)`, which runs before a room instance exists and
rejects outright on a falsy return.

The key is already published at `/.well-known/streetmesh`, so **there is no shared
secret to distribute and no callback to Laravel on join**. And Colyseus never learns
what federation is: it does not know what a domicile is, or that
`alice.apartments.test` resolves anywhere. It only knows how to check a signature made
by the server it belongs to.

**Room → Laravel (a service credential).** Journal appends and the final outcome report
are authenticated with a credential belonging to the realtime process. Laravel remains
the only holder of the record-signing key — the room can assert what happened, but only
the host can sign a record saying so.

---

## 5. What moves, and what does not

Moving to TypeScript, into the room:

- `Rules`, `Proposal`, `Ruling`, `ChessRules` — rule validation, turn order, draw
  offers, conclusion detection
- The move list as live state
- `p-chess/chess` is replaced by `chess.js` on the room side

Staying in PHP:

- `Engagement` as the table — addressable, listable, joinable before any room exists
- `EngagementParticipant` — seats and identity, because identity is the host's job
- `Conclusion`, `Settlement`, `Record`, `ServerIdentity` — everything that gets signed
- Chat, lobby, directory, dashboard, revocation
- Ticket minting, journal intake, outcome intake

`Conclusion` is the contract between the halves and needs one shape both sides agree
on. That shape is a profile-level schema, not an implementation detail of either.

**The engagement primitive is now distributed.** Propose-and-validate happens in the
room; commit-and-settle happens in the host. The primitive is still one idea, but the
reusable part of it has become *the interface between the halves* — "here is who may
sit here" going one way, "this concluded, here is the outcome and its evidence" coming
back. Anything that would be settled between strangers, ecommerce included, plugs in
at that seam.

---

## 6. Room shape for chess

State synchronised to every client:

```ts
class Player extends Schema {
  uid: string          // alice.apartments.test
  name: string
  accent: string       // derived from identity attributes by the host
  seat: string         // "white" | "black" | ""  (spectators have none)
  connected: boolean
  cursorX: number      // normalized over the board, for live presence
  cursorY: number
  holding: string      // square currently picked up, "" if none
}

class ChessState extends Schema {
  moves: ArraySchema<string>   // SAN, append-only — delta friendly
  turn: string
  status: string               // open | active | concluded
  drawOfferedBy: string
  winner: string
  reason: string
  players: MapSchema<Player>
}
```

Messages from client to room: `move {from,to,promotion}`, `cursor {x,y}`,
`hold {square}`, `draw-offer`, `draw-accept`, `draw-decline`, `resign`.

Note that `cursorX/Y` and `holding` are the parts that are never journalled and never
settled. They are also the parts that make it feel like another person is there, which
is the whole reason for a room rather than a request.

---

## 7. Layout

The realtime half ships with the server codebase, as a sibling of the Laravel app:

```
server/
  app/  config/  routes/  resources/     Laravel — the host half
  realtime/                              Colyseus — the realtime half
    package.json
    src/
      index.ts
      auth/verifyTicket.ts               checks the host's Ed25519 signature
      host.ts                            journal + outcome calls back to Laravel
      rooms/ChessRoom.ts
      rooms/schema/ChessState.ts
  instances/                             per-instance config, unchanged
```

**Not `resources/`**, despite that being the natural Laravel instinct for "other
languages live here." `resources/` is compiled browser assets — Vite scans it, and a
long-running server process sitting in there is misleading about what it is. A sibling
directory keeps it unambiguously part of the codebase, which was the actual
requirement, without pretending it is an asset. It is a one-line move if that turns
out to be wrong.

One Node process serves every instance, resolving which server it is acting for from
the ticket's issuer — the same trick the Laravel side already uses with `HTTP_HOST`.

---

## 8. First cut

Presence, live cursors, and board interaction — the room is authoritative for moves
from day one, per §1.

1. `realtime/` app, one room type, ticket verification
2. Laravel: ticket endpoint, journal intake, outcome intake, service credential
3. Chess rules ported to `chess.js` inside the room
4. Board becomes a small JS component talking to `colyseus.js`; cursors and pickup
   render from room state
5. Settlement unchanged — it already works, and it is fed by the outcome report
6. `wire:poll` removed from the table; the lobby keeps polling for now

Chess is a good forcing function precisely because it does not need any of this. The
handshake, the journal, and the room lifecycle all get proven on something where a bug
is obvious and nothing is time-critical.

---

## 9. Consequences accepted

- **The live board is no longer PHP.** Moves go browser → Colyseus directly. Chat,
  lobby, tables, settlement, and records stay Livewire. This is the cost of putting
  rule authority in the room, and it is deliberate.
- **Chess rules exist in TypeScript only.** No PHP copy, so no drift — but Laravel
  signs a record it did not adjudicate. The journal is what makes that defensible.
- **One more daemon.** Node alongside PHP for any server hosting experiences. Multi
  process Colyseus wants Redis for presence; single process is fine to start. The
  minimum-viable-server cost should be measured here, not estimated.
- **WebSocket now, WebTransport later.** Colyseus 0.17 has a WebTransport transport,
  but it is explicitly experimental and built on `@fails-components/webtransport`.
  Room code does not change when it is flipped, so this is a config decision deferred
  rather than a design one.

## 10. Removing the shared secret

The join path never had one: the host signs a ticket, the realtime half fetches the
host's published key and checks it. Journalling was the exception — a bearer secret set
in two places and kept in step by hand.

It is now the same arrangement pointed the other way. The realtime process mints an
Ed25519 keypair at boot, publishes the public half at
`/.well-known/streetmesh-realtime`, and signs each call with method, path, body hash and
a timestamp. The host reads that key from the endpoint it already knows — it has to know
it, because it sends browsers there — and verifies. The address is the whole of the trust
anchor.

**Cutover.** Both halves deploy independently, so the host accepts either proof for now.

1. Deploy the host. It accepts a signature *or* the old bearer, and logs a warning
   whenever the bearer is what got through.
2. Deploy the realtime half. It signs everything and still sends the bearer.
3. Play a game and read the log. No warning means every call verified by signature.
4. Remove `SM_REALTIME_SECRET` from the realtime environment, then from the host, then
   delete `bearsTheOldSecret` and `HOST_SECRET`.

Removing it from the realtime half first is the safe order — the host tolerates its
absence, but the reverse leaves the host rejecting calls that still carry it.

**What this costs.** The key lives in memory, so a restart rotates it; the host re-reads
the published key when a signature fails, rate-limited so an unauthenticated caller
cannot use that as a lever. It holds only while the realtime half is one process — two
nodes behind one address would each publish a different key, and the one that answers
discovery need not be the one that signed. That is the thing to fix before scaling out,
and it wants a key set rather than a key.

## 11. Open

- Does the host advertise the realtime endpoint in `/.well-known/streetmesh`, or does
  the profile document? Leaning profile, since the Protocol should not know Colyseus
  exists.
- Spectators — the schema allows a seatless player; the host has no concept of one yet.
- Room lifetime versus table lifetime. A table outlives its room. What creates a room
  on demand, and what disposes of it?
- Reconnection window. Colyseus has `allowReconnection`; how long should a seat be held
  for someone whose network dropped mid-game?
