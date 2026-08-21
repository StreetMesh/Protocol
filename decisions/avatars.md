# What you look like, and who gets to say

**How a face became a thing served from the address it describes, rather than a
file a venue keeps.** One position was held and abandoned before anything was
built, and it was abandoned for a reason that only shows up once you ask who is
in a position to check.

---

## What an avatar is

Two things about one person, in one record.

The **model** is a body: a glTF a spatial place puts somebody in. The **icon** is
a square picture, for everywhere a person is a name rather than a body — a party
before anybody turns a camera on, a name in a roster, a line of chat. They are
one record rather than two collections because they are the same person seen
from two kinds of place, and separating them would make that a coincidence.

A resident may keep several and marks one as theirs. An experience may refuse
all of them: bringing your own is the default, and a game whose characters are
all soldiers says so and supplies its own.

Only the icon is built. The rest is written down here and nowhere else yet.

## The position it reverses: a venue keeps a copy

The obvious arrangement, and the one every centralized system uses. A venue
holds pictures of the people who visit it, serves them from its own origin, and
everything is fast, same-origin and under one operator's control.

`notes/architecture.md` D4 says exactly this, and generalises it: the visiting
server proxies every resource, the client talks only to the server that served
it, and *"do not reintroduce direct cross-origin asset fetching."*

### What broke it

Nothing about performance. The problem is that a copy cannot be checked.

A venue serving a picture of `collegeman.stme.sh` is asserting that this is what
collegeman looks like, and it has no way to know. Neither does anybody looking
at it. The failure this matters for is not a stale cache — it is somebody
arriving at a venue under a name close enough to a name you know, wearing the
face you associate with it. A copy makes that easier rather than harder, because
the party who would have to be compromised for it to work is the venue, and the
venue is the party who wants visitors.

Served from the address instead, the same question has an answer a person can
reach: `collegeman.stme.sh` is the only party who can put a picture at
`collegeman.stme.sh/avatar/icon`. That is not a stronger cryptographic claim. It
is a claim somebody can check by going and looking, which is what a profile page
is for.

This is `PublishedMark`'s argument, which the codebase had already made about
venues and had not thought to make about people:

> An image is not an assertion, and nothing about holding a signed copy of one
> makes it more true.

### What that costs, stated plainly

D4's objection was never wrong, only narrower than it read.

- **Every party leaks a fetch.** Four people in a party means four browsers
  fetching from four domiciles, and each of those domiciles learns that somebody
  is looking. `handshake.blade.php` already accepts this for venue marks, with a
  comment saying so; this doubles down on it rather than inheriting it quietly.
- **A slow domicile is a slow face, and an unreachable one is no face at all.**
  Nothing waits on the fetch, but nothing stands in for it either: whoever is
  drawing has no opinion about what somebody looks like, so a circle stays empty
  until the bytes arrive or fails empty if they never do.
- **Cross-origin isolation is unresolved for the model.** D4's real technical
  concern is `COEP: require-corp`, which a client needing `SharedArrayBuffer`
  must set, and under which a cross-origin resource is refused unless its server
  sends `Cross-Origin-Resource-Policy` — which arbitrary domiciles will not.
  This does not touch a 2D `<img>` in an ordinary document, which is the whole
  of what is built. **It is unanswered for `/avatar`**, and answering it is part
  of building the model rather than something this decides in advance.

## The amendment it makes: a resident's hostname serves something

`GLOSSARY.md` said a resident's hostname *"was never meant to be browsed"*, that
it exists so a machine resolving a handle can find `/.well-known/atproto-did`,
and that a person who types it into a browser is asking about a person and is
sent to their profile.

That still holds for browsing. What changes is that the hostname now answers a
second thing a *machine* asks, and the argument is the one already made for the
well-known paths: it is something a stranger's software needs, that only this
host can answer for.

Concretely, `collegeman.stme.sh` answers:

```
/.well-known/atproto-did      who this name is
/.well-known/did.json         and what to check their signatures against
/avatar/icon                  what they look like, in two dimensions
/avatar                       reserved for the model; serves nothing yet
```

`/avatar` answers 404 rather than redirecting to the icon. A picture is not a
body, and a path that quietly served one for the other would be this server
asserting they are the same thing.

## The amendment: a resident always has a face

`/avatar/icon` began by refusing for a resident who had published nothing, on
the grounds that 404 is the honest answer to "is there a picture". It was the
honest answer to a question nobody was asking. What a caller wants to know is
what this person looks like, and for somebody who lives here that always has an
answer: their initial, on a ground derived from their handle, drawn as a few
hundred bytes of SVG.

So the address is now **total for residents**. Every caller gets an image, and
none of them needs to know how to draw a person.

