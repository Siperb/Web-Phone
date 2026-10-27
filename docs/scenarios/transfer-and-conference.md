[Docs](../README.md) › Scenarios › Transfers and conferences

# Transfers and conferences

Add Transfer and Conference buttons to the [call card](./call-screen.md). Both are off until you
turn them on, so the first step is a setting.

## Turn them on

```js
await phone.Init({
    /* account */
    Settings: { EnableCallTransfer: true, EnableCallConferenceCall: true },
});
```

Each call then carries `session.AllowCallTransfer` and `session.AllowCallConference`. Show a button
only when its flag is `true`:

```js
transferBtn.hidden = !session.AllowCallTransfer;
conferenceBtn.hidden = !session.AllowCallConference;
```

## Blind transfer: send the call on

The caller is passed straight to the new number and your call ends.

```js
await phone.BlindTransfer(callId, "2002");
```

When the server accepts the transfer, `OnBlindTransfer` fires and your call ends a moment later
(`OnCallEnded`, with `Disposition: "BlindTransfer"`). If it refuses, no event fires: the call stays
exactly as it was, the console says why, and the user can try again.

## Attended transfer: talk first, then join them

The caller goes on hold, you call the new party, and you decide whether to hand over.

```js
const consultationId = await phone.AttendedTransfer(callId, "2002");
// The caller is on hold. You are now talking to 2002 on a second call.
```

The consultation is a call of its own: it gets its own `OnSessionChange` events and its own card.
Give that card two buttons:

```js
await phone.CompleteTransfer(consultationId);   // join the caller to 2002, and step out
await phone.CancelTransfer(consultationId);     // hang up on 2002 and take the caller off hold
```

Both take the **consultation** id that `AttendedTransfer` returned, not the original call.

| Event | Means |
| --- | --- |
| `OnAttendedTransfer` | The consultation call was placed. |
| `OnCompleteTransfer` | The two parties are joined; both your calls end. |
| `OnCompleteTransferFailed` | The join was refused. Both calls are still up, so the user can try again or cancel. |
| `OnCancelTransfer` | You hung up the consultation; the caller is back. |

If the person you are consulting hangs up, or never answers, the caller is taken off hold for you.

## Conference: three people on one call

```js
const participantId = await phone.Conference(callId, "2003");   // dials 2003; the caller is on hold
// once 2003 answers:
await phone.JoinConference(participantId);                       // everyone hears everyone
```

Before the join, the user can talk to 2003 privately, or give up with
`phone.CancelConference(participantId)`, which hangs up on 2003 and takes the caller off hold.

After the join:

```js
await phone.HangupConference(participantId);   // drop 2003; you and the caller carry on
await phone.EndCall(callId);                    // end the original call: everyone is hung up
```

Ending the original call ends the whole conference. Mixing the audio happens in the browser, so
the conference lives on the device that started it.

| Event | Means |
| --- | --- |
| `OnJoinConference` | The calls are merged. |
| `OnJoinConferenceFailed` | The merge did not work. Both calls are still up. |
| `OnCancelConference` | You dropped the participant before merging. |
| `OnHangupConference` | You dropped the participant after merging. |

## Choosing the number

`target` can be a number, a contact from `phone.MyBuddies`, or one of a contact's numbers:

```js
await phone.BlindTransfer(callId, alice);                                       // Alice's first number
await phone.BlindTransfer({ SessionId: callId, Buddy: alice, Target: alice.Contacts[1] });
```

## See also

- [Calls: transfers and conferences](../reference/calls.md#transfers).
- [Events: transfers and conferences](../reference/events.md#transfers-and-conferences).
