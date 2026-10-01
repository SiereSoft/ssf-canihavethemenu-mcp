#!/usr/bin/env node
// Checks both plugins against what Claude's directory and Codex require. No dependencies.
//   node scripts/check.mjs                 # offline checks
//   node scripts/check.mjs --live [url]    # also check the skill against the live server's tools
//                                          # (default https://caniseethemenu.com/mcp; MENUMAP_AUTHORIZATION adds a header)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const errors = [];
const fail = (msg) => errors.push(msg);
const json = (p) => {
  try {
    return JSON.parse(readFileSync(join(ROOT, p), "utf8"));
  } catch (e) {
    fail(`${p}: ${e.message}`);
    return {};
  }
};

const PLUGINS = { claude: "claude/menumap", codex: "codex/menumap" };
const claude = json(`${PLUGINS.claude}/.claude-plugin/plugin.json`);
const codex = json(`${PLUGINS.codex}/.codex-plugin/plugin.json`);
const version = claude.version;

// Both plugins: README, LICENSE, skill, MCP config, no OS junk.
const skills = {};
for (const [agent, dir] of Object.entries(PLUGINS)) {
  const readme = existsSync(join(ROOT, dir, "README.md")) ? readFileSync(join(ROOT, dir, "README.md"), "utf8") : "";
  const words = readme.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length;
  if (words < 40) fail(`${dir}/README.md: needs at least 40 words outside code blocks (has ${words})`);
  if (!existsSync(join(ROOT, dir, "LICENSE"))) fail(`${dir}/LICENSE is missing`);
  if (readFileSync(join(ROOT, dir, "LICENSE"), "utf8") !== readFileSync(join(ROOT, "LICENSE"), "utf8")) fail(`${dir}/LICENSE differs from ./LICENSE`);

  const skill = readFileSync(join(ROOT, dir, "skills/menumap/SKILL.md"), "utf8");
  skills[agent] = skill;
  const fm = /^---\nname: ([^\n]+)\ndescription: ([^\n]+)\n---\n/.exec(skill);
  if (!fm) fail(`${dir}/skills/menumap/SKILL.md: needs name and description frontmatter`);
  else if (fm[1] !== "menumap" || fm[2].length > 1024) fail(`${dir}/skills/menumap/SKILL.md: bad name or description too long`);

  const mcp = json(`${dir}/.mcp.json`).mcpServers?.menumap;
  if (!mcp) fail(`${dir}/.mcp.json: no menumap server`);
  else {
    if (mcp.type !== "http") fail(`${dir}/.mcp.json: type must be "http"`);
    if (!/^https:\/\/[^$]+$/.test(mcp.url ?? "")) fail(`${dir}/.mcp.json: url must be a literal https:// URL (directories reject templates)`);
    for (const k of ["headers", "env_http_headers", "bearer_token_env_var", "http_headers"]) {
      if (k in mcp) fail(`${dir}/.mcp.json: "${k}" reads credentials; the public server needs none`);
    }
  }

  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  for (const f of walk(join(ROOT, dir))) {
    if (/(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|__MACOSX)$/.test(f)) fail(`${f}: remove OS file`);
    if (!/\.(png|svg)$/.test(f) && statSync(f).size > 256 * 1024) fail(`${f}: over 256 KiB`);
  }
}
if (skills.claude !== skills.codex) fail("The Claude and Codex SKILL.md files differ; keep them identical");

// Claude manifest and marketplace.
if (claude.name !== "menumap") fail("claude plugin.json: name must be menumap");
if (!claude.license) fail("claude plugin.json: license is missing");
const cm = json(".claude-plugin/marketplace.json").plugins?.find((p) => p.name === "menumap");
if (cm?.source !== `./${PLUGINS.claude}`) fail(".claude-plugin/marketplace.json: menumap source must be ./claude/menumap");
if (cm?.version !== version) fail(".claude-plugin/marketplace.json: version differs from plugin.json");

// Codex manifest (OpenAI submission limits) and marketplace.
if (codex.version !== version) fail("codex plugin.json: version differs from the Claude plugin");
const ui = codex.interface ?? {};
if (!ui.displayName || ui.displayName.length > 30) fail("codex interface.displayName: required, at most 30 characters");
if (!ui.shortDescription || ui.shortDescription.length > 30) fail("codex interface.shortDescription: required, at most 30 characters");
if ((ui.longDescription ?? "").length > 4000) fail("codex interface.longDescription: at most 4000 characters");
if ((ui.defaultPrompt ?? []).length > 3 || (ui.defaultPrompt ?? []).some((p) => p.length > 128)) fail("codex interface.defaultPrompt: at most 3, each at most 128 characters");
for (const k of ["logo", "composerIcon"]) {
  if (!ui[k] || !existsSync(join(ROOT, PLUGINS.codex, ui[k]))) fail(`codex interface.${k}: missing file`);
}
for (const k of ["skills", "mcpServers"]) {
  if (!String(codex[k]).startsWith("./") || !existsSync(join(ROOT, PLUGINS.codex, codex[k]))) fail(`codex plugin.json ${k}: must be a ./ path that exists`);
}
const xm = json(".agents/plugins/marketplace.json").plugins?.find((p) => p.name === "menumap");
if (xm?.source?.path !== `./${PLUGINS.codex}`) fail(".agents/plugins/marketplace.json: menumap path must be ./codex/menumap");

// Live: the skill documents exactly the server's tools, and the tools carry the annotations both directories want.
const liveAt = process.argv.indexOf("--live");
if (liveAt !== -1) {
  const url = process.argv[liveAt + 1] ?? "https://caniseethemenu.com/mcp";
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
  if (process.env.MENUMAP_AUTHORIZATION) headers.Authorization = process.env.MENUMAP_AUTHORIZATION;
  const rpc = async (method, params = {}) => {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return (await res.json()).result;
  };
  try {
    await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "check", version: "1" } });
    const { tools } = await rpc("tools/list");
    const names = tools.map((t) => t.name).sort();
    const documented = [...new Set([...skills.claude.matchAll(/`((?:search|list|get)_[a-z_]+)`/g)].map((m) => m[1]))].sort();
    if (JSON.stringify(names) !== JSON.stringify(documented)) fail(`skill documents ${documented}, server has ${names}`);
    for (const t of tools) {
      const a = t.annotations ?? {};
      if (!(t.title ?? a.title)) fail(`tool ${t.name}: no title`);
      for (const k of ["readOnlyHint", "destructiveHint", "openWorldHint"]) if (typeof a[k] !== "boolean") fail(`tool ${t.name}: ${k} not set`);
    }
    console.log(`live: ${url} has ${names.length} tools, all documented and annotated`);
  } catch (e) {
    fail(`live check: ${e.message}`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✘ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✔ menumap ${version}: Claude and Codex plugins pass`);
