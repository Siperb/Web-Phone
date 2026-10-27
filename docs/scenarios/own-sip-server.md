[Docs](../README.md) › Scenarios › Your own SIP server

# Your own SIP server

The SDK is a standard WebRTC SIP client. It works with any SIP server that accepts WebRTC clients,
not only Siperb's. This page lists what the server needs, how to point the SDK at it, and what to
check when it does not connect.

## What the server needs

| Needs | Why |
| --- | --- |
| **SIP over secure WebSocket** (`wss://`, RFC 7118) | A browser cannot speak SIP over UDP or TCP. |
| **A certificate the browser trusts** on that WebSocket | A self-signed certificate fails silently: the socket never opens. |
| **DTLS-SRTP** media | Browsers only send encrypted media. |
| **ICE** | How the browser finds a path for the media. |
| **The Opus or G.711 codec** | What the browser offers. |
| **Digest authentication** (or a token you pass yourself) | How the phone registers. |

On Asterisk this is a PJSIP `wss` transport (served by the built-in HTTP server, usually on port
`8089`, path `/ws`) and `webrtc=yes` on the endpoint. FreeSWITCH, Kamailio and OpenSIPS (with
RTPengine) all support it too; look for "WebRTC" in their documentation.

## Pointing the SDK at it

```js
await phone.Init({
    ProfileUserId: "1001",
    wssServer: "pbx.example.com",
    WebSocketPort: 8089,
    ServerPath: "/ws",
    SipUsername: "1001",
    SipPassword: "secret",
    SipDomain: "pbx.example.com",
    DisplayName: "Front desk",
    IceStunServerJson: JSON.stringify([
        { urls: "stun:stun.example.com:3478" },
        { urls: "turn:turn.example.com:3478", username: "webrtc", credential: "secret" },
    ]),
    Settings: { MediaLocation: "https://cdn.siperb.com/media/" },
});
```

Every option is described in [Starting the phone](../reference/init.md). Three are worth knowing
about for a server of your own.

**`SipDomain`** is the domain of every call, not just of the registration. Dialling `"2001"` calls
`sip:2001@<SipDomain>`. To reach a user on another domain, route it on the server.

**Extensions with letters.** By default a dialled number keeps only digits, `+`, `*` and `#`, so
that a written number like `(555) 123-4567` works. If your users dial names (`"reception"`,
`"alice.smith"`), set [`EnableAlphanumericDial`](../reference/settings.md#calls) to `true`. Do not
dial an address with an `@` in it: the SDK treats one as a Siperb email address.

**Tokens instead of passwords.** If your server authenticates with a header, build it yourself and
pass it in. The SDK adds no authentication headers of its own:

```js
await phone.Init({
    /* ... */
    ExtraRegisterHeaders: { Authorization: "Bearer " + token },
    ExtraInviteHeaders:   { Authorization: "Bearer " + token },
});
```

## TURN

Most calls connect without a relay, because the server's media side has a public address and the
browser reaches it directly. A relay (TURN) helps when a user sits behind a firewall that blocks
outgoing UDP, or when two browsers call each other directly with no media server between them. Add
your TURN server to `IceStunServerJson` as above. Do not put a long-lived TURN password in a public
page: issue short-lived credentials from your own server.

## When it does not work

| What you see | Usual cause |
| --- | --- |
| `SipProviderStatus` stays `"Registering"` or goes to `"Unregistered"` | The WebSocket does not open. Check the host, port and path. Open `https://<host>:<port>` in a tab: a certificate warning there is the problem. |
| `SipProviderStatus` is `"Failed"` | The server refused the registration: the username, password or `SipDomain` (realm) is wrong. It is not retried; fix the value and call `phone.Init()` again. |
| A call fails with `488` | The endpoint is not set up for WebRTC (no DTLS-SRTP, or no common codec). |
| A call to a name never goes out, or reaches the wrong extension | The letters were stripped. Set `EnableAlphanumericDial`. |
| The call connects but nobody hears anything | The media cannot get through. Add a TURN server. With `EnableQos` on, `OnMediaError` reports `NoInboundAudio` or `NoOutboundAudio`. |
| Keypad tones do nothing | The server expects SIP INFO. Set `DtmfType: "info"`. |

The SDK logs each registration and call step to the browser's console, which is the first place to
look.

## See also

- [Starting the phone](../reference/init.md) for every option.
- [Other SIP libraries](../getting-started/sip-libraries.md), if you would rather use SIP.js or JsSIP.
