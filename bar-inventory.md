# Bar inventory

Stock lives in Sanity now, as `ingredient` documents with an `inStock` boolean.
The `/bar` menu is derived from them: a cocktail shows only when every
ingredient it needs is in stock. This file is no longer the source of truth for
what is on the shelf.

Read and change stock with:

```
node scripts/set-stock.mjs --list
node scripts/set-stock.mjs --out "Campari" --in "Rye whiskey"   # plan
node scripts/set-stock.mjs --out "Campari" --in "Rye whiskey" --write
```

The plan says which drinks the change puts on the menu and which it takes off.
Sanity Studio, under Ingredients, does the same job one checkbox at a time.

The list below is the seed those documents were created from, by
`scripts/migrate-ingredients.mjs`. It records the shelf as of 2026-08-07 and is
not kept current. Adding a bottle here does nothing on its own.

## Spirits

- Mezcal (2 bottles)
- Amass gin
- Woodford Reserve bourbon
- Scotch
- White/light rum
- Aged/dark rum

## Liqueurs and amari

- Campari
- Aperol
- St-Germain
- Benedictine D.O.M.
- Cynar
- Fernet-Branca

## Vermouth and wine

- Sweet vermouth
- Dry vermouth
- Wine (a few bottles, type unspecified)

## Bitters

- Angostura bitters
- Orange bitters

## Mixers

- Soda water

## Sweeteners

- Simple syrup / sugar

## Fresh and garnish

- Limes
- Lemons
- Oranges (plus slices)
- Luxardo cherries
- Castelvetrano olives
- Assorted spices

## Notably missing (gates some classics)

Kept by hand. This is a shopping list, not inventory, so the migration skips it.

- Orange liqueur (triple sec / Cointreau / curacao): no Margaritas, Sidecars
- Sparkling wine confirmed? If one of the wine bottles is prosecco, spritzes unlock
- Rye whiskey: Manhattans and Little Italys run on bourbon for now
- Ginger beer: no Mules or Dark 'n' Stormys
