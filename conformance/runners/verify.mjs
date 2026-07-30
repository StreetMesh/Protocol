#!/usr/bin/env node
//
// Check the conformance vectors from outside the implementation that wrote them.
//
// Vectors produced by an implementation and then used to test that same
// implementation prove nothing. This is the independent half: a second
// implementation, in a different language on a different cryptographic stack,
// written from the specifications rather than translated, sharing no code with
// the generator.
//
// It doubles as the demonstration this directory exists to make. Everything
// below is derived from the specifications and these files alone — so an
// implementation in any language can be proved conforming without reading
// anyone else's source.
//
// No dependencies, deliberately. `node conformance/runners/verify.mjs`

import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign as cryptoSign,
  verify as cryptoVerify,
} from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const read = (file) => JSON.parse(readFileSync(join(ROOT, file), "utf8"));

let passed = 0;
const failures = [];

function check(name, actual, expected) {
  if (actual === expected) {
    passed++;
    return;
  }
  failures.push(`${name}\n      expected ${expected}\n      actual   ${actual}`);
}

// ── DAG-CBOR ────────────────────────────────────────────────────────────────
//
// Written from the specification rather than translated from the PHP, since a
// translation would inherit whatever the PHP got wrong.

function cborHead(major, value) {
  const prefix = major << 5;
  if (value < 24) return Buffer.from([prefix | value]);
  if (value < 0x100) return Buffer.from([prefix | 24, value]);
  if (value < 0x10000) {
    const b = Buffer.alloc(3);
    b[0] = prefix | 25;
    b.writeUInt16BE(value, 1);
    return b;
  }
  const b = Buffer.alloc(5);
  b[0] = prefix | 26;
  b.writeUInt32BE(value, 1);
  return b;
}

function dagCbor(value) {
  if (value === null) return Buffer.from([0xf6]);
  if (value === true) return Buffer.from([0xf5]);
  if (value === false) return Buffer.from([0xf4]);

  if (typeof value === "number") {
    return value >= 0 ? cborHead(0, value) : cborHead(1, -value - 1);
  }

  if (typeof value === "string") {
    const bytes = Buffer.from(value, "utf8");
    return Buffer.concat([cborHead(3, bytes.length), bytes]);
  }

  if (Array.isArray(value)) {
    return Buffer.concat([cborHead(4, value.length), ...value.map(dagCbor)]);
  }

  // Length first, then bytewise (RFC 7049 canonical), not the plain
  // lexicographic order of RFC 8949. This single line decides whether an
  // implementation computes the right DID.
  const keys = Object.keys(value).sort((a, b) =>
    a.length !== b.length ? a.length - b.length : (a < b ? -1 : a > b ? 1 : 0),
  );

  return Buffer.concat([
    cborHead(5, keys.length),
    ...keys.flatMap((key) => [dagCbor(key), dagCbor(value[key])]),
  ]);
}

// ── base58btc and base32, neither of which Node has ─────────────────────────

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(bytes) {
  let number = 0n;
  for (const byte of bytes) number = number * 256n + BigInt(byte);

  let out = "";
  while (number > 0n) {
    out = B58[Number(number % 58n)] + out;
    number /= 58n;
  }

  for (const byte of bytes) {
    if (byte !== 0) break;
    out = "1" + out;
  }

  return out;
}

function base32Lower(bytes) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let out = "";
  let buffer = 0;
  let pending = 0;

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    pending += 8;
    while (pending >= 5) {
      pending -= 5;
      out += alphabet[(buffer >> pending) & 31];
    }
  }

  if (pending > 0) out += alphabet[(buffer << (5 - pending)) & 31];

  return out;
}

const CODECS = { ed25519: "ed01", secp256k1: "e701", p256: "8024" };

const multikey = (hex, curve) =>
  "z" + base58Encode(Buffer.from(CODECS[curve] + hex, "hex"));

// ── Public keys, as OpenSSL wants them ──────────────────────────────────────

const SPKI = {
  ed25519: "302a300506032b6570032100",
  p256: "3039301306072a8648ce3d020106082a8648ce3d030107032200",
};

const publicKeyFor = (hex, curve) =>
  createPublicKey({
    key: Buffer.from(SPKI[curve] + hex, "hex"),
    format: "der",
    type: "spki",
  });

const fromBase64Url = (value) => Buffer.from(value, "base64url");

// ── The vectors ─────────────────────────────────────────────────────────────

console.log("\nDAG-CBOR");
for (const vector of read("encoding/dag-cbor.json").vectors) {
  check(vector.name, dagCbor(vector.value).toString("hex"), vector.hex);
}

console.log("Multikey");
for (const vector of read("encoding/multikey.json").vectors) {
  check(vector.name, multikey(vector.publicKeyHex, vector.curve), vector.multikey);
}

console.log("did:plc derivation");
for (const vector of read("identity/did-plc.json").vectors) {
  const hash = createHash("sha256").update(dagCbor(vector.operation)).digest();

  check(vector.name, "did:plc:" + base32Lower(hash).slice(0, 24), vector.did);
}

