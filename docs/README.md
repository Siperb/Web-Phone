# Siperb Browser Phone SDK documentation

The Browser Phone SDK is one script, `browser-phone-sdk.min.js`, that turns a web page into a
WebRTC SIP phone. Download it from the CDN and use it freely, commercial use included. It handles
SIP, media, call state and local storage; you decide how it looks.

```html
<script src="https://cdn.siperb.com/lib/Browser-Phone-SDK/browser-phone-sdk-1.0.208.min.js"></script>
```

## Pick a starting point

| You want to | Start here |
| --- | --- |
| Build your own phone UI on the SDK | [Headless SDK](./getting-started/headless.md) |
| Drop a finished phone into your page | [The embedded Browser Phone](./getting-started/iframe-phone.md) |
| Use your Siperb account's server and credentials | [Siperb provisioning](./getting-started/siperb-provisioning.md) |
| Use SIP.js, JsSIP or your own SIP client | [Other SIP libraries](./getting-started/sip-libraries.md) |

Each guide ends in working code, and the repository has a runnable page for each:
`test-Headless.html`, `test-Browser-Phone.html`, `test-SIPJS.html` and `test-JSSIP.html`.

## Reference

- [The loader](./reference/loader.md): `Siperb.Login`, `GetDevices`, `GetProvisioning`,
  `LoadBrowserPhone`, `ProvisionPhone`.

A full reference for the SDK's `phone.*` members and its events is on the way. Until it lands, the
members and events in the guides above are the supported surface. Anything you find on `window.phone`
that these pages do not describe is internal, and may change without notice.

## Running the examples locally

```sh
npm install
npm run start:headless   # the headless SDK
npm run start:phone      # the embedded Browser Phone
```

The pages read your Personal Access Token and Device Token from an `env.js` file next to them, which
is gitignored. See [Siperb provisioning](./getting-started/siperb-provisioning.md#what-you-need).
