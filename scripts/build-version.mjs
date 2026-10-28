import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  readFileSync,
  readdirSync,
  lstatSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve, relative, extname } from "node:path";
import { argv, env as defaultEnv, stdout } from "node:process";
import { fileURLToPath } from "node:url";

const ROOTS = new Set([
  "src",
  "app",
  "apps",
  "worker",
  "server",
  "lib",
  "public",
  "shared",
  "scripts",
  "build",
  "packages",
  "types",
  "contracts",
  "database",
  "deployment",
  "deploy",
  "cmd",
  "internal",
  "pkg",
  "web",
  "db",
  "config",
  "migrations",
  "drizzle",
  "content",
  "GreenSortAI",
  "host-agent",
  "integration",
]);
const SKIP = new Set([
  "node_modules",
  ".git",
  ".next",
  ".wrangler",
  ".turbo",
  ".codex-linux-build",
  ".local",
  ".vinext",
  "dist",
  "out",
  "output",
  "target",
  "bin",
  "tmp",
  "coverage",
  "test-results",
  "playwright-report",
  "secrets",
  "data",
  "results",
  "READONLY",
  "uploads",
  "artifacts",
  "monitor-proposal",
  "backups",
  "security-reports",
]);
const ROOT_FILES =
  /^(package(?:-lock)?\.json|pnpm-lock\.yaml|go\.(mod|sum)|Makefile|Dockerfile|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s|wrangler[^/]*\.jsonc|tsconfig[^/]*\.json|version\.config\.json)$/;
const SAFE = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,95}$/;

function assertRelativeTarget(target) {
  return (
    typeof target === "string" &&
    target.length > 0 &&
    !target.includes("..") &&
    !target.startsWith("/") &&
    /[.]([cm]?js|ts)$/.test(target)
  );
}

export function createBuildMetadata(
  root,
  { now = new Date(), env = defaultEnv, configOverride } = {},
) {
  const config =
    configOverride ??
    JSON.parse(readFileSync(resolve(root, "version.config.json"), "utf8"));
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(config.app))
    throw new Error("Invalid release app identifier");
  const packageFile = resolve(root, "package.json");
  const pkg = (() => {
    try {
      return JSON.parse(readFileSync(packageFile, "utf8"));
    } catch {
      /* Package metadata is optional when config or env supplies version. */
      return {};
    }
  })();
  const version = env.GAKSCH_RELEASE_VERSION || config.version || pkg.version;
  if (
    typeof version !== "string" ||
    version.length > 64 ||
    !/^v?\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)*$/.test(version)
  )
    throw new Error("Invalid release version");
  const targets = config.targets || [];
  if (!Array.isArray(targets) || targets.some((t) => !assertRelativeTarget(t)))
    throw new Error("Invalid generated release path");
  const subtargets = (config.subprojects || []).flatMap((sub) => {
    if (
      !sub ||
      typeof sub.root !== "string" ||
      !sub.root ||
      sub.root.includes("..") ||
      sub.root.startsWith("/") ||
      !Array.isArray(sub.targets) ||
      sub.targets.some((t) => !assertRelativeTarget(t))
    )
      throw new Error("Invalid subproject release configuration");
    return sub.targets.map((t) => `${sub.root.replaceAll("\\", "/")}/${t}`);
  });
  const excluded = new Set([...targets, ...subtargets]);
  // Never read environment files, credentials, application state, ignored build
  // output or symlinks. Only the reviewed source/build roots participate.
  const paths = [];
  function visit(path) {
    const rel = relative(root, path).replaceAll("\\", "/");
    const parts = rel.split("/");
    if (
      parts.some(
        (x) =>
          SKIP.has(x) ||
          x.startsWith(".env") ||
          x.startsWith(".dev.vars") ||
          x.startsWith(".pglite"),
      ) ||
      excluded.has(rel)
    )
      return;
    const info = lstatSync(path);
    if (info.isSymbolicLink()) return;
    if (info.isDirectory()) {
      if (rel === "" || ROOTS.has(parts[0]))
        for (const child of readdirSync(path).sort())
          visit(resolve(path, child));
    } else if (info.isFile() && (parts.length > 1 || ROOT_FILES.test(rel))) {
      if (parts[0] === "build" && !/\.[cm]?[jt]s$/.test(rel)) return;
      if (
        /\.(?:db|sqlite\d*|pem|key|p12|pfx|log|bin|exe|tar|gz|zip|tsbuildinfo)$/.test(
          rel,
        ) ||
        /(?:^|\/)(?:next-env\.d\.ts|worker-configuration\.d\.ts)$/.test(rel) ||
        rel.includes("/ui/assets/")
      )
        return;
      if (info.size > 32 * 1024 * 1024)
        throw new Error("Release source file exceeds build input limit");
      paths.push(rel);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of paths.sort())
    hash
      .update(path)
      .update("\0")
      .update(readFileSync(resolve(root, path)))
      .update("\0");
  let commit = null;
  if (env.GAKSCH_BUILD_COMMIT) {
    if (!/^[a-f0-9]{40}$/.test(env.GAKSCH_BUILD_COMMIT))
      throw new Error("Invalid build commit");
    commit = env.GAKSCH_BUILD_COMMIT;
  } else {
    try {
      const result = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (/^[a-f0-9]{40}$/.test(result)) commit = result;
    } catch {
      /* Unborn or exported worktrees legitimately have no Git commit hash. */
    }
  }
  if (env.SOURCE_DATE_EPOCH !== undefined) {
    if (!/^\d{1,12}$/.test(env.SOURCE_DATE_EPOCH))
      throw new Error("Invalid source date");
    now = new Date(Number(env.SOURCE_DATE_EPOCH) * 1000);
  }
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid build time");
  const builtAt = now.toISOString();
  const build =
    env.GAKSCH_BUILD_ID ||
    `${builtAt.slice(0, 10)}-${hash.digest("hex").slice(0, 16)}`;
  if (!SAFE.test(build)) throw new Error("Invalid build identifier");
  return {
    config,
    metadata: {
      schemaVersion: 1,
      app: config.app,
      version,
      build,
      commit,
      builtAt,
    },
  };
}