console.log("Record keys");
{
  const suite = read("encoding/tid.json");
  const ALPHABET = suite.alphabet;

  const decode = (tid) => {
    let n = 0n;
    for (const c of tid) n = (n << 5n) | BigInt(ALPHABET.indexOf(c));
    return { microseconds: Number(n >> 10n), clockId: Number(n & 1023n) };
  };

  const encode = (microseconds, clockId) => {
    const n = (BigInt(microseconds) << 10n) | BigInt(clockId);
    let out = "";
    for (let shift = 60n; shift >= 0n; shift -= 5n) out += ALPHABET[Number((n >> shift) & 31n)];
    return out;
  };

  for (const vector of suite.vectors) {
    const { microseconds, clockId } = decode(vector.tid);
    check(`${vector.name} — microseconds`, microseconds, vector.microseconds);
    check(`${vector.name} — clock id`, clockId, vector.clockId);
    check(`${vector.name} — re-encodes`, encode(microseconds, clockId), vector.tid);
  }

  // The whole purpose of the alphabet: sorting text sorts time.
  check(
    "lexical order is chronological order",
    JSON.stringify([...suite.ordering.unsorted].sort()),
    JSON.stringify(suite.ordering.sorted),
  );
}

console.log("Key history — which key was current when");
for (const vector of read("identity/key-history.json").vectors) {
  const history = keyHistory(vector.auditLog, vector.fragment);

  check(
    `${vector.name} — periods`,
    JSON.stringify(history),
    JSON.stringify(vector.history),
  );

  for (const query of vector.queries) {
    check(`  at ${query.at}`, keyAt(history, query.at), query.key);
  }
}

console.log("JWS, verified with OpenSSL rather than libsodium");
{
  const suite = read("signing/jws.json");
  const keyHex = Buffer.from(
    // The multikey carries the codec prefix; drop it to get the raw key.
    base58Decode(suite.publicKeyMultibase.slice(1)).slice(2),
  ).toString("hex");

  for (const vector of suite.vectors) {
    const [header, payload, signature] = vector.compact.split(".");

    const verified = cryptoVerify(
      null,
      Buffer.from(`${header}.${payload}`, "ascii"),
      publicKeyFor(keyHex, "ed25519"),
      fromBase64Url(signature),
    );

    check(`${vector.name} — signature verifies`, verified, true);

    // The reason this vector exists: a blank field must survive intact.
    const claims = JSON.parse(fromBase64Url(payload).toString("utf8"));
    check(`${vector.name} — blank field survives`, claims.detail.pgn, "");
    check(`${vector.name} — reproduces byte for byte`, vector.compact, suiteResign(suite, vector));
  }
}

console.log("ES256 over P-256");
{
  const suite = read("signing/p256.json");
  const key = publicKeyFor(suite.publicKeyHex, "p256");

  for (const vector of suite.vectors) {
    const signature = Buffer.from(vector.signatureHex, "hex");

    check(
      `${vector.name} — verifies`,
      cryptoVerify("sha256", Buffer.from(vector.message, "utf8"), { key, dsaEncoding: "ieee-p1363" }, signature),
      true,
    );

    check(
      `${vector.name} — rejects a different message`,
      cryptoVerify("sha256", Buffer.from(vector.message + "!", "utf8"), { key, dsaEncoding: "ieee-p1363" }, signature),
      false,
    );
  }
}

// ── Key history ─────────────────────────────────────────────────────────────
//
// A DID document publishes the key that is current now, which is the wrong
// question to ask of a signature made earlier. The audit log answers the right
// one.

function keyHistory(auditLog, fragment) {
  const rotations = [];

  for (const entry of auditLog) {
    // Nullified operations were undone by a recovery and are not history.
    if (entry.nullified) continue;

    let key = entry.operation?.verificationMethods?.[fragment];
    if (typeof key !== "string") continue;

    key = key.startsWith("did:key:") ? key.slice("did:key:".length) : key;

    // An operation that leaves the key alone is not a rotation.
    if (rotations.length && rotations.at(-1).key === key) continue;

    rotations.push({ key, at: entry.createdAt ?? "" });
  }

  return rotations.map((rotation, index) => ({
    key: rotation.key,
    from: rotation.at,
    until: rotations[index + 1]?.at ?? null,
  }));
}

/** Bounded [from, until), and null outside the identity's lifetime. */
function keyAt(history, at) {
  const moment = Date.parse(at);

  for (const period of history) {
    const from = Date.parse(period.from);
    const until = period.until === null ? Infinity : Date.parse(period.until);

    if (moment >= from && moment < until) return period.key;
  }

  return null;
}

// ── Helpers that needed the above ───────────────────────────────────────────

function base58Decode(encoded) {
  let number = 0n;
  for (const character of encoded) number = number * 58n + BigInt(B58.indexOf(character));

  const bytes = [];
  while (number > 0n) {
    bytes.unshift(Number(number % 256n));
    number /= 256n;
  }

  for (const character of encoded) {
    if (character !== "1") break;
    bytes.unshift(0);
  }

  return Buffer.from(bytes);
}

/**
 * Re-sign the claims independently and check the result is the same string.
 *
 * Ed25519 is deterministic, so this is an equality rather than a verification —
 * a stronger assertion, because it proves the encoded form is fixed by the
 * specification rather than by any one language's JSON or base64 habits.
 */
function suiteResign(suite, vector) {
  const secret = Buffer.from(suite.secretKeyBase64, "base64").subarray(0, 32);

  const key = createPrivateKey({
    key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), secret]),
    format: "der",
    type: "pkcs8",
  });

  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  const header = encode({ alg: "EdDSA", kid: suite.keyId });
  const payload = encode(vector.claims);
  const signature = cryptoSign(null, Buffer.from(`${header}.${payload}`, "ascii"), key);

  return `${header}.${payload}.${signature.toString("base64url")}`;
}

// ── Result ──────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failures.length} failed`);

if (failures.length) {
  console.log("\n" + failures.map((f) => "  ✗ " + f).join("\n\n"));
  process.exit(1);
}

console.log("An independent implementation agrees with every vector.\n");
