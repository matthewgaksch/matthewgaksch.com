import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBuildMetadata, generate } from "./build-version.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "gaksch-release-"));
  writeFileSync(
    join(root, "version.config.json"),
    JSON.stringify({
      app: "gaksch-test",
      targets: ["src/generated/build-version.mjs"],
    }),
  );
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ version: "1.2.3" }),
  );
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src/app.js"), "export const value=1;");
  return root;
}

const now = new Date("2026-10-26T00:00:00.000Z");

test("release identity changes with uncommitted source, not runtime time or secrets", () => {
  const root = fixture();
  const a = generate(root, {
    now,
    env: { STATUS_TOKEN: "private-canary" },
  }).metadata;
  writeFileSync(join(root, ".env"), "STATUS_TOKEN=private-canary");
  writeFileSync(join(root, ".dev.vars"), "SECRET_KEY=private-canary");
  const b = generate(root, {
    now: new Date("2026-10-27T00:00:00Z"),
    env: { STATUS_TOKEN: "other-canary" },
  }).metadata;
  assert.equal(a.build.slice(11), b.build.slice(11));
  assert(!JSON.stringify(a).includes("canary"));
  writeFileSync(join(root, "src/app.js"), "export const value=2;");
  assert.notEqual(
    createBuildMetadata(root, { now, env: {} }).metadata.build,
    a.build,
  );
});

test("generated output and subprojects never feed their own identity", () => {
  const root = fixture();
  mkdirSync(join(root, "integration/monitor-source/src"), { recursive: true });
  writeFileSync(
    join(root, "integration/monitor-source/package.json"),
    JSON.stringify({ version: "0.2.0" }),
  );
  writeFileSync(
    join(root, "integration/monitor-source/src/index.ts"),
    "export const ok = true;",
  );
  writeFileSync(
    join(root, "version.config.json"),
    JSON.stringify({
      app: "gaksch-test",
      targets: ["src/generated/build-version.mjs"],
      subprojects: [
        {
          root: "integration/monitor-source",
          app: "gaksch-sub",
          targets: ["src/build-version.mjs"],
        },
      ],
    }),
  );
  const a = generate(root, { now, env: {} }).metadata;
  const b = generate(root, { now, env: {} }).metadata;
  assert.deepEqual(a, b);
});

test("unsafe metadata overrides and output paths fail closed", () => {
  const root = fixture();
  for (const env of [
    { GAKSCH_RELEASE_VERSION: "secret with spaces" },
    { GAKSCH_BUILD_ID: "https://private.example/path" },
    { GAKSCH_BUILD_COMMIT: "not-a-git-commit" },
    { SOURCE_DATE_EPOCH: "invalid" },
  ])
    assert.throws(() => createBuildMetadata(root, { now, env }));
  writeFileSync(
    join(root, "version.config.json"),
    JSON.stringify({ app: "gaksch-test", targets: ["../outside.ts"] }),
  );
  assert.throws(() => generate(root, { now, env: {} }));
});

test("GET and HEAD expose only immutable public fields; writes are refused", async () => {
  const root = fixture();
  generate(root, { now, env: {} });
  const { buildVersion, versionResponse } = await import(
    join(root, "src/generated/build-version.mjs")
  );
  const response = versionResponse();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.deepEqual(Object.keys(await response.json()).sort(), [
    "app",
    "build",
    "builtAt",
    "commit",
    "schemaVersion",
    "version",
  ]);
  assert(Object.isFrozen(buildVersion));
  const head = versionResponse("HEAD");
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  const post = versionResponse("POST");
  assert.equal(post.status, 405);
  assert.equal(post.headers.get("Allow"), "GET, HEAD");
});
