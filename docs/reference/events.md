[Docs](../README.md) › Reference › Events

# Events

The SDK tells you what happened through one event bus.

```js
const off = phone.On("OnSessionChange", (session) => render(session));
// later
off();
```

## How the bus works

- **`phone.On(name, handler)`** subscribes and returns a function that unsubscribes. You can have as
  many handlers for one event as you like.
- **Subscribe before `phone.Init()`.** The bus exists as soon as the script has loaded. Events are
  not replayed: one that fires before you subscribe is gone, so draw your first frame from the
  current state (`phone.MyBuddies`, `phone.GetSessions()`) rather than waiting for an event.
- **A handler gets one argument**, the payload. Most payloads carry ids rather than objects;
  look the object up when you need it, for example with `phone.GetSession(id)`.
- **Handlers run straight away**, inside the SDK's own work. Keep them quick. An exception thrown
  in your handler is caught and logged, and does not stop the other handlers.

## Connection

| Event | Payload | When |
| --- | --- | --- |
| `SipProviderStatus` | a string: `"Initial"`, `"Registering"`, `"Registered"`, `"Unregistered"` or `"Failed"` | The registration status changed. `"Failed"` means the server refused the account (a wrong password, for example). |
| `OnNetworkChanged` | `{ isOnline, isConnected, type, changes }` | The device went offline (`changes: ["offline"]`) or came back (`changes: ["online"]`). |
| `AppActive` | `{}` | The page came to the front. The SDK checks its connection on this; you can refresh your own views on it too. |

## Calls

| Event | Payload | When |
| --- | --- | --- |
| `OnIncomingCall` | `{ SessionId, BuddyId, CallerId, DID, Direction, WithVideo, CallId, Time }` | A call arrived. `CallerId` is the caller's name and `DID` their number. |
| `OnSelectLine` | `{ SessionId, BuddyId, Direction, Reason }` | "Show this call." Fires for a call you placed and for an incoming call that is going to ring; never for one that was refused. `Reason` is `"FirstCall"`, `"RingingLine"` (it arrived during another call) or `"OutboundCall"`. The best single event to drive your call screen from. |
| `OnSessionChange` | the live session object | Anything about a call changed: its `State`, `Status`, hold, mute, and so on. Read the fields you draw from the payload. |
| `OnSessionTimer` | `{ SessionId, Timer }` | Once a second while a call is up, for a duration label. `Timer` resets to `0` when the call is answered. |
| `OnCallAnswered` | `{ SessionId, StatusCode, Time, ... }` | The call connected, in either direction. |
| `OnCallFailed` | `{ SessionId, ReasonCode, ReasonText, TerminatedBy, Direction, Time }` | An outgoing call could not be placed at all (offline, not registered, no microphone). |
| `OnCallEnded` | `{ SessionId, CallId, BuddyId, DisplayName, Direction, ReasonCode, ReasonText, TerminatedBy, Duration, TalkTime, Disposition, Time }` | The call is over. `TerminatedBy` is `"Us"` or `"them"`; `Duration` and `TalkTime` are seconds (`TalkTime` is `0` for a call nobody answered). Fires once per call. |
| `OnSessionRemoved` | `{ SessionId }` | The session has left the phone. Read anything you need from `OnCallEnded` instead; the session is gone by now. |

A call's lifecycle, as `OnSessionChange` shows it, is `State` going `Initial` → `Establishing` →
`Established` → `Terminated`, while `Status` says what it is doing: `WaitingForNetwork`,
`Trying`, `Ringing`, `InProgress`, `OnHold`, `Ended`, `Missed` and so on. All the values are in
[Types](./types.md#sessionstatus).

### Transfers and conferences

| Event | Payload |
| --- | --- |
| `OnBlindTransfer` | `{ SessionId, BuddyId }` |
| `OnAttendedTransfer` | `{ SessionId, AttendeeSessionId, TransferTo }` |
| `OnCompleteTransfer` | `{ SessionId, AttendeeSessionId }` |
| `OnCompleteTransferFailed` | `{ SessionId, AttendeeSessionId, Reason, ReasonCode }`: both calls are still up. |
| `OnCancelTransfer` | `{ SessionId, AttendeeSessionId }` |
| `OnJoinConference` | `{ SessionId, ParticipantSessionId }`: the conference is merged. |
| `OnJoinConferenceFailed` | `{ SessionId, Reason }`: both calls are still up. |
| `OnCancelConference` | `{ SessionId, ParticipantSessionId }` |
| `OnHangupConference` | `{ SessionId, ParticipantSessionId }` |

In these, `SessionId` is the original call, `AttendeeSessionId` the consultation and
`ParticipantSessionId` the participant you added.

## Media

| Event | Payload | When |
| --- | --- | --- |
| `OnTrackAdded` | `{ SessionId, Session, Track, Stream, Kind, ... }` | Media arrived from the far end. `Kind` is `"audio"` or `"video"`. The SDK plays audio for you; for video, set `Stream` as the `srcObject` of a `<video>` element. This one payload carries live objects. |
| `OnMuteVideo` / `OnUnmuteVideo` | `{ SessionId, BuddyId }` | Your camera went off / on. |
| `OnPresentationStarted` | `{ SessionId, Presenting }` | You started sharing. |
| `OnPresentationStopped` | `{ SessionId }` | You stopped sharing. |
| `OnRecordingStarted` | `{ SessionId, Recording, RecordingLayout }` | Recording began. |
| `OnRecordingFailed` | `{ SessionId, BuddyId, Phase, Reason }` | Recording could not start (`Phase: "start"`) or finish (`"stop"`). |

### Call quality

| Event | Payload | When |
| --- | --- | --- |
| `OnMediaError` | `{ Type, SessionId, Detail }` | The call is up but its media is in trouble. `Type` is `"NoInboundAudio"` (nothing is arriving from the far end), `"NoOutboundAudio"` (your microphone is sending nothing), `"CameraDenied"` (a video call went ahead as audio) or `"MicrophoneDenied"` (a call could not start). Fires once per problem per call. |
| `OnNetworkQuality` | `{ SessionId, Quality, Label, Mos, Previous }` | The call's quality band changed, in either direction. `Quality` is `"excellent"`, `"good"`, `"fair"`, `"poor"` or `"bad"`. |
| `OnSenderAudioLevels` / `OnReceiverAudioLevels` | `{ SessionId, AudioLevel }` | Ten times a second, for a level meter. `AudioLevel` is `0`–`100`. Needs the [`EnableAudioLevels`](./settings.md#call-quality) setting. |

`OnMediaError` and `OnNetworkQuality` carry keys, not sentences: map them to your own words.
`OnNetworkQuality`, and the `NoInboundAudio` / `NoOutboundAudio` checks, come from a once-a-second
quality sample that runs only when [`EnableQos`](./settings.md#call-quality) is `true`.

## Contacts

| Event | Payload | When |
| --- | --- | --- |
| `BuddyListChanged` | the buddy that changed, or `null` | Anything in the contact list changed, including a call starting or ending on someone. If you draw a contact list, repaint it on this. |
| `OnBuddyAdded` / `OnBuddyUpdated` | the buddy | One contact was added or changed. |
| `OnBuddyDeleted` | a copy of the buddy | A contact was deleted. |

## Messages

| Event | Payload | When |
| --- | --- | --- |
| `OnMessageAdded` | `{ MessageId, BuddyId, Direction, Type, Body, DisplayName, FromNumber }` | A message (or a call record) joined a conversation. **Check both `Direction` and `Type`**: a new incoming chat message is `Direction === "inbound" && Type === "MSG"`. A missed call is also `"inbound"`, with `Type` `"CDR"`. |
| `OnMessageUpdated` | `{ MessageId, BuddyId, Status, Flagged, Keys }` | A message changed, usually its delivery status (`Status`). `Keys` lists what changed. |
| `MessageStreamChanged` | a buddy id, or `null` | A conversation's list of messages changed: repaint it. |

See [Messaging](./messaging.md).

## Events not listed here

The SDK publishes more events than these, for its own use and for its own phone UI. Anything not on
this page is internal and may change without notice.
