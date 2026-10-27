[Docs](../README.md) › Getting started › Headless SDK

# Headless SDK: your own UI in five minutes

The Browser Phone SDK is one script, `browser-phone-sdk.min.js`. Load it, subscribe to the events
you care about, call `phone.Init()`, and draw whatever UI you like. There is no iframe and no phone
UI on this path; the SDK handles SIP, media and storage, and plays the far end's audio for you.

A complete, working page is in this repo: [`test-Headless.html`](../../test-Headless.html).

## 1. Load the SDK

```html
<script src="https://cdn.siperb.com/lib/Browser-Phone-SDK/browser-phone-sdk-1.0.208.min.js"></script>
```

Pin a version. A pinned URL never changes underneath you; move to a newer one when you are ready.
The script installs a single global, `window.phone`, and nothing runs until you call `phone.Init()`.

The page must be served over `https://` (or from `localhost`): browsers only allow microphone access
on a secure origin.

## 2. Subscribe before you start

```js
phone.On("SipProviderStatus", (status) => {
    // "Initial" | "Registering" | "Registered" | "Unregistered" | "Failed"
    document.getElementById("status").textContent = status;
});

phone.On("OnIncomingCall", (call) => {
    // { SessionId, BuddyId, CallerId, DID, Direction, WithVideo, Time }
    showRinging(call.SessionId, call.CallerId, call.DID);
});

phone.On("OnSessionChange", (session) => {
    // The live session object: Id, State, Status, Direction, ...
    updateCallCard(session.Id, session.State, session.Status);
});

phone.On("OnCallEnded", (ended) => {
    // { SessionId, ReasonCode, ReasonText, TerminatedBy, ... }
    removeCallCard(ended.SessionId);
});
```

Subscribe **before** `phone.Init()`. Events are not replayed: one that fires before you subscribe is
gone. `phone.On` returns a function that unsubscribes.

## 3. Start the phone

Every option is optional on its own, but the phone needs a server and an account to connect.

```js
try {
    await phone.Init({
        ProfileUserId: "alice",          // keeps this account's local data separate
        wssServer: "sip.example.com",    // your WebRTC SIP server's WebSocket host
        WebSocketPort: 443,              // the SDK defaults to 4443
        ServerPath: "/ws",               // default "/ws"
        SipUsername: "alice",
        SipPassword: "secret",
        SipDomain: "example.com",
        DisplayName: "Alice",
        Settings: {
            MediaLocation: "https://cdn.siperb.com/media/",  // the ring, ringback and DTMF tones
        },
    });
} catch (e) {
    // Thrown when the phone cannot connect: the message names the missing options.
    console.error(e.message);
}
```

`MediaLocation` tells the SDK where its tones are (the trailing slash matters). Leave it out
and it looks in `./media/` next to your page, which is what you want only if you host the
files yourself.

`phone.Init()` always tries to connect. If a required value is missing it **throws** and names it,
rather than silently waiting. Fix the value and call `phone.Init()` again.

Using a Siperb account instead of your own server? See
[Siperb provisioning](./siperb-provisioning.md): it fills these values in for you.

## 4. Make and take calls

The call verbs are available once `phone.Init()` has run. Each one takes a session id (or the
session object).

```js
const sessionId = await phone.Dial("+15551234567");   // the session id, or undefined if not placed

await phone.Answer(sessionId);
await phone.Decline(sessionId);
await phone.EndCall(sessionId);

await phone.Hold(sessionId);
await phone.Unhold(sessionId);
await phone.Mute(sessionId);
await phone.Unmute(sessionId);

await phone.SendDtmf(sessionId, "1");
```

That is a working phone. A dial made while the network or registration is not ready yet is held,
not dropped: it goes out as soon as the phone is registered, or ends with a reason if it cannot.

## Next

- [The embedded Browser Phone](./iframe-phone.md), if you would rather drop in a finished UI.
- [Siperb provisioning](./siperb-provisioning.md), to get server and credentials from a Siperb account.
- [Other SIP libraries](./sip-libraries.md): SIP.js, JsSIP or your own client.
- The reference: [calls](../reference/calls.md), [events](../reference/events.md) and
  [settings](../reference/settings.md), and the rest of the [docs index](../README.md#reference).