export function moduleSource(metadata, typescript = false) {
  const preamble = typescript ? "" : "/* global Response */\n";
  return (
    preamble +
    "// Generated by scripts/build-version.mjs. Do not edit; no runtime environment is exposed.\n" +
    `export const buildVersion = Object.freeze(${JSON.stringify(metadata, null, 2)}${typescript ? " as const" : ""});\n` +
    'export const versionHeaders = Object.freeze({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});\n' +
    `export function versionResponse(method${typescript ? ": string" : ""} = "GET")${typescript ? ": Response" : ""} {\n` +
    '  if (method !== "GET" && method !== "HEAD") return new Response(null,{status:405,headers:{...versionHeaders,Allow:"GET, HEAD"}});\n' +
    '  return new Response(method === "HEAD" ? null : JSON.stringify(buildVersion),{headers:versionHeaders});\n}\n'
  );
}

export function generate(root, options) {
  const { config, metadata } = createBuildMetadata(root, options);
  for (const target of config.targets || []) {
    const path = resolve(root, target);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, moduleSource(metadata, extname(path) === ".ts"));
  }
  for (const sub of config.subprojects || []) {
    const subRoot = resolve(root, sub.root);
    const { metadata: subMeta } = createBuildMetadata(subRoot, {
      ...options,
      configOverride: sub,
    });
    for (const target of sub.targets || []) {
      const path = resolve(subRoot, target);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, moduleSource(subMeta, extname(path) === ".ts"));
    }
  }
  return { config, metadata };
}

if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const { config, metadata } = generate(root);
  if (argv.includes("--go-flags")) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(config.goPrefix || ""))
      throw new Error("Invalid Go release prefix");
    const values = {
      releaseVersion: metadata.version,
      releaseBuild: metadata.build,
      releaseCommit: metadata.commit || "",
      releaseBuiltAt: metadata.builtAt,
    };
    stdout.write(
      Object.entries(values)
        .map(([key, value]) => `-X ${config.goPrefix}.${key}=${value}`)
        .join(" "),
    );
  } else
    stdout.write(
      `Release metadata prepared for ${metadata.app}: ${metadata.version} (${metadata.build})\n`,
    );
}
