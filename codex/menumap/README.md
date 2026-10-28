# MenuMap for Codex

MenuMap lets Codex answer questions about eating out: where to eat, who serves a dish and for how much, and what a restaurant's menu has. It has each restaurant's full menu, item by item with prices in EUR, taken from the restaurant's own website, and adds cities over time.

## Install

```bash
codex plugin marketplace add SiereSoft/ssf-canihavethemenu-mcp
codex plugin add menumap@sieresoft
```

## What it adds

- **A connection to the MenuMap MCP server** at `https://caniseethemenu.com/mcp`. It has five read-only tools:
  - `search_restaurants`: find restaurants by name, cuisine, street or neighbourhood, or distance from an address.
  - `search_dishes`: find a dish across every menu, with price and location filters.
  - `list_menu`: read a restaurant's menu, optionally one category.
  - `get_restaurant`: address, opening hours, phone, website and a menu summary.
  - `get_menu_item`: one dish in full.
- **A `menumap` skill** that tells the assistant how to use these tools well. For example: retry in the menu's language when English finds little, say which city results are in, and narrow big menus by category.

## What it sends and where

- **What goes to caniseethemenu.com:** the arguments of each tool call (a restaurant name, a dish, an address or coordinates, price limits).
- **Addresses:** when you search near an address, the MenuMap server looks it up with OpenStreetMap Nominatim.
- **Nothing else:** the plugin runs no local code, needs no account, and stores no credentials.

## Example questions

- "Where can I get a good burger, and what does it cost?"
- "A shopska salad under €8 near the central station."
- "Recommend a vegan restaurant."
- "What desserts does Psari have, and when is it open?"

Prices are as published by each restaurant and may be out of date.

## License

Proprietary: see [LICENSE](LICENSE). Copyright (c) 2026 SiereSoft. Support: support@sieresoft.com.
