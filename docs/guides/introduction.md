# Introduction

[StreetMesh](https://github.com/StreetMesh) is an open source framework for spatially organizing the web, building upon open standards and existing protocols. Now, you may be reading that sentence and wondering to yourself, "How did I get here? What are these people talking about? What do they mean, 'spatially'? Why do I care?" 

These are all wonderful questions. 

Let's start at the beginning.

## The First Web: Information

The [World Wide Web](https://en.wikipedia.org/wiki/World_Wide_Web) was born in 1989, and went public in 1993. A really smart English guy named [Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee) invented a bunch of technologies—including HTML, URLs, and HTTP—and gave birth to [web pages](https://en.wikipedia.org/wiki/Web_page): a simple, robust, visual communication toolset that unlocked an unprecedented era of hyper-connection and rapid communication.

![Tim Berners-Lee, creator of the World Wide Web](/images/tim-berners-lee.jpg)

While Tim Berners-Lee created the first Web browser, it was a company called [Netscape](https://en.wikipedia.org/wiki/Netscape) that moved the Web out of the academic space and into so-called "personal computing." 

In 1995, in a bid to make the Web and webpages more interactive, Netscape created the scripting language [JavaScript](https://en.wikipedia.org/wiki/JavaScript). Less than one year later, another new technology called [Cascading Style Sheets](https://en.wikipedia.org/wiki/CSS) would create separation between *content* and *layout*, allowing the web to become [beautiful](https://csszengarden.com/) while still being [accessible](https://en.wikipedia.org/wiki/Accessibility).

Every webpage on every website that you've ever interacted with, from Amazon to Wikipedia, was built upon these base technologies. If you're a web developer, every framework you've ever used was built upon this platform: [jQuery](https://jquery.com), [Vue.js](https://vuejs.org/), [React](https://react.dev/), [AngularJS](https://angularjs.org/), [Bootstrap](https://getbootstrap.com/), [Tailwind](https://tailwindcss.com/), and so many others.

This was Web 1.0. The browser-makers fought [wars](https://en.wikipedia.org/wiki/Browser_wars) over standardization and market dominance, but still, it was a simpler time.

## The Second Web: Participation

In 1999, [Darcy DiNucci](https://en.wikipedia.org/wiki/Darcy_DiNucci) coined the term "Web 2.0":

> "The Web we know now, which loads into a browser window in essentially static screenfuls, is only an embryo of the Web to come. The first glimmerings of Web 2.0 are beginning to appear, and we are just starting to see how that embryo might develop. The Web will be understood not as screenfuls of text and graphics but as a transport mechanism, the ether through which interactivity happens. It will [...] appear on your computer screen, [...] on your TV set [...] your car dashboard [...] your cell phone [...] hand-held game machines [...] maybe even your microwave oven."

This era of the Web is marked by the rise of participation and collaboration, much of which happens in the *social web*, with much of that activity occuring on specially made software called "apps" that run on pocket-sized computers that for some (reasonable) reason we still call "phones." While unlike web browsers in form, apps' functionality rely heavily on the same base technologies that powered the first Web, especially [HTTP](https://en.wikipedia.org/wiki/HTTP). 

Some apps are even made using web presentation technologies—HTML, CSS and JavaScript—and are [wrapped](https://cordova.apache.org/) to run like native apps on our mobile devices. There's never been a more interesting or democratized time to be a software creator.

![People using their cell phones on the train](/images/cell-phones-on-the-train.jpg)

Web 2.0 gave birth to the *dot-com startup*, which [bubbled and then burst](https://en.wikipedia.org/wiki/Dot-com_bubble) even as it unleashed household names we still have today, like Amazon and eBay. That early volatility created a new economic space that today contains enormously valuable companies that serve their customers exclusively through the Web—not only by ecommerce, but also through entire software tools (called [SaaS](https://en.wikipedia.org/wiki/Software_as_a_service)) like Slack, Google Workspace, and Zoom.

The social web is a [grand experiment](https://www.youtube.com/watch?v=_fZwusCcT9I) we are running on humanity. Much of the social web is funded by [targeted advertising](https://en.wikipedia.org/wiki/Targeted_advertising): a new form of marketing made possible by the data we all feed into the Web just by using the tools and services that live there. Our attention has a cash value, and so the social web has been designed to extract as much of our attention as possible. Experts agree [this is a big problem](https://www.ted.com/talks/tristan_harris_how_a_handful_of_tech_companies_control_billions_of_minds_every_day), and we still haven't figured out how to fix it.

And so this is Web 2.0, still alive today. The whole world got online, created new ways of exchanging goods and services, subjected our minds and our societies to systemic forces we are still working to understand, and gave rise to a new class: the tech-billionare-enterpreneur.

## The Third Web: Decentralization

Web 1.0 was a *vision* for a world of information that was interlinked and could be explored by both humans and machines. That vision continues today, even as the landscape has evolved dramatically.

Web 2.0 is a *platform*, built upon the successes of Web 1.0, enabling companies and people to contribute content, communicate in real-time, and transct business. It is alive and well.

Web3 would be a *reorganization* of the systems and ownership stake that power the Web that eliminates central authorities or dramatically reduces their power. 

![Phases of the web; an image owned by the World Economic Forum](/images/web3-comparison-wef.png)

Depending upon who you ask, Web3 might be a fairy tale, a marketing "buzz" word, or it might just be the next great vision for how to connect humanity and its information. For the purposes of this exploration of the Web and an introduction to *StreetMesh*, Web3 is best thought of as a collection of new technologies and applications for reorganizing the Web and decentralizing authority.

### Blockchain

Evangelists believe that [Blockchain](https://en.wikipedia.org/wiki/Blockchain) is to Web3 what HTTP was to Web 1.0 and 2.0: it's the base technology that makes all the rest possible. The promise of Blockchain is a future in which there are no longer any central authorities needed to verify the authenticity of a contract. But how?

Blockchains are a kind of [distributed ledger](https://en.wikipedia.org/wiki/Distributed_ledger): any time there's a transaction of data or value in the history of a blockchain, that transaction becomes a record in a *chain* of records—that chain is the *ledger*. Tampering with any one of the chains in the ledger invalidates the entire ledger.

Since it is only possible to modify a blockchain by agreeing to a specific crytographic process and having the keys with which to make an authorized change, the process is self-securing. This self-securing by design is what eliminates the need to have a central authority to validate transactions or keep their history.

![How blockchain works; an image owned by The Motley Fool](/images/how-blockchain-works-motleyfool.png)

No central authorities means no banks needed to authorize the transaction of money, no multinational corporations needed to authorize the transaction of goods and services, and no central governing body to authorize changing the rules. It's all in the Maths!

There are many applications of this technology, with the most common (and least interesting) being [Cryptocurrencies](https://en.wikipedia.org/wiki/Cryptocurrency) like [Bitcoin](https://en.wikipedia.org/wiki/Bitcoin). Other implementations of blockchain like [Ethereum](https://en.wikipedia.org/wiki/Ethereum) can be used as currency but are also used to implement other applications of blockchain technology, like [Smart Contracts](https://en.wikipedia.org/wiki/Smart_contract), [Decentralized Identities](https://www.techtarget.com/whatis/definition/decentralized-identity), and [Decentralized Autonomous Organizations](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization), among others.

And it's all completely *optional*. 

To date, Blockchain technology has not be demonstrated to be technically better at solving any problem than any other technology that came before it. The world we live in is built upon central authority, so the world resists this reorganization. Blockchain technologies are inherently less efficient, requiring lots of power for the ever increasing computational cost of adding chains to a blocks, for any purpose. The inefficiency combines with the resistence to create interference.

These are fighting words, of course. 

Blockchains are here to stay, but that doesn't mean we need to use them. A commitment to the value of [*interoperability*](https://github.com/StreetMesh#core-values) outmodes the value of blockchain. The best solutions are the ones that are compatible with blockchain while being backwards compatible with the systems we have today. 

### did:web

[Decentralized identifiers (DIDs)](https://www.w3.org/TR/did/upcoming/) are unique names (in fact, they are a kind of [Uniform Resource Identifier](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier) or URI) that enable the identity of a person, place, or thing (or data, or entity of some sort) to be verified without relying on a centralized registry. 

These are all valid DIDs:

```
did:street:collegeman.streetmesh.com
did:web:aaroncollegeman.com
did:plc:jflaisf993jfkdjlskdfj993jf
```

Notice how some of them look like website addresses? Website addresses, which are registered using DNS systems (which are decentralized systems), can function as DIDs. In this way, a DID can be used to access a *DID document* using traditional Web 1.0 technologies. 

The DID document can contain many things, including something called *public keys*. Public keys, when part of a [public/private key pair](https://en.wikipedia.org/wiki/Public-key_cryptography), can be used to authenticate (unlock) and subsequently authorize transactions of data or value between two people, or companies, or systems.

In this way, what's old (URLs) becomes new again (DIDs). 

And since I can use a URL as a DID, and because I can host a URL anywhere I choose—including even a computer sitting in the corner of my basement office—my ability to prove who I am to any other system is dependent only on an agreement on how to go about doing the verification.

DIDs can also represent [cryptocurrency wallets](https://en.wikipedia.org/wiki/Cryptocurrency_wallet) on blockchains. These wallets contain the keys used for authenticating and authorizing blockchain transactions. 

By embracing DIDs, we look forward to the fully decentralized Web3, in which everyone uses personal digital wallets to manage their identities, while still maximizing Web 1.0 and Web 2.0 technologist to advance toward the next versions of the Web.

### oAuth



### ATProtocol




## The Next Web: Posthumanization


## The Spatial Web

## StreetMesh

## Summary

## Read Next: Architecture

Now that we know what we mean when we say *Spatially Organized Web* or *Spatial Web*, let's take a look at the [Architectural](/guides/architecture) components that make a Spatial Web possible.








