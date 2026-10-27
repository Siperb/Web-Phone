[Docs](../README.md) › Getting started › Other SIP libraries

# Other SIP libraries: SIP.js, JsSIP or your own client

You don't have to use the Browser Phone SDK at all. [Siperb provisioning](./siperb-provisioning.md)
gives you a WebSocket server and a SIP account, and any WebRTC SIP client can use them.

Two complete, working pages are in this repo:

- [`test-SIPJS.html`](../../test-SIPJS.html): registers and calls with [SIP.js](https://sipjs.com/).
- [`test-JSSIP.html`](../../test-JSSIP.html): the same with [JsSIP](https://jssip.net/).

## Mapping provisioning onto a SIP client

| You need | From provisioning |
| --- | --- |
| WebSocket URL | `wss://` + `SipWssServer` + `:` + `SipWebsocketPort` + `SipServerPath` |
| SIP URI | `sip:` + `SipUsername` + `@` + `SipDomain` |
| Auth username / password | `SipUsername` / `SipPassword` |
| Contact user | `SipContact` (register with a fixed contact) |
| Display name | `profileName` |

When connecting through Siperb's servers, add the `X-Siperb-Sid`, `X-Siperb-Uid` and, when a
`SipJwt` is present, `Authorization: Bearer <SipJwt>` headers to REGISTER and INVITE, as shown in
[Siperb provisioning](./siperb-provisioning.md#the-fields-you-use).

## SIP.js in brief

```js
const server = `wss://${provisioning.SipWssServer}:${provisioning.SipWebsocketPort}${provisioning.SipServerPath}`;
const userAgent = new SIP.UserAgent({
    uri: SIP.UserAgent.makeURI(`sip:${provisioning.SipUsername}@${provisioning.SipDomain}`),
    transportOptions: { server },
    authorizationUsername: provisioning.SipUsername,
    authorizationPassword: provisioning.SipPassword,
    contactName: provisioning.SipContact,
    displayName: provisioning.profileName,
});
await userAgent.start();
```

See the full pages for registering, calling and the extra headers.
