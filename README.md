# MenuMap plugins for Claude and Codex

Plugins that connect AI assistants to **MenuMap**: 71 restaurants in Sofia, Bulgaria, with their full menus (about
8,900 items, prices in EUR) taken from each restaurant's own website. The assistant can search restaurants by name or
location, find a dish across every menu, and read menus, restaurant details and dishes.

Each plugin connects to the read-only MenuMap MCP server at `https://caniseethemenu.com/mcp`, which needs no account.
Each also bundles a `menumap` skill that teaches the assistant how to use the tools. The server itself lives in
[SiereSoft/ssf-caniseethemenu-com](https://github.com/SiereSoft/ssf-caniseethemenu-com).

| Assistant | Plugin | Install |
|---|---|---|
| Claude Code | [`claude/menumap`](claude/menumap) | `claude plugin marketplace add SiereSoft/ssf-canihavethemenu-mcp`, then `claude plugin install menumap@sieresoft` |
| Claude Cowork and the Claude apps | [`claude/menumap`](claude/menumap) | From the Claude directory once listed; until then, upload `dist/menumap.plugin` (see below) |
| Codex | [`codex/menumap`](codex/menumap) | `codex plugin marketplace add SiereSoft/ssf-canihavethemenu-mcp`, then `codex plugin add menumap@sieresoft` |

## Development

```bash
node scripts/check.mjs                                   # manifest, README, LICENSE and skill checks (also run in CI)
node scripts/check.mjs --live http://localhost:3000/mcp  # also check the skill against a running server's tools
claude plugin validate claude/menumap && claude plugin validate .
scripts/package-cowork.sh                                # dist/menumap.plugin for Cowork
scripts/package-cowork.sh http://localhost:3000/mcp      # dist/menumap-dev.plugin pointing at a dev server
```

- **Keep the two `skills/menumap/SKILL.md` files identical.** `check.mjs` fails otherwise.
- **Bump `version` together** in both `plugin.json` files and in `.claude-plugin/marketplace.json`.
- **Claude Code against a dev server:** run `claude --plugin-dir claude/menumap` with a local copy whose `.mcp.json`
  points at your server.
- **Codex against a dev server:** add a same-named user server in `~/.codex/config.toml`, which takes precedence:
  `[mcp_servers.menumap] url = "http://localhost:3000/mcp"`.

## License

Proprietary. Copyright (c) 2026 SiereSoft, all rights reserved; see [LICENSE](LICENSE). You may install and use the
plugins to access MenuMap. Other copying, modification or redistribution is not permitted. Contact:
support@sieresoft.com.
