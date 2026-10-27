[Docs](../README.md) › Reference › Types

# Types

The SDK's fixed values are plain strings. Each set is also available as a frozen object on the
namespace, so you can compare against a name instead of typing the string:

```js
if (session.Status === phone.SessionStatus.OnHold) showHeld();
if (m.Direction === phone.MessageDirection.Inbound && m.Type === phone.MessageType.MSG) notify(m);
```

## SessionState

`phone.SessionState`: where a call is in its life. Every call ends in `Terminated`.

| Value | Meaning |
| --- | --- |
| `"Initial"` | Created; nothing sent yet. |
| `"Establishing"` | Being set up or ringing. |
| `"Established"` | Connected. |
| `"Terminated"` | Over. |

## SessionStatus

`phone.SessionStatus`: what a call is doing. These are the values a UI normally shows:

| Value | Meaning |
| --- | --- |
| `"WaitingForNetwork"` | An outgoing call waiting for the device to be online. |
| `"WaitingForRegister"` | Waiting for the account to be registered. |
| `"WaitingForPermission"` | Waiting for the user to allow the microphone (and camera). |
| `"Trying"` | Sent; the server is working on it. |
| `"Ringing"` | The far end is ringing. |
| `"Incoming"` | An incoming call is ringing here. |
| `"InProgress"` | Connected. |
| `"OnHold"` | Connected and on hold. |
| `"Reconnecting"` | The network changed and the call is being moved to the new connection. |
| `"Transferring"` | Being transferred. |

And the ones a call ends in:

| Value | Meaning |
| --- | --- |
| `"Ended"` | Connected and then hung up, by either side. |
| `"Cancelled"` | You hung up an outgoing call before it was answered. |
| `"Missed"` | An incoming call nobody answered. |
| `"Rejected"` | Declined. |
| `"AnsweredElsewhere"` | An incoming call another of your devices answered. |
| `"Failed"` | Could not be placed or did not connect. |

A few more values exist for the SDK's own use. Treat any value you do not recognise as "in
progress" until `State` is `"Terminated"`.

## SessionDirection

`phone.SessionDirection`: `"inbound"` or `"outbound"`.

## Call outcomes

`OnCallEnded` carries a `Disposition`, the outcome as it is recorded in the call history:

| Value | Meaning |
| --- | --- |
| `"NormalCallClearing"` | The call connected and ended normally. |
| `"NoAnswer"` | Nobody answered. |
| `"BusyHere"` | The far end was busy. |
| `"CallDeclined"` | Declined. |
| `"Cancelled"` | Cancelled before it was answered. |
| `"AnsweredElsewhere"` | Another of your devices answered it. |
| `"DeclinedDoNotDisturb"` / `"DeclinedCallWaiting"` | Refused by your Do Not Disturb / Call Waiting setting. |
| `"FailedNoNetwork"` / `"FailedNotRegistered"` / `"FailedNoPermission"` | An outgoing call that could not start: offline, not registered, or the microphone was refused. |
| `"FailedNetworkLost"` | The network went away while the call was being set up. |
| `"Failed"` | Failed for another reason; `ReasonCode` and `ReasonText` say which. |
| `"BlindTransfer"`, `"AttendedTransfer"`, `"ConferenceCall"` | The call ended by being transferred or merged. |

## Registration status

The value of the `SipProviderStatus` event and of `phone.SipProvider.GetStatus()`:

| Value | Meaning |
| --- | --- |
| `"Initial"` | Not started. |
| `"Registering"` | Connecting and registering. |
| `"Registered"` | Ready to make and take calls. |
| `"Unregistered"` | Not registered: offline, disconnected, or waiting to retry. |
| `"Failed"` | The server refused the account, usually a wrong username or password. Not retried automatically. |

## Messages

`phone.MessageType`: `"MSG"` (a text message), `"CDR"` (a call), `"SYSTEM"`.

`phone.MessageDirection`: `"inbound"` or `"outbound"`.

`phone.MessageDeliveryStatus`: `"QUEUED"`, `"SENT_PENDING"`, `"SENT_CONFIRMED"`, `"FAILED"` (and
`"DELIVERED"` and `"READ"`, which are not written yet). See [Messaging](./messaging.md#delivery-status).

## Media errors

`phone.MediaErrorType`: the `Type` of an `OnMediaError` event.

| Value | Meaning |
| --- | --- |
| `"NoInboundAudio"` | The call is connected but no audio is arriving from the far end. |
| `"NoOutboundAudio"` | The call is connected but your microphone is sending nothing. |
| `"CameraDenied"` | The camera was refused, so a video call went ahead as audio. |
| `"MicrophoneDenied"` | The microphone was refused, so the call could not start. |

## Call screen reasons

`phone.LineSelectReason`: the `Reason` of an `OnSelectLine` event: `"FirstCall"`, `"RingingLine"`
(it arrived while another call was up) or `"OutboundCall"`.
