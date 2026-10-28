---
name: menumap
description: Look up restaurants and what they serve, with prices (for now in Sofia, Bulgaria). Use when the user asks where to eat, what a restaurant serves or costs, which places near an address have a dish, or for a restaurant's address, phone or opening hours. Uses the MenuMap MCP tools (search_restaurants, search_dishes, list_menu, get_restaurant, get_menu_item).
---

# MenuMap: restaurants and menus

The MenuMap MCP server has restaurants and their full menus, for now 71 in Sofia, (about 8,900 items) with prices in EUR, taken from each restaurant's own website. It is read-only. The first time, the user signs in with Google; during the preview only invited accounts can connect, and a refused account should ask support@sieresoft.com for access.

## Tools

| Tool | Use it to | Key arguments |
|---|---|---|
| `search_restaurants` | Find restaurants by name and/or location | `name`, `address` (street or neighbourhood text), `cuisine`, `near` (address/landmark), `lat`+`lng`, `radius_km`, `limit` |
| `search_dishes` | Find a dish across every menu, or in one restaurant | `query` (required), `restaurant`, `min_price`, `max_price`, `cuisine`, `near`, `lat`+`lng`, `radius_km`, `limit` |
| `list_menu` | Read a restaurant's menu | `restaurant`, `category`, `include_details` |
| `get_restaurant` | Get address, hours, phone, website, menu summary | `restaurant` |
| `get_menu_item` | Get one dish in full (description, portion, image) | `item_id` |

## How to work

1. **Find, then drill down.** Start with `search_restaurants` or `search_dishes`. They return `slug`s (restaurants, e.g. `psari`) and `item_id`s (dishes, e.g. `psari:0.1.3`). Pass those to the other tools; never guess them.
2. **Dish names are mostly Bulgarian.** Query in English, Bulgarian or transliteration: "shopska salad", "шопска салата" and "shopska salata" all work. If an English query returns little, retry with the Bulgarian word (e.g. "кебапче", "баница", "таратор"). When answering, give the Bulgarian name with an English gloss.
3. **Location.** Use `near` for an address or landmark ("NDK, Sofia", "Vitosha Blvd 100, Sofia"), or `lat`+`lng` when you have coordinates. Add `radius_km` to limit distance. Results then carry `distance_km`.
   - About half the restaurants have no coordinates. A radius search reports how many it skipped (`unlocated_restaurants_skipped`). If that matters, also search by `address` (a street or neighbourhood such as "Mladost", "Lozenets", "Rakovski"), or drop `radius_km`.
4. **Big menus.** Some menus have 300+ items. Call `get_restaurant` first to see the categories, then `list_menu` with `category`.
5. **Prices** are EUR (`price_eur`); `null` means the menu shows no price. A `currency_note` means the prices were converted from BGN. Menus were scraped at `fetched_at`, so say that prices may have changed.
6. **Errors** come back as tool errors with a hint (for example "Did you mean: psari (Psari)?"). Follow the hint rather than giving up.

## Examples

- "Where can I get a shopska salad under €8 near NDK?" → `search_dishes {query: "shopska salad", max_price: 8, near: "NDK, Sofia", radius_km: 2}`
- "Is there sushi in Mladost?" → `search_restaurants {cuisine: "sushi", address: "Mladost"}`
- "What desserts does Psari have?" → `list_menu {restaurant: "psari", category: "desserts"}`
- "When is Carnivale open and how do I call them?" → `get_restaurant {restaurant: "carnivale"}`
