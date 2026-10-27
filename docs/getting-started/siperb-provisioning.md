[Docs](../README.md) › Getting started › Siperb provisioning

# Siperb provisioning: server and credentials from your account

If you have a Siperb account you do not need to know your SIP server, username or password. The
small loader in this repo, `Siperb-Web-Phone`, signs in with a token and hands you everything a SIP
client needs. It works with every path: the headless SDK, the embedded Browser Phone, SIP.js, JsSIP
or your own client.

## What you need

- A **Personal Access Token** (PAT), from the Siperb Admin Control Panel.
- A **Device Token**: create a *Script* device in the Admin Control Panel and copy its token.

Keep both out of source control. The demo pages read them from an `env.js` file that is gitignored:

```js
// env.js
window.PERSONAL_ACCESS_TOKEN = "...";
window.DEVICE_TOKEN = "...";
```

## Load the loader

```html
<script src="https://cdn.siperb.com/lib/Siperb-Web-Phone/Web-Phone-<VERSION>.umd.min.js"></script>
```

It installs `window.Siperb`. If you also load the SDK on the same page, load the loader **first**:
it assigns `window.Siperb`, and the SDK only adds to it.

As a module:

```js
import Siperb from "./dist/Siperb-Web-Phone.esm.min.js";
```

## Get your provisioning

```js
const session = await Siperb.Login(window.PERSONAL_ACCESS_TOKEN);
// { SessionToken, UserId }

const provisioning = await Siperb.GetProvisioning({
    UserId: session.UserId,
    DeviceToken: window.DEVICE_TOKEN,
    SessionToken: session.SessionToken,
    EnableCache: true,                     // optional: reuse the last copy from localStorage
    ProvisioningKey: "SiperbProvisioning", // the localStorage key, needed with EnableCache
});
```

`Siperb.Login` rejects if the token is refused. `Siperb.GetProvisioning` resolves `null` if the
device cannot be read, so check it.

Don't have the Device Token to hand? `Siperb.GetDevices({ UserId, SessionToken })` lists the
account's devices.

## The fields you use

| Provisioning field | What it is |
| --- | --- |
| `SipWssServer` | WebSocket host of the SIP server |
| `SipWebsocketPort` | WebSocket port |
| `SipServerPath` | WebSocket path |
| `SipUsername`, `SipPassword`, `SipDomain` | The SIP account |
| `SipContact` | The contact user to register with |
| `profileName` | The account's display name |
| `RegistrationMode`, `SipJwt` | Used to build the headers below |

When you connect through Siperb's servers, send these headers on REGISTER and INVITE:

```js
const headers = {
    "X-Siperb-Sid": session.SessionToken,
    "X-Siperb-Uid": session.UserId,
};
if (provisioning.SipJwt) headers.Authorization = "Bearer " + provisioning.SipJwt;
```

## Start the headless SDK with it

```js
const useSiperbHeaders =
    provisioning.RegistrationMode == "Proxy" ||
    String(provisioning.SipWssServer || "").endsWith(".siperb.com");

await phone.Init({
    ProfileUserId: window.DEVICE_TOKEN,
    wssServer: provisioning.SipWssServer,
    WebSocketPort: provisioning.SipWebsocketPort,
    ServerPath: provisioning.SipServerPath,
    SipUsername: provisioning.SipUsername,
    SipPassword: provisioning.SipPassword,
    SipDomain: provisioning.SipDomain,
    ContactUserName: provisioning.SipContact,
    DisplayName: provisioning.profileName,
    Settings: { MediaLocation: "https://cdn.siperb.com/media/" },
    ExtraRegisterHeaders: useSiperbHeaders ? headers : undefined,
    ExtraInviteHeaders: useSiperbHeaders ? headers : undefined,
});
```

The SDK sends `ExtraRegisterHeaders` and `ExtraInviteHeaders` exactly as given; it adds no
authentication headers of its own.

## Next

- [Headless SDK](./headless.md) for events and call control.
- [The embedded Browser Phone](./iframe-phone.md), which does all of this for you.
- [Other SIP libraries](./sip-libraries.md) to use these fields with SIP.js or JsSIP.
