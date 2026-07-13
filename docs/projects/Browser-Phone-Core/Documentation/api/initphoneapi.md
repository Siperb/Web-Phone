[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## InitPhoneAPI() function

Initializes the PhoneAPI by attaching all public call-control, buddy-management, and recording methods to the global `window.phone` object.

Tagged `@PhoneAPI`; most attached methods (see the Remarks table) are part of the Phone API export manifest — listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
export function InitPhoneAPI(): void
```

<b>Returns:</b>

void

## Remarks

`InitPhoneAPI()` takes no arguments. It captures the already-created `window.phone` object once (the object is never replaced after init, since every module that assigns to it is guarded by `if (!window.phone)`) and attaches the runtime API surface listed below.

This file is the primary public call-control, buddy-management, and recording surface of the library. Methods marked "(Phone API)" carry an `@PhoneAPI` docstring tag in source, indicating they are part of the curated, cross-project-exported Phone API.

Many of the call-control methods accept a flexible `param` that may be a `sessionId` string, a `SessionObject`, or a `BuddyObject`; internal type-guard helpers resolve it to a concrete session before acting. These methods delegate the underlying VoIP work to the resolved provider (via `phone.GetProvider(...)`) or to the corresponding `phone.On*` callback (e.g. `OnAudioCall`, `OnHold`, `OnBlindTransfer`).

### Runtime API attached to `window.phone`

|  Method | Signature | Description |
|  --- | --- | --- |
|  [Dial](./phone.dial.md) | <code>Dial(param: string \| BuddyObject, withVideo?: boolean, provider?: string): Promise&lt;string \| undefined&gt;</code> | Dials a call to a dial string, BuddyObject, or buddyId; resolves to the sessionId when awaited. (Phone API) |
|  [EndCall](./phone.endcall.md) | <code>EndCall(param: string \| SessionObject \| BuddyObject): Promise&lt;SessionObject \| undefined&gt;</code> | Ends a call (hangup, decline, or cancel depending on state/direction); resolves to the ended session. (Phone API) |
|  [Answer](./phone.answer.md) | <code>Answer(param: string \| SessionObject \| BuddyObject): Promise&lt;SessionObject \| undefined&gt;</code> | Answers an incoming call; resolves to the answered session. (Phone API) |
|  [Decline](./phone.decline.md) | <code>Decline(sessionId: string): Promise&lt;void&gt;</code> | Declines a call by session ID via `phone.OnDecline`. (Phone API) |
|  [Hold](./phone.hold.md) | <code>Hold(param: string \| SessionObject \| BuddyObject): Promise&lt;SessionObject \| undefined&gt;</code> | Places a call on hold via `phone.OnHold`; resolves to the session. (Phone API) |
|  [Unhold](./phone.unhold.md) | <code>Unhold(param: string \| SessionObject \| BuddyObject): Promise&lt;SessionObject \| undefined&gt;</code> | Takes a call off hold via `phone.OnUnhold`; resolves to the session. (Phone API) |
|  [Mute](./phone.mute.md) | <code>Mute(param: string \| SessionObject \| BuddyObject): Promise&lt;SessionObject \| undefined&gt;</code> | Mutes a call via `phone.OnMute`; resolves to the session. (Phone API) |
|  [Unmute](./phone.unmute.md) | <code>Unmute(param: string \| SessionObject \| BuddyObject): Promise&lt;SessionObject \| undefined&gt;</code> | Unmutes a call via `phone.OnUnmute`; resolves to the session. (Phone API) |
|  [BlindTransfer](./phone.blindtransfer.md) | <code>BlindTransfer(param: string \| SessionObject \| BuddyObject, destination: string \| BuddyObject): Promise&lt;void&gt;</code> | Immediately transfers a call to a dial string, buddyId, or BuddyObject via `phone.OnBlindTransfer`. (Phone API) |
|  [AttendedTransfer](./phone.attendedtransfer.md) | <code>AttendedTransfer(param: string \| SessionObject \| BuddyObject, destination: string \| BuddyObject): Promise&lt;{ session: SessionObject; childSessionId: string } \| undefined&gt;</code> | Begins a consultative transfer (holds the current call and dials the destination); returns the session and child session ID. (Phone API) |
|  [CompleteTransfer](./phone.completetransfer.md) | <code>CompleteTransfer(childSessionId: string): Promise&lt;void&gt;</code> | Completes a pending attended transfer via `phone.OnCompleteTransfer`. (Phone API) |
|  [CancelTransfer](./phone.canceltransfer.md) | <code>CancelTransfer(childSessionId: string): Promise&lt;void&gt;</code> | Cancels a pending attended transfer and restores the original call via `phone.OnCancelAttendedTransfer`. (Phone API) |
|  [SendDtmf](./phone.senddtmf.md) | <code>SendDtmf(sessionId: string, dtmf: string): boolean</code> | Sends DTMF tones to a session via the session's provider; returns whether a provider was found. (Phone API) |
|  [AddBuddy](./phone.addbuddy.md) | <code>AddBuddy(buddy: BuddyObject): Promise&lt;BuddyObject \| void \| null&gt;</code> | Adds a new buddy to the buddy list, persists it, and raises `OnBuddyAdded`; returns null if a duplicate exists. (Phone API) |
|  [DeleteBuddy](./phone.deletebuddy.md) | <code>DeleteBuddy(buddy: BuddyObject): Promise&lt;void&gt;</code> | Removes a buddy from the buddy list, persists the change, and raises `OnBuddyDeleted`. (Phone API) |
|  [UpdateBuddy](./phone.updatebuddy.md) | <code>UpdateBuddy(buddy: BuddyObject): Promise&lt;void&gt;</code> | Updates an existing buddy, applies presence subscribe/unsubscribe from `buddy.Subscribe`, persists it, and raises `OnBuddyUpdated`. (Phone API) |
|  [SaveRecording](./phone.saverecording.md) | <code>SaveRecording(recording: RecordingObject): Promise&lt;void&gt;</code> | Saves a call recording to the `CallRecordings` IndexStorage store. (Phone API) |
|  [GetRecording](./phone.getrecording.md) | <code>GetRecording(recordingId: string): Promise&lt;RecordingObject \| null&gt;</code> | Retrieves a saved recording by ID, or null if not found. (Phone API) |
|  [PlayRecording](./phone.playrecording.md) | <code>PlayRecording(recording: RecordingObject \| string): Promise&lt;void&gt;</code> | Plays a saved recording (by object or ID), managing the audio element DOM and cleanup. (Phone API) |
|  [GenerateRecordingThumbnail](./phone.generaterecordingthumbnail.md) | <code>GenerateRecordingThumbnail(recording: RecordingObject \| string): Promise&lt;string \| null&gt;</code> | Returns a JPEG thumbnail data URL for a video recording, generating and persisting it if absent; null for audio-only or on error. |
|  [GetSubscriptions](./phone.getsubscriptions.md) | <code>GetSubscriptions(): BuddyObject[]</code> | Returns the `MyBuddies` entries currently flagged `Subscribe`. |
|  [GetRecentCalls](./phone.getrecentcalls.md) | <code>GetRecentCalls(filter: string): Promise&lt;Array&lt;{ Name: string; Number: string; Direction: string; Timestamp: string }&gt;&gt;</code> | Returns up to 50 recent CDR records from the `MessageStream` store (newest first), optionally filtered by number/name/direction (email filters are MD5-hashed). (Phone API) |
|  [LoadAddressBook](./phone.loadaddressbook.md) | <code>LoadAddressBook(): Promise&lt;any[]&gt;</code> | Lazy-loads and returns the address book entries from the `AddressBook` IndexStorage store, caching them on `phone.AddressBook`. (Phone API) |
|  [AddAddressBookEntry](./phone.addaddressbookentry.md) | <code>AddAddressBookEntry(entry: any): Promise&lt;void&gt;</code> | Adds an entry to `phone.AddressBook` (assigning an `Id` via `phone.UID()` if absent) and persists it to the `AddressBook` store. (Phone API) |
|  [DeleteAddressBookEntry](./phone.deleteaddressbookentry.md) | <code>DeleteAddressBookEntry(entryId: string): Promise&lt;void&gt;</code> | Removes the entry with the given `Id` from `phone.AddressBook` and deletes it from the `AddressBook` store. (Phone API) |

## Example

```typescript
// Dial a number and await the sessionId, then hold, send a DTMF tone, and hang up.
const sessionId = await window.phone.Dial("*65");

if (sessionId) {
  await window.phone.Hold(sessionId);
  await window.phone.Unhold(sessionId);
  window.phone.SendDtmf(sessionId, "1#");
  await window.phone.EndCall(sessionId);
}

// Dial with video using an explicit provider.
await window.phone.Dial("*65", true, "sip");
```