Two things this is not.

**Not a silhouette.** A generic figure says only "a person", which the caller
already knew. An initial says which person, and costs the same few hundred
bytes — so answering with the figure would leave every caller worse off for
having asked.

**Not extended to strangers.** A name nobody goes by is still a 404, and that is
the line the whole amendment turns on. A resident has a letter because they have
a name here; drawing one for anybody who asks would make every name on the
internet look like somebody who lives on this server.

### And it removed the local fallback rather than sitting beside it

A venue used to draw its own letter under the picture, on the reasoning that a
fetch to somebody else's server might not arrive. Once a domicile answered for
every one of its residents, that became a second answer to a question which
already had one — in a different style, from the party with less to go on. Two
answers can only disagree.

So the venue draws nothing of its own now, and an unreachable domicile is an
empty circle. That is a worse failure than a letter and it is accepted
deliberately: what somebody looks like is theirs to say, and a venue supplying a
stand-in is the venue having an opinion about it.

The cost is real and is not being minimised. It will want revisiting when there
are servers on this network that somebody else runs — at which point the honest
fix is a fallback that draws *the same thing* their domicile would have, rather
than a second design that shows up only when something has gone wrong.

**These are registered outside the browser middleware.** A resident's hostname
permanently redirects browser routes to their profile, so a route registered
alongside the ordinary screens would never run — and the redirect is permanent,
so every browser that saw it would keep the wrong answer.

## Where the bytes live

An avatar is a **record**, and the picture is a **blob** the record refers to.

Records were already written-once and addressed by content. Blobs are new, and
are the same discipline over bytes that are not a structure: named by hashing
them, under the multicodec `raw` rather than `dag-cbor`, which is the difference
between `bafkrei…` and `bafyrei…`. Both are 59 characters and differ in one
byte, so this is pinned in `conformance/encoding/cid.json` rather than left to
each implementation — a blob hashed correctly and labelled `dag-cbor` produces a
name of exactly the right shape that nothing else on the network agrees with.

Two rules were carried over unchanged and one was deliberately inverted.

- **Visibility belongs to the kind, not the thing.** A blob is kept *for* a
  collection and takes that collection's visibility. The alternative — deriving
  it by searching record bodies for the blob's name — would mean querying the
  interior of a value the schema promises never to look inside.
- **The name is computed, never accepted**, and so is the content type: it is
  sniffed from the bytes. These are served back from the origin that answers for
  somebody's identity, so an uploader who could name the type could serve a
  script from an address the rest of the network trusts.
- **An undeclared kind is refused, not stored.** This inverts the rule for
  record collections, where anything undeclared is private rather than rejected,
  and the inversion is the point: the two fail in opposite directions. An
  undeclared record is private and therefore harmless. An undeclared blob would
  be a file of a stranger's choosing on a trusted address.

Uploaded pictures are **re-encoded** rather than kept. That settles four things
at once: whatever arrived is demonstrably an image because it survived being
decoded, its EXIF is gone including where the camera was, its dimensions are
ours, and an SVG full of script does not survive the round trip.

## What is not written down anywhere

There is no signature over an avatar and no attestation inside the record, which
makes it the first record type here with nothing nested in it. That is worth
being explicit about, because every other record is shaped the other way round
and somebody will read this as an omission.

An attestation exists because a venue is the only party in a position to say
what happened at it. Nobody is in that position about a face. A signature would
say only that the person who holds the key asserted it, which the record already
says by existing in their repository.

## What is still open

- **The model.** Size and complexity budgets, and the cross-origin isolation
  question above. A hostile glTF — 8K textures, a decompression bomb, a million
  triangles — is a problem an icon does not have.
- **Several avatars.** The table allows it and the interface does not; today one
  row per resident is enforced by a uniqueness constraint, and relaxing it is
  the whole of the change.
- **An experience dictating appearance.** Bring-your-own is the default. An
  experience supplying its own characters needs to say so, and the obvious place
  is a method on the interface beside `audience()`. Note that parties
  deliberately refuse to ask an experience anything, so this has to be argued
  rather than assumed.
- **Experiences that *build* avatars**, and the permission to write one back.
  This needs a `blob:` scope, which nothing parses — `Scope::parse` returns null
  for one, and the consent screen silently drops any scope that parses to null.
  So a blob permission today would be unenforceable at the endpoint and
  invisible to the person granting it, which is why there is no upload endpoint
  yet. The scope, the enforcement and the sentence a resident reads have to
  arrive together or not at all.
- **How a venue learns an avatar changed.** It does not. The permalink is stable
  and the picture behind it is not, so caching leans on the content's own name
  as an entity tag rather than on a long expiry. Nobody is notified.
