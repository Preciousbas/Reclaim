# Legacy monolith reference

This folder holds a pointer to the original single-file ReClaim app used during the React migration.

## Source file

The canonical reference copy is:

**`C:\Users\PRECIOUS\Downloads\ReClaim-44.txt`**

That file mirrors the production monolith (~2,800 lines): inline CSS, HTML pages, Firebase module, Becca chat, check-in flow, RI formulas, and UI copy.

## Do not use as source of truth

The React app at the repo root replaces this monolith. When extracting behaviour:

- Use **one** check-in modal (the monolith had three `#modal` duplicates — a bug)
- Use **`checkins`** object keys for pattern insights (not `journeyGrid`)
- Route Becca through the Netlify `/api/chat` proxy (not direct Anthropic from browser)

## Archiving

To archive locally:

```powershell
Copy-Item "C:\Users\PRECIOUS\Downloads\ReClaim-44.txt" "legacy\ReClaim-monolith-reference.html"
```

After Netlify cutover, serve the new Vite `dist/` at `/` and optionally keep the old HTML at `/legacy` if needed for rollback.
