<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/public/brand/dark/svg/streetmesh-mark-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/public/brand/svg/streetmesh-mark.svg">
  <img alt="StreetMesh" src="docs/public/brand/svg/streetmesh-mark.svg" width="96">
</picture>

# StreetMesh Protocol

[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

[*StreetMesh*](https://github.com/StreetMesh) is an open source framework for spatially organizing the web, building upon open standards and existing protocols. This project documents the *StreetMesh Protocol*: a collection of Guides and APIs that establish the design and architecture for a spatial Web.

> With just a few constraints, imagination finds its wings—structure does not confine creativity, it sets it free. — Unknown

You can browse the Protocol [here](https://protocol.streetmesh.com).

## What is in here

| | |
|---|---|
| [`GLOSSARY.md`](GLOSSARY.md) | Every term, in plain language, and whether it is ours or borrowed. **Start here** if anything below reads as jargon. |
| [`ROADMAP.md`](ROADMAP.md) | What v0 is, which repositories deliver it, and what is deliberately deferred |
| [`conformance/`](conformance) | Executable vectors. The arbiter — a claim about the wire that is not in here is an opinion |
| [`decisions/`](decisions) | Why StreetMesh is shaped as it is: what was decided, what it was decided instead of, and what settled it |
| [`notes/`](notes) | Unreviewed material. Useful, but it has not been settled and does not carry the standing of the above |
| [`docs/`](docs) | The guides, and the site that publishes them at [protocol.streetmesh.com](https://protocol.streetmesh.com) |

Implementations live elsewhere: [`Protocol-PHP`](https://github.com/StreetMesh/Protocol-PHP)
is the framework-free reference, and [`Protocol-Laravel`](https://github.com/StreetMesh/Protocol-Laravel)
binds it to a framework. Neither is the authority — `conformance/` is.

## License

This work—that is, the content of this repository—is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

The website in [`docs/`](docs) is built on a commercial template and is the one
exception: its code carries the [Tailwind Plus license](docs/LICENSE.md), which
does not permit redistributing the template itself. The guides it publishes are
this repository's content, under the license above.

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg