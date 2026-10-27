[Docs](../README.md) › Reference › Calls

# Calls

Twenty-two commands place, answer and control calls. They exist once `phone.Init()` has run. Each
is `async` and **never rejects**: a command that cannot do what you asked logs a warning to the
console and resolves to `undefined` (or `false`, for `SendDtmf`).

```js
const id = await phone.Dial("+15551234567");
await phone.Hold(id);
await phone.Unhold({ SessionId: id });
await phone.EndCall(id);
```

## Naming the call

Every command except `Dial` needs to know which call you mean. You can tell it four ways:

| You pass | Example |
| --- | --- |
| The session id | `phone.Hold(sessionId)` |
| The session object | `phone.Hold(session)` |
| A buddy (contact) | `phone.Hold(buddy)`: picks that buddy's call, see below |
| An options object | `phone.Hold({ SessionId: sessionId })` |

An options object names the call with `SessionId`, `Session` or `Buddy`. The first one with a value
wins. The options form also carries each command's other values (`Target`, `Tone`, `WithVideo`), so
`phone.SendDtmf({ SessionId: id, Tone: "5" })` and `phone.SendDtmf(id, "5")` are the same call. When
you pass a value both ways, the positional argument wins.

When you name a **buddy** who has more than one call, the command picks the call it makes sense
for: `Answer` takes their incoming call, `Unhold` the one on hold, `CompleteTransfer` the
consultation, and so on (the table below says which). When no call matches, it uses their most
recent one.

## Placing a call

### `phone.Dial(target, withVideo?)` → `Promise<string | undefined>`

Places a call and resolves to the new **session id**, or `undefined` if the call was not placed.

`target` can be:

- a phone number or extension, `"+15551234567"`, `"(555) 123-4567"` or `"2001"`. The formatting is
  stripped for you: only digits, `+`, `*` and `#` are kept, unless you turn on
  [`EnableAlphanumericDial`](./settings.md#calls) to dial names. The call goes to
  `sip:<number>@<SipDomain>`;
- a buddy (a contact object from `phone.MyBuddies`), which calls their first number;
- an options object: `{ Target, WithVideo }`, or `{ Buddy, Target }` to call a particular number of
  that buddy.

```js
await phone.Dial("2001");                                        // audio
await phone.Dial("2001", true);                                  // video
await phone.Dial({ Target: "2001", WithVideo: true });           // the same, as options
await phone.Dial({ Buddy: alice, Target: alice.Contacts[1] });   // Alice's second number
```

Dialling a number nobody in your contacts owns creates a contact for it, so the call has somewhere
to appear in your list.

### What happens before the far end rings

A call does not go straight onto the wire. Before the SDK sends the INVITE, it checks three things,
and the session's `Status` tells you which one it is waiting for:

| `Status` | Waiting for |
| --- | --- |
| `WaitingForNetwork` | The device to be online. |
| `WaitingForRegister` | The account to be registered. |
| `WaitingForPermission` | The user to allow the microphone (and the camera, for a video call). |
| `Trying` | Sent. The server has acknowledged it. |
| `Ringing` | The far end is ringing. The ringback tone starts here, not before. |
| `InProgress` | Answered. |

Each check gives up after `DialSetupTimeoutSeconds` (default `10`). When one fails, the call ends
rather than hanging: the session goes to `Status: "Failed"` and the `OnCallFailed` event carries the
reason. If the camera is refused on a video call, the call goes ahead as an audio call and
`OnMediaError` reports `CameraDenied`. If the microphone is refused, the call fails and
`OnMediaError` reports `MicrophoneDenied`.

## The commands

| Command | Returns | Naming a buddy picks |
| --- | --- | --- |
| `phone.Answer(call)` | the session | their incoming call |
| `phone.Decline(call)` | the session | their incoming call |
| `phone.EndCall(call)` | the session | their most recent call |
| `phone.Hold(call)` | the session | a call not already on hold |
| `phone.Unhold(call)` | the session | a call that is on hold |
| `phone.Mute(call)` | the session | a call not already muted |
| `phone.Unmute(call)` | the session | a call that is muted |
| `phone.SendDtmf(call, tone)` | `boolean` | their most recent call |
| `phone.MuteVideo(call)` | the session | a call whose camera is on |
| `phone.UnmuteVideo(call)` | the session | a call whose camera is off, or that has no video yet |
| `phone.SwitchCamera(call)` | the session | their most recent call |
| `phone.StartRecording(call)` | the session | a call not already recording |
| `phone.StopRecording(call)` | the session | a call that is recording |
| `phone.BlindTransfer(call, target)` | the transferred call | the call being transferred |
| `phone.AttendedTransfer(call, target)` | the **consultation** call | the call being transferred |
| `phone.CompleteTransfer(consultation)` | the session | the consultation |
| `phone.CancelTransfer(consultation)` | the session | the consultation |
| `phone.Conference(call, target)` | the **participant's** call | the call you are adding to |
| `phone.JoinConference(participant)` | the session | the participant's call |
| `phone.CancelConference(participant)` | the session | the participant's call |
| `phone.HangupConference(participant)` | the session | the participant's call |

`phone.Decline` sends **603 Declined**: the user said no, so the server stops ringing the account's
other devices and moves the caller on (to voicemail, or the next number).

`phone.EndCall` is the one "hang up" button: it ends a connected call, cancels an outgoing call
that is still ringing, and declines an incoming one (as `Decline` would).

### Keypad tones

`phone.SendDtmf(call, tone)` sends one or more tones (`"0"`–`"9"`, `"*"`, `"#"`, `"A"`–`"D"`, and
`","` for a short pause) and resolves to `true` only when they actually went out. Tones are sent in the audio as RFC 4733
telephone-events. Set [`DtmfType`](./settings.md#calls) to `"info"` for a server that only accepts
SIP INFO.

### Video

`phone.MuteVideo` turns the camera off (its light goes out) and keeps the call a video call.
`phone.UnmuteVideo` turns it back on, and on an audio-only call it adds video, so there is no
separate "upgrade to video" command. `phone.SwitchCamera` flips between the front and back camera.

The far end's video arrives on the `OnTrackAdded` event, and your own camera's stream is
`session.RtpSenderVideoMediaStream`. See [Events](./events.md#media).

### Transfers

A **blind** transfer sends the call on without you speaking to the new party:

```js
await phone.BlindTransfer(callId, "2002");
```

An **attended** transfer puts the caller on hold, calls the new party so you can speak to them
first, and then joins the two:

```js
const consultation = await phone.AttendedTransfer(callId, "2002");
// ... talk to 2002 ...
await phone.CompleteTransfer(consultation);   // join them and step out
// or
await phone.CancelTransfer(consultation);     // hang up on 2002, back to the caller
```

`CompleteTransfer` and `CancelTransfer` take the **consultation** call that `AttendedTransfer`
returned, not the original one.

`target` is a number, a contact (`{ Number }`) or a buddy, or `Target` / `Contact` / `Number` in
the options object.

### Conference calls

```js
const participant = await phone.Conference(callId, "2003");   // dials 2003, nobody merged yet
await phone.JoinConference(participant);                       // everyone hears everyone
await phone.HangupConference(participant);                     // drop 2003; the rest carry on
```

`phone.CancelConference(participant)` drops a participant you dialled but have not merged yet.

Ending the main call ends the whole conference, including every participant.

### Recording

`phone.StartRecording` and `phone.StopRecording` record the call in the browser. Set
[`EnableCallRecording`](./settings.md#recording) to `true` to tell your UI it may offer recording
(it turns on `session.AllowCallRecording`), and `RecordAllCalls` to record every call without a
button. A video call is recorded with both pictures; the layout is a setting.

### Sharing the screen

```js
await phone.PresentScreen(callId);    // the browser asks which screen or window
await phone.StopPresenting(callId);   // back to the camera, or to no video
```

These two take the session id or the session object, and resolve to `{ Success, Reason }`.
`phone.PresentScreen` exists only in a browser that can share its screen; check
`session.AllowPresentScreen` before offering it. Sharing on an audio call adds video to the call
for as long as you share.

## What a call can do

Every session carries flags saying what the UI may offer for that call, worked out from your
settings and from what the browser can do. Show a button only when its flag is `true`:

| Flag | Offer |
| --- | --- |
| `session.AllowCallTransfer` | Transfer |
| `session.AllowCallConference` | Conference |
| `session.AllowCallRecording` | Record |
| `session.AllowPresentScreen` | Share the screen |

## Incoming calls

An incoming call arrives as the `OnIncomingCall` event. Answer or decline it with the session id
the event carries:

```js
phone.On("OnIncomingCall", (call) => {
    if (confirm("Call from " + call.CallerId + "?")) phone.Answer(call.SessionId);
    else phone.Decline(call.SessionId);
});
```

The SDK plays the ringtone itself, and stops it on answer, decline or hang-up. Do not play your own
on `OnIncomingCall`.

Do Not Disturb, Call Waiting and Auto Answer are [settings](./settings.md#incoming-calls), not
commands. A call one of them refuses is still announced by `OnIncomingCall` and then ends straight
away (`OnCallEnded`). To show only the calls that will actually ring, draw your incoming-call screen
from `OnSelectLine` instead: it fires only for a call the user should see. See
[Events](./events.md#calls).
