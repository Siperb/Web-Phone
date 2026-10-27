[Docs](../README.md) › Reference › Starting the phone

# Starting the phone: `phone.Init()` and the connection

Loading `browser-phone-sdk.min.js` installs one global, `window.phone`. Nothing connects until you
call `phone.Init()`. The event bus (`phone.On`) is there from the moment the script runs, so you
can subscribe first. The call commands appear when `phone.Init()` runs.

```js
phone.On("SipProviderStatus", (status) => render(status));   // subscribe first

await phone.Init({
    ProfileUserId: "alice",
    wssServer: "sip.example.com",
    SipUsername: "alice",
    SipPassword: "secret",
    SipDomain: "example.com",
    Settings: { MediaLocation: "https://cdn.siperb.com/media/" },
});
```

## `phone.Init(options?)`

Returns a `Promise` that resolves once the phone is up and has asked the server to register.
Registration itself completes a moment later; watch `SipProviderStatus` for `"Registered"`.

### Where each value comes from

For every option, a value you pass to `phone.Init()` wins. When you leave one out, the SDK looks
in `phone.Provisioning`, then in `phone.Settings`, then uses its own default. This is decided per
option, so passing one value never cancels the others.

That means there are three ways to configure the same phone, and you can mix them:

- pass everything to `phone.Init({...})` (the simplest, and what the examples do);
- fill `phone.Provisioning` from a provisioning service and call `phone.Init()` with no arguments
  ([Siperb provisioning](../getting-started/siperb-provisioning.md) does this for you);
- keep user preferences in `phone.Settings`, which the SDK saves between visits.

### Account and server

| Option | Required | Default | What it is |
| --- | --- | --- | --- |
| `wssServer` | yes | | Your WebRTC SIP server's WebSocket host, without `wss://`. |
| `WebSocketPort` | | `4443` | The WebSocket port. Most hosted WebRTC servers listen on `443`; pass it if yours does. |
| `ServerPath` | | `"/ws"` | The WebSocket path. |
| `SipUsername` | yes | | The SIP account user. |
| `SipPassword` | yes | | The SIP account password. |
| `SipDomain` | yes | | The SIP domain, the part after the `@`. |
| `DisplayName` | | | The name the far end sees. |
| `ContactUserName` | | | The user part of the Contact the phone registers. Leave it out unless your server needs a specific one. |
| `UserAgentStr` | | the SDK's own | The SIP `User-Agent` header. |
| `RegisterExpires` | | `300` | How long a registration lasts before it is refreshed, in seconds. |

### Your own headers

| Option | What it is |
| --- | --- |
| `ExtraRegisterHeaders` | An object of extra SIP headers added to every REGISTER and SUBSCRIBE, for example `{ "Authorization": "Bearer ..." }`. |
| `ExtraInviteHeaders` | An object of extra SIP headers added to every outgoing call and message. |

The SDK adds no authentication headers of its own. If your server expects a token, build the header
yourself and pass it here.

### Media and network

| Option | Default | What it is |
| --- | --- | --- |
| `IceStunServerJson` | a public STUN server | The ICE servers, as a **JSON string** of the `iceServers` array an `RTCPeerConnection` takes, for example `JSON.stringify([{ urls: "stun:stun.example.com:3478" }])`. Put your own STUN and TURN servers here. |
| `IceStunCheckTimeout` | `500` | How long, in milliseconds, to gather ICE candidates before sending the offer. |
| `BundlePolicy` | `"balanced"` | The `RTCPeerConnection` bundle policy. |
| `EchoCancellation` | `true` | Ask the browser for echo cancellation on the microphone. |
| `NoiseSuppression` | `true` | Ask for noise suppression. |
| `AutoGainControl` | `true` | Ask for automatic gain control. |
| `DtmfType` | `"inband"` | How keypad tones are sent: `"inband"` (RFC 4733 telephone-event, in the audio), `"info"` (SIP INFO, only for a server that cannot take in-band tones) or `"none"`. |
| `NoAnswerTimeout` | `120` | Seconds an outgoing call may ring before it gives up. |

The three microphone options are only applied where the browser says it supports them. When it
does, `false` really turns the processing off.

### The three namespace options

These set up the namespace rather than configure the connection.

| Option | What it does |
| --- | --- |
| `ProfileUserId` | Keeps this account's local data (contacts, history, settings) separate from any other account in the same browser. Use a stable id per account. |
| `Settings` | An object merged into `phone.Settings` before the phone starts. Any [setting](./settings.md) can go here. |
| `Provisioning` | An object to use as `phone.Provisioning`, the fallback for every option above. |

### When it cannot connect

`phone.Init()` always tries to connect. If it has no `SipUsername`, `SipPassword`, `SipDomain` or
`wssServer` from any source, it **throws** an `Error` whose message names the missing values. It
does not wait or retry in the background.

```js
try {
    await phone.Init(options);
} catch (e) {
    showSetupError(e.message);   // "... cannot connect: missing SipPassword, wssServer"
}
```

Everything it did manage to read is already published on the namespace, so once you have the
missing values you can call `phone.Init()` again.

## The connection

`phone.SipProvider` is the SIP connection. It exists once `phone.Init()` has run.

| Member | Returns | What it does |
| --- | --- | --- |
| `phone.SipProvider.GetStatus()` | `string` | The registration status: `"Initial"`, `"Registering"`, `"Registered"`, `"Unregistered"` or `"Failed"`. The same values `SipProviderStatus` carries. |
| `phone.SipProvider.IsRegistered()` | `boolean` | Whether the account is registered right now. |
| `phone.SipProvider.ForceReconnect()` | `Promise<{ Success, Reason }>` | Rebuild the connection and register again now. Live calls are kept. Use it for a "Reconnect" button, or when your app knows the network has changed. |
| `phone.SipProvider.Disconnect()` | `Promise` | Unregister and close the connection. The phone stays down until you reconnect it. |
| `phone.SipProvider.Connect()` | `Promise` | Connect again after `Disconnect()`. |

You rarely need these. The SDK recovers the connection by itself when the network drops and
returns, and checks it whenever the page comes back to the front. A registration the server refused
(wrong password) shows as `"Failed"` and is not retried in a loop.

## Which version is running

`phone.SDKVersion` is the version string of the loaded script, for example `"1.0.208"`. It is set
the moment the script runs.

## Next

- [Calls](./calls.md): placing, answering and controlling calls.
- [Events](./events.md): everything you can subscribe to.
- [Settings](./settings.md): the behaviour you can configure.
