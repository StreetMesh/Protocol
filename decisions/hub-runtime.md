# Where a hub comes from

**Historical.** How "a server has one hub" stopped being a sentence and became
an arrangement, written as it was found. Two positions were held confidently and
abandoned, and the abandoning is the useful part.

---

## The position it reverses

An experience shipped a hub. Chess had a `hub/` directory beside its screens, and
the venue ran a program that went looking for them with a glob at startup. Said
out loud it is obviously wrong — an operator installing three experiences would
have a server with three hubs, each ignorant of the other two — but nothing
forced the question while there was one experience on one machine.

The model that replaced it is one sentence: **a server has at most one hub; the
hub is generic; experiences ship rooms that are installed into it.**

Nothing about that is controversial. Where it got expensive was the next
question, which nobody had asked: *by what mechanism does a hub come to contain
the rooms of a particular server?*

## What the answer has to survive

The hub is not PHP. It is a Node process, and it is deployed by whatever hosts
Node — in our case Colyseus Cloud, whose build container has **Node and nothing
else**: no PHP, no Composer, and no git submodules.

The list of installed experiences lives in a PHP registry, in a Laravel
application, whose packages are git submodules resolved through Composer path
repositories. Every one of those facts is invisible to the thing that runs the
hub.

So the translation from *what this server has installed* to *a runnable Node
project* has to happen somewhere that has PHP. There are only two such places: a
developer's machine, or a CI job. Nothing else about the arrangement matters
until that is accepted.

## What was considered

**A hub repository per venue.** A small project holding a config file and the
rooms as dependencies. Rejected, and rightly: it makes the hub an artifact of one
venue's experience list, authored by hand, kept in step by memory. This was
proposed twice — once before the model was stated and once after, which is a good
illustration of how a wrong shape survives being corrected in the abstract.

**Bootstrap during the hub's own build.** A Node script that reads the repository
and generates the config. Attractive because it runs in a receiving system and
cannot be forgotten. Fails on two counts: the rooms are in submodules the build
does not clone, and `npm install` runs *before* the build command, so a script
that discovers a room needing a chess engine has already missed its chance to
install one.

**Runtime discovery, kept.** The glob the prototype used. It cannot see rooms
that were never cloned either, and it makes the set of installed experiences
something the hub works out rather than something the server states.

**The server generates its hub, and the result is committed.** Chosen.

## The decision

`php artisan hub:build` writes a flat, self-contained Node project: the hub
library, each installed experience's room copied in, and a `package.json` that
collects each room's own dependencies from its own manifest. The one import that
names the hub as a package is repointed at the copy beside it. No submodules, no
path repositories, nothing resolved from a git host at deploy time.

**It is committed.** Generated code in a repository is a real cost and worth
naming: it appears in every diff and it can be stale. It is paid because the
alternative does not exist — the platform that runs the hub cannot generate it,
and git is the only thing that reaches both sides.

Two properties make it tolerable.

**Nobody has to remember.** Starting the hub locally builds it first, so the hub
you test against *is* the artifact that deploys. Changing a room without
regenerating means you never ran it.

**The build fingerprints itself**, over contents and in a stable order, and the
running hub serves that fingerprint. So a deploy can ask a hub what it is and do
nothing when the answer already matches. That is not an optimisation: **a hub
restart disposes every room and ends every game in progress**, so a venue that
shipped its hub on every release would end somebody's game every time a sentence
changed on a page.

## What this cost to discover

Three failures, none of which was the architecture, all of which looked like it.
They are recorded because each was invisible for the same reason — the tooling
reported success and the symptom appeared somewhere else.

**A deploy key belongs to exactly one repository.** GitHub refuses the same key
twice, so pointing a hosting application at a different repository means removing
the key from the old one first. Symptom: deployments accepted and never appearing.

**The application id was a string, not the number in the dashboard URL.**
`1742-chess`, not `1742`. Symptom: `Application not found for 'token' provided`,
which reads as a bad token.

**A build container's git describes nothing.** After checkout, every tracked file
reported as staged-deleted and every file as untracked — an index emptied, which
is indistinguishable from a working tree somebody has thrown away. A guard that
refused to deploy from a dirty checkout refused every deploy. `git ls-files` tells
the two apart: an index holding nothing has nothing to say about what changed.

The first two were configuration. The third was ours, and it is the interesting
one: a safety check that cannot tell "unsafe" from "cannot tell" will eventually
stop everything. It abstains now.

## What is still open

**Staleness is not yet enforced.** Nothing fails if somebody edits a room, does
not run the hub, and commits. The intended answer is a test that rebuilds and
compares, so that forgetting fails where tests already run — a mechanism rather
than a habit.

**Selectivity depends on the fingerprint alone.** It works, and it is the only
thing standing between a copy change and somebody's interrupted game.
