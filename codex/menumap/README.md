# MenuMap for Codex

MenuMap lets Codex answer questions about restaurants and what they serve. For now it covers 71 restaurants in Sofia, Bulgaria, and about 8,900 menu items with prices in EUR, taken from each restaurant's own website.

## What it adds

- **A connection to the MenuMap MCP server** at `https://caniseethemenu.com/mcp`. It has five read-only tools:
  - `search_restaurants`: find restaurants by name, cuisine, street or neighbourhood, or distance from an address.
  - `search_dishes`: find a dish across every menu, with price and location filters.
  - `list_menu`: read a restaurant's menu, optionally one category.
  - `get_restaurant`: address, opening hours, phone, website and a menu summary.
  - `get_menu_item`: one dish in full.
- **A `menumap` skill** that tells the assistant how to use these tools well. For example: query in Bulgarian when English finds little, and narrow big menus by category.

## What it sends and where

- **What goes to caniseethemenu.com:** the arguments of each tool call (a restaurant name, a dish, an address or coordinates, price limits).
- **Addresses:** when you search near an address, the MenuMap server looks it up with OpenStreetMap Nominatim.
- **Nothing else:** the plugin runs no local code and stores no credentials of its own. The first time, the assistant opens a Google sign-in for MenuMap (OAuth); while MenuMap is in preview, only invited accounts can connect. The assistant keeps the sign-in, and you can disconnect it there.

## Example questions

- "Where can I get a shopska salad under €8 near NDK in Sofia?"
- "Is there a sushi place in Mladost?"
- "What desserts does Psari have, and when is it open?"

Prices are as published by each restaurant and may be out of date.

## License

Proprietary: see [LICENSE](LICENSE). Copyright (c) 2026 SiereSoft. Support: support@sieresoft.com.
