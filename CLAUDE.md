# Web-Phone

**This repository is PUBLIC** (`github.com/Siperb/Web-Phone`). It is the window into the Siperb
Browser Phone SDK. Readers get no SDK source, but they may freely download the minified
`browser-phone-sdk.min.js` from the CDN and use it, commercially included. Write everything here for
an outside developer who has only this repo and the CDN.

It is maintained by the Browser-Phone-SDK agent (`../Browser-Phone-SDK`), which is the source of
truth for the SDK.

## What lives here

- `Siperb-Web-Phone.js`: the small public loader (`Siperb.Login` → `GetDevices` → `GetProvisioning`
  → `LoadBrowserPhone` → `ProvisionPhone`), built by rollup to `dist/` and uploaded to the CDN by
  `.github/workflows/upload-to-s3.yml` on every push to `main`.
- `test-*.html`: runnable demos (the iframe Browser Phone, SIP.js, JsSIP).
- `docs/`: the public SDK documentation.

## Rules for `docs/`

1. **Always current.** Any SDK change to the public surface (a `phone.*` member, a signature, an
   event or its payload, a setting) updates these docs in the same change as the SDK.
2. **Curated, never copied.** Every page is written for outsiders and checked against the SDK source.
   Never paste internal material: no source `file:line` references, internal repo or file names,
   design history, internal URLs, account ids, or AWS details.
3. **Easy to read and use.** Lead with what the reader wants to do. Every member page has a signature,
   a plain-language description, and at least one runnable snippet.
4. **Scenarios.** Task-shaped guides (place a call, answer, transfer, conference, messaging,
   click-to-dial, your own UI, your own SIP server) with complete, copy-paste code.
5. **All paths stay.** Headless SDK first (`phone.Init` + `phone.On`, build your own UI), then the
   iframe phone, plus Siperb provisioning, SIP.js, JsSIP and your own client.
6. **Leave the licence wording as it is.**
7. **`docs/README.md` is hand-written.** It used to be generated from `PROJECTS_DOCS.md` by the
   `web-phone-documentation` skill, which copied internal reference pages into `docs/projects/`.
   Do not re-run that skill: it would overwrite the index with the old, internal-facing one.
   `docs/projects/` describes a frozen old core and is being retired.

## The version tree

`LoadBrowserPhone` reads its asset list from
`https://api.siperb.com/VersionTree/?layer=phone&mode=live&platform=web` (`mode=dev` when
`localStorage.DEV_MODE == "yes"`). It carries the current `browser-phone-sdk.min.js` and the
Browser-Phone-UI build. Each asset's `Platform` is an ARRAY (`["web","electron"]`); the loader
matches it through `Siperb.ForPlatform`, which also accepts the older string form.

**Never use the two old Lambda function URLs** this code used to point at. They still answer,
but serve the frozen Browser-Phone-Core / Storage builds, which have no `phone.Init()`. The
tree is cached in `localStorage` and served cache-first, so the cache key is versioned
(`BROWSER_PHONE_VERSION_TREE_V2`): bump it whenever the tree's shape or source changes, or a
returning browser keeps loading the old one.

## Committing

Changes are committed here with a `VERSION` bump. **Never push**: a push to `main` publishes
publicly and uploads to the CDN, so the maintainer pushes.
