[Docs](../README.md) › Reference › The loader

# The loader: `Siperb-Web-Phone`

The loader is a small script that signs in to a Siperb account, reads a device's provisioning, and
can load the embedded Browser Phone into an iframe. You only need it if you use a Siperb account; the
headless SDK on its own does not.

```html
<script src="https://cdn.siperb.com/lib/Siperb-Web-Phone/Web-Phone-<VERSION>.umd.min.js"></script>
```

```js
import Siperb from "./dist/Siperb-Web-Phone.esm.min.js";
```

The script build installs `window.Siperb` and copies every member onto `window.SiperbAPI` as well.
If the page also loads the SDK directly, load the loader **first**.

| Member | What it does |
| --- | --- |
| [`Login(pat)`](#siperbloginpat) | Sign in with a Personal Access Token |
| [`GetDevices(options)`](#siperbgetdevicesoptions) | List the account's Script devices |
| [`GetProvisioning(options)`](#siperbgetprovisioningoptions) | Read one device's SIP settings |
| [`LoadBrowserPhone(iframe)`](#siperbloadbrowserphoneiframe) | Load the embedded phone into an iframe |
| [`ProvisionPhone(options)`](#siperbprovisionphoneoptions) | Configure and start the embedded phone |

---

## `Siperb.Login(pat)`

```ts
Login(pat: string): Promise<{ SessionToken: string, UserId: string }>
```

Signs in with a Personal Access Token from the Siperb Admin Control Panel.

- **Resolves** with the session. Also sets `SiperbAPI.SESSION_TOKEN` and `SiperbAPI.USER_ID`.
- **Rejects** if the token is refused or the API cannot be reached.

```js
const session = await Siperb.Login(window.PERSONAL_ACCESS_TOKEN);
```

## `Siperb.GetDevices(options)`

```ts
GetDevices({ UserId, SessionToken, EnableCache?, SessionKey? }): Promise<Array | null>
```

Lists the account's devices, filtered to **Script** devices (the type a web page uses).

| Option | |
| --- | --- |
| `UserId`, `SessionToken` | From `Login` |
| `EnableCache` | `true` to reuse the last list from `localStorage` |
| `SessionKey` | The `localStorage` key; required with `EnableCache` |

- **Resolves** with the array, and sets `SiperbAPI.DEVICES`.
- **Never rejects**: resolves `null` on any failure, so check it.

You do not need this if you already have the Device Token.

```js
const devices = await Siperb.GetDevices({ UserId: session.UserId, SessionToken: session.SessionToken });
const deviceToken = devices?.[0]?.DeviceToken;
```

## `Siperb.GetProvisioning(options)`

```ts
GetProvisioning({ UserId, DeviceToken, SessionToken, EnableCache?, ProvisioningKey? }): Promise<Object | null>
```

Reads the SIP settings of one Script device.

| Option | |
| --- | --- |
| `UserId`, `SessionToken` | From `Login` |
| `DeviceToken` | The Script device's token |
| `EnableCache` | `true` to reuse the last copy from `localStorage` |
| `ProvisioningKey` | The `localStorage` key; required with `EnableCache` |

- **Resolves** with the provisioning object, and sets `SiperbAPI.PROVISIONING`. The fields you use
  are listed in [Siperb provisioning](../getting-started/siperb-provisioning.md#the-fields-you-use).
- **Never rejects**: resolves `null` if the device cannot be read or is not a Script device.

```js
const provisioning = await Siperb.GetProvisioning({
    UserId: session.UserId,
    DeviceToken: window.DEVICE_TOKEN,
    SessionToken: session.SessionToken,
});
if (!provisioning) throw new Error("Could not read the device's provisioning");
```

## `Siperb.LoadBrowserPhone(iframe)`

```ts
LoadBrowserPhone(iframe: HTMLIFrameElement): Promise<void>
```

Loads the current Browser Phone (its HTML, CSS and scripts, including the SDK) from the Siperb CDN
into an iframe you supply. The phone is loaded but not started; call `ProvisionPhone` next.

- The iframe must be dedicated to the phone and start empty (`src="about:blank"`).
- **Rejects** if the iframe is not usable or the phone could not be loaded.

```js
const frame = document.getElementById("thePhone");
await Siperb.LoadBrowserPhone(frame);
```

## `Siperb.ProvisionPhone(options)`

```ts
ProvisionPhone({ Provisioning, PhoneFrame, ProfileUserId, SessionId, UserId, OnLoad?, ...uiOptions }): Promise<phone>
```

Configures the loaded phone from your provisioning, draws its UI and connects it.

| Required option | |
| --- | --- |
| `Provisioning` | From `GetProvisioning` |
| `PhoneFrame` | The iframe passed to `LoadBrowserPhone` |
| `ProfileUserId` | Keeps this device's local data separate; the Device Token is a good choice |
| `SessionId`, `UserId` | From `Login` (`SessionToken` and `UserId`) |

`OnLoad` is called when the UI is ready. The optional UI switches are listed in
[The embedded Browser Phone](../getting-started/iframe-phone.md#options-you-can-pass-to-provisionphone).

- **Resolves** with the iframe's `phone` object, connected.
- **Rejects** if a required option is missing or the phone cannot connect; the reason says which.

```js
const phone = await Siperb.ProvisionPhone({
    Provisioning: provisioning,
    PhoneFrame: frame,
    ProfileUserId: window.DEVICE_TOKEN,
    SessionId: session.SessionToken,
    UserId: session.UserId,
});
phone.Dial("*65");
```
