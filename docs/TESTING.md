# Browser Phone — QA & Testing Master Reference

### Quick Nav

- [📘 Overview](#-overview)
- [⚙️ Phone API Test Surface](#️-phone-api-test-surface)
- [✅ Initialization Checklist](#-initialization-checklist)
- [🔄 Call State Machine](#-call-state-machine)
- [📞 Making a Call](#-making-a-call)
- [📊 Call Status Enumeration](#-call-status-enumeration)
- [📋 Disposition Codes](#-disposition-codes)
- [📡 Events Catalogue](#-events-catalogue)
- [📄 CDR Structure](#-cdr-structure)
- [🖥️ UI Interaction Points](#️-ui-interaction-points)

---

## 📘 Overview

This document is the single authoritative QA reference for the Browser Phone stack. It covers every observable surface that automated and manual tests can drive or assert against:

- The `window.phone` API (call control, buddy management, recordings)
- The `CallState` / `CallStatus` state machines emitted by the SIP provider
- SIP.js `SessionState` lifecycle as propagated through `OnSessionStateChange`
- All disposition codes produced in Call Detail Records
- All events emitted by `window.phone.RaiseEvent`
- CDR field shapes
- DOM selectors and session fields used by the UI layer

**Source layers:**
- `Browser-Phone-Core` — `window.phone` public API, event bus
- `Browser-Phone-SipProvider` — SIP session management, `CallState`, `CallStatus`, `Dispositions`, CDRs
- `Browser-Phone-UI` — DOM interaction points, session field bindings

---

## ⚙️ Phone API Test Surface

<details open>
<summary><strong>Initialization pattern</strong></summary>

The phone must be initialized in this exact order. Tests that skip any step will find the API non-functional.

```js
// 1. Wire up storage (required — phone will not function without these)
window.phone.LoadFromStorage = async (storeName) => { /* your impl */ };
window.phone.SaveToStorage   = async (storeName, data) => { /* your impl */ };

// 2. Register incoming-call handler before init
window.phone.OnIncomingCall = (details) => {
    // details: { SessionId, Time, BuddyId, CallerId, DID, Direction, WithVideo }
    window.phone.Answer(details.SessionId);
};

// 3. Initialise the phone core
await window.phone.InitBrowserPhone();

// 4. Register a provider (must happen after Init)
window.phone.AddProvider({ Type: "sip", /* ...provider config... */ });
```

</details>

### API Reference Table

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `Dial` | `Dial(param: string \| BuddyObject, withVideo?: boolean, provider?: string): Promise<string \| undefined>` | Session ID or `undefined` | Polymorphic; `provider` defaults to `"sip"` |
| `EndCall` | `EndCall(param: string \| SessionObject \| BuddyObject): Promise<SessionObject \| undefined>` | Ended session or `undefined` | Dispatches Hangup / Decline / Cancel depending on state |
| `Answer` | `Answer(param: string \| SessionObject \| BuddyObject): Promise<SessionObject \| undefined>` | Answered session or `undefined` | Prefers sessions with `State === "Ringing"` or `"Incoming"` when passed a `BuddyObject` |
| `Decline` | `Decline(sessionId: string): Promise<void>` | `void` | Session ID only; no polymorphism |
| `Hold` | `Hold(param: string \| SessionObject \| BuddyObject): Promise<SessionObject \| undefined>` | Session or `undefined` | Prefers `State === "Established"` when passed a `BuddyObject` |
| `Unhold` | `Unhold(param: string \| SessionObject \| BuddyObject): Promise<SessionObject \| undefined>` | Session or `undefined` | Prefers sessions where `isOnHold === true` |
| `Mute` | `Mute(param: string \| SessionObject \| BuddyObject): Promise<SessionObject \| undefined>` | Session or `undefined` | Prefers `State === "Established"` |
| `Unmute` | `Unmute(param: string \| SessionObject \| BuddyObject): Promise<SessionObject \| undefined>` | Session or `undefined` | Prefers sessions where `isOnMute === true` |
| `BlindTransfer` | `BlindTransfer(param: string \| SessionObject \| BuddyObject, destination: string \| BuddyObject): Promise<void>` | `void` | Immediate transfer; no consultation |
| `AttendedTransfer` | `AttendedTransfer(param: string \| SessionObject \| BuddyObject, destination: string \| BuddyObject): Promise<{ session: SessionObject, childSessionId: string } \| undefined>` | `{ session, childSessionId }` or `undefined` | Places original on hold; dials destination |
| `CompleteTransfer` | `CompleteTransfer(childSessionId: string): Promise<void>` | `void` | Completes attended transfer |
| `CancelTransfer` | `CancelTransfer(childSessionId: string): Promise<void>` | `void` | Aborts attended transfer; restores original call |
| `SendDtmf` | `SendDtmf(sessionId: string, dtmf: string): boolean \| undefined` | `true` / `false` / `undefined` | **Not async**; dispatches synchronously, sends asynchronously |
| `AddBuddy` | `AddBuddy(buddy: BuddyObject): Promise<BuddyObject \| void>` | Validated buddy or `null` | Returns `null` (not `undefined`) for duplicate `Id` or `DisplayName` |
| `DeleteBuddy` | `DeleteBuddy(buddy: BuddyObject): Promise<void>` | `void` | Fires `OnBuddyDeleted`; refreshes UI |
| `UpdateBuddy` | `UpdateBuddy(buddy: BuddyObject): Promise<void>` | `void` | UI refresh happens after Promise resolves |
| `SaveRecording` | `SaveRecording(recording: RecordingObject): Promise<void>` | `void` | Persists to `"CallRecordings"` IndexedDB store |
| `GetRecording` | `GetRecording(recordingId: string): Promise<RecordingObject \| null>` | Recording or `null` | Returns `null` on error |
| `PlayRecording` | `PlayRecording(recording: RecordingObject \| string): Promise<void>` | `void` | Appends `<audio>` to `document.body` — **requires a DOM** |
| `GenerateRecordingThumbnail` | `GenerateRecordingThumbnail(recording: RecordingObject \| string): Promise<string \| null>` | JPEG data URL or `null` | `null` for audio-only; defaults canvas to 320×180 |

### What to assert per method

<details>
<summary><strong>Dial</strong></summary>

```js
// Assert: returns a session ID string when awaited
const sessionId = await window.phone.Dial("*65");
console.assert(typeof sessionId === "string", "Dial should return a session ID string");

// Assert: video call uses withVideo flag
const videoSessionId = await window.phone.Dial("*65", true);
console.assert(typeof videoSessionId === "string");

// Assert: fire-and-forget returns undefined (not awaited)
const result = window.phone.Dial("*65");
// result is a Promise — do not assert its value synchronously
```

**Edge cases to test:**
- `param` that matches no buddy → creates a temporary buddy in `window.phone.MyBuddies`
- `param` that is a known `BuddyObject` → uses its first contact
- `provider` argument is honoured when no buddy is found

</details>

<details>
<summary><strong>Answer / Decline / EndCall</strong></summary>

```js
// Register incoming call handler
window.phone.OnIncomingCall = (details) => {
    window.phone.Answer(details.SessionId);
};

// Assert Answer returns the session
const session = await window.phone.Answer(sessionId);
console.assert(session !== undefined, "Answer should return a session");

// Assert Decline is a no-op when session not found
window.phone.Decline("nonexistent-id"); // must not throw

// Assert EndCall dispatches Hangup for Established sessions
const endedSession = await window.phone.EndCall(sessionId);
console.assert(endedSession !== undefined, "EndCall should return the session");
```

**Note:** `EndCall` waits 1 000 ms before calling `RemoveSession`. Do not assert session absence immediately after `EndCall` resolves.

</details>

<details>
<summary><strong>Hold / Unhold / Mute / Unmute</strong></summary>

```js
await window.phone.Hold(sessionId);
// Assert: session.isOnHold === true after core processes the hold

await window.phone.Unhold(sessionId);
// Assert: session.isOnHold === false

await window.phone.Mute(sessionId);
// Assert: session.isOnMute === true

await window.phone.Unmute(sessionId);
// Assert: session.isOnMute === false
```

</details>

<details>
<summary><strong>AttendedTransfer</strong></summary>

```js
const result = await window.phone.AttendedTransfer(sessionId, "*200");
console.assert(result !== undefined, "AttendedTransfer must return a result");
const { childSessionId } = result;

// Complete path
await window.phone.CompleteTransfer(childSessionId);

// Cancel path
await window.phone.CancelTransfer(childSessionId);
```

</details>

<details>
<summary><strong>SendDtmf return values</strong></summary>

| Condition | Return value |
|---|---|
| Session found, provider found | `true` (dispatch initiated) |
| Session found, provider not found | `false` |
| Session not found | `undefined` |

```js
const result = window.phone.SendDtmf(sessionId, "1#");
// result is boolean | undefined — not a Promise
```

</details>

<details>
<summary><strong>AddBuddy duplicate semantics</strong></summary>

```js
const buddy = await window.phone.AddBuddy({ Id: uid, DisplayName: "Alice", Contacts: [...] });
console.assert(buddy !== null, "AddBuddy should return the buddy on success");

// Duplicate ID
const dup = await window.phone.AddBuddy({ Id: uid, DisplayName: "Alice2", Contacts: [...] });
console.assert(dup === null, "AddBuddy should return null for duplicate Id");

// Duplicate DisplayName
const dup2 = await window.phone.AddBuddy({ Id: uid2, DisplayName: "Alice", Contacts: [...] });
console.assert(dup2 === null, "AddBuddy should return null for duplicate DisplayName");
```

</details>

---

## ✅ Initialization Checklist

A correctly initialized phone satisfies all of the following:

| # | Assertion | How to verify |
|---|---|---|
| 1 | `window.phone` is defined | `typeof window.phone === "object"` |
| 2 | `window.phone.EventTypes` is populated | `typeof window.phone.EventTypes.OnSessionStarted === "string"` |
| 3 | `window.phone.RaiseEvent` is a function | `typeof window.phone.RaiseEvent === "function"` |
| 4 | `window.phone.MyBuddies` is an array | `Array.isArray(window.phone.MyBuddies)` |
| 5 | `LoadFromStorage` is assigned before `InitBrowserPhone` | Must be set before calling init |
| 6 | `SaveToStorage` is assigned before `InitBrowserPhone` | Must be set before calling init |
| 7 | `OnIncomingCall` handler is registered before `InitBrowserPhone` | Incoming calls that arrive before registration will be missed |
| 8 | `AddProvider` is called **after** `InitBrowserPhone` | Provider registration before init is not supported |
| 9 | Provider is of a supported type (e.g. `"sip"`) | Check `window.phone.GetProvider("sip")` returns a non-null object |
| 10 | `window.phone.Webhooks` is an object or will be lazily created on first `RaiseEvent` call | Do not pre-check; it is initialised on first use |

**Correct initialization sequence:**

```js
window.phone.LoadFromStorage = async (storeName) => { /* your impl */ };
window.phone.SaveToStorage   = async (storeName, data) => { /* your impl */ };

window.phone.OnIncomingCall = (details) => {
    window.phone.Answer(details.SessionId);
};

await window.phone.InitBrowserPhone();

window.phone.AddProvider({ Type: "sip", /* ...config... */ });
```

---

## 🔄 Call State Machine

### `CallState` — Coarse lifecycle stage

Source: `src/SipProviderTypes.ts` — `CallState` enum. Set on `Session.Data.CallState` via `UpdateCallState()`.

| Key | String value | Description | When set |
|---|---|---|---|
| `Initial` | `"Inital"` | Session object created, no SIP activity yet | Session first created |
| `Inital` *(deprecated alias)* | `"Inital"` | Same string value as `Initial`; backward compat only | — |
| `Establishing` | `"Establishing"` | SIP INVITE sent (outbound) or received (inbound) — not yet answered | On dial / on ring |
| `Established` | `"Established"` | Call answered and media is flowing | `OnAccept` / answer |
| `Terminated` | `"Terminated"` | Call ended by any party | BYE, Cancel, Hangup |
| `Rejected` | `"Rejected"` | Call rejected before being answered | Remote 4xx/6xx; attended-transfer reject |
| `Disconnected` | `"Disconnected"` | Transport or provider lost | Transport failure; also used as default on freshly constructed session objects |

> **Critical typo:** The string value for `Initial` is `"Inital"` (missing the second `i`). This is **intentional** to preserve backward compatibility with serialised session data. `CallState.Initial === "Inital"` is `true`.

### Valid `CallState` transitions

```
Initial ("Inital")
    │
    ├──► Establishing ──► Established ──► Terminated
    │         │
    │         ├──► Rejected  (remote 4xx/6xx before answer)
    │         │
    │         └──► Terminated  (cancelled before answer)
    │
    └──► Disconnected  (transport failure at any point)

Established ──► Rejected  (attended-transfer reject path)
```

| From | To | Trigger |
|---|---|---|
| `Initial` | `Establishing` | `Dial()` called (outbound) or INVITE received (inbound) |
| `Establishing` | `Established` | `OnAccept` — SIP 200 OK received/sent |
| `Establishing` | `Terminated` | BYE, Cancel, or Hangup before answer |
| `Establishing` | `Rejected` | Remote 4xx/6xx received before answer |
| `Established` | `Terminated` | BYE, Hangup — normal call end |
| `Established` | `Rejected` | Attended-transfer reject path |
| `*` | `Disconnected` | Transport-level failure |

### `CallStatus` — Fine-grained activity

Source: `src/SipProviderTypes.ts` — `CallStatus` enum. Set on `Session.Data.CallStatus` via `UpdateCallStatus()`.

#### Pre-answer — Outbound

| Key | String | Meaning |
|---|---|---|
| `StartingAudioCall` | `"StartingAudioCall"` | Building SDP offer for an audio-only call |
| `StartingVideoCall` | `"StartingVideoCall"` | Building SDP offer for a video call |
| `Trying` | `"Trying"` | INVITE sent, awaiting provisional response |
| `Ringing` | `"Ringing"` | 180 Ringing received from remote |
| `Connecting` | `"Connecting"` | 183 Session Progress / SDP negotiation underway |
| `SessionInProgress` | `"SessionInProgress"` | Session in progress (182 or multi-party) |
| `Redirect` | `"Redirect"` | 181 / 3xx redirect received |

#### Pre-answer — Inbound

| Key | String | Meaning |
|---|---|---|
| `Incoming` | `"Incoming"` | Inbound INVITE received, ringing locally |
| `Answering` | `"Answering"` | Answer in progress (media / SDP being negotiated) |

#### Active call

| Key | String | Meaning |
|---|---|---|
| `CallInProgress` | `"CallInProgress"` | Call answered and actively connected |
| `InProgress` | `"InProgress"` | Transient restore state — set briefly during Unhold / Unmute before returning to `CallInProgress` |
| `OnHold` | `"OnHold"` | Call is on hold |
| `OnMute` | `"OnMute"` | Microphone muted; call still connected |
| `Conference` | `"Conference"` | Conference leg active |
| `RecordingStarted` | `"RecordingStarted"` | Recording is underway |
| `RecordingStopped` | `"RecordingStopped"` | Recording was stopped |

#### Terminal

| Key | String | Meaning |
|---|---|---|
| `Ended` | `"Ended"` | Call ended normally (BYE / hangup) |
| `Cancelled` | `"Cancelled"` | Outbound call cancelled before answer |
| `Missed` | `"Missed"` | Inbound call not answered (remote hung up) |
| `Failed` | `"Failed"` | Call failed due to infrastructure / server error |
| `Rejected` | `"Rejected"` | Call rejected (4xx / 6xx; some attended-transfer reject flows) |
| `AnsweredElsewhere` | `"AnsweredElsewhere"` | Answered on a different device/line |
| `Disconnected` | `"Disconnected"` | Provider or session disconnected |
| `Redirect` | `"Redirect"` | SIP redirect (also appears as terminal in some flows) |

### `CallView` — UI render mode

| Key | String | Meaning |
|---|---|---|
| `Basic` | `"basic"` | Compact / minimal call tile |
| `Extended` | `"extended"` | Full / expanded call UI |

### Typical call flow diagram

```
OUTBOUND                                    INBOUND
────────                                    ───────
State:  Inital                              State:  Inital
Status: StartingAudioCall                   Status: Incoming
        │                                           │
State:  Establishing                        State:  Establishing
Status: Trying                              Status: Answering
        │                                           │
Status: Ringing                             Status: Connecting
        │                                           │
Status: Connecting                          State:  Established
        │                                   Status: CallInProgress
State:  Established                                 │
Status: CallInProgress                      ┌───────┴───────┐
        │                                OnHold           OnMute
┌───────┴───────┐                           │                 │
OnHold        OnMute                    InProgress        InProgress
   │               │                        │                 │
InProgress     InProgress              CallInProgress    CallInProgress
   │               │                        │
CallInProgress  CallInProgress          State:  Terminated
        │                               Status: Ended / Missed / AnsweredElsewhere
State:  Terminated
Status: Ended

── Cancelled before answer ─────────────────────────────────
State:  Terminated
Status: Cancelled / Rejected / Failed
```

> **Note:** `CallStatus.InProgress` is **transient** — it is set only for the brief moment when an Unhold or Unmute operation completes, before the status returns to `CallInProgress`. Tests must not treat `InProgress` as a stable display state.

---

## 📞 Making a Call

This section explains how to detect call outcomes using both SIP.js `SessionState` (from `OnSessionStateChange`) and the higher-level `CallState` / `CallStatus` enums.

### SIP.js `SessionState` — provider-level lifecycle

Source: `src/SipProviderTypes.ts` — `SipProviderPostMessage.OnSessionStateChange`; `src/SipProvider.ts` — `Session.RTPSession.stateChange.addListener(...)`

`OnSessionStateChange` is the canonical **session lifecycle** PostMessage event. It is the closest equivalent to an "OnSessionChanged" event.

| SIP.js state | Practical meaning | Notes |
|---|---|---|
| `Initial` | Session object exists but is not yet establishing | Seen in guards like "cancel while still setting up" |
| `Establishing` | INVITE transaction / negotiation is in progress | Overlaps with `OnTrying` / `OnProgress` |
| `Established` | Dialog is established | Aligns with "call in progress" once media is flowing |
| `Terminated` | Session is ended | Terminal; no more in-call actions should be attempted |

### `OnSessionStateChange` payload

```typescript
{
  Event: "OnSessionStateChange",
  Source: "SipProvider",
  Destination: "Phone",
  Data: {
    SessionId: string,
    Time: string,     // ISO timestamp from provider TimeNow()
    State: string     // SIP.js SessionState: "Initial" | "Establishing" | "Established" | "Terminated"
  }
}
```

> `Data.State` is the **SIP.js** session state string, not `CallState` or `CallStatus`. Do not treat them as interchangeable.

### Subscribing to session state changes

```js
const unsubscribe = window.phone.OnSessionChange(({ sessionId, state, event }) => {
    console.log(`Session ${sessionId} → ${state} via ${event}`);
});
// Call unsubscribe() to stop listening
unsubscribe();
```

Or via the DOM event bus:

```js
window.addEventListener("OnSessionStateChange", (event) => {
    const { SessionId, State } = event.detail;
    console.log(`Session ${SessionId} state → ${State}`);
});
```

### Outbound call — typical event sequence

| Order | What happens | PostMessage events | SIP.js session state |
|---|---|---|---|
| 1 | INVITE is sent | `OnTrying` | `Establishing` |
| 2 | Ringing / early media | `OnProgress` (180 / 183) | `Establishing` |
| 3 | 200 OK received | `OnCallAnswered`, `OnAccept` | `Established` |
| 4 | Media becomes usable | `OnCallConnected` | `Established` |
| 5 | Call ends | `OnBye` / `OnByeSent` / `OnHangup` | `Terminated` |

### Inbound call — typical event sequence

| Order | What happens | PostMessage events | SIP.js session state |
|---|---|---|---|
| 1 | INVITE received | `OnIncomingCall` | `Initial` or `Establishing` |
| 2 | User answers | `OnAccept` (once 200 OK is sent) | `Established` |
| 3 | Media becomes usable | `OnCallConnected` | `Established` |
| 4 | Call ends | `OnBye` / `OnHangup` | `Terminated` |

### Detecting call outcomes in tests

| Outcome | How to detect |
|---|---|
| **Call established** | `OnSessionStateChange` → `State === "Established"` AND `OnCallConnected` received |
| **Call rejected** | `OnSessionStateChange` → `State === "Terminated"` AND `OnInviteRejectedByThem` received; `CallState === "Rejected"` |
| **Call cancelled (outbound)** | `OnSessionStateChange` → `State === "Terminated"` AND `OnInviteCancelledByUs` received |
| **Call missed (inbound)** | `OnSessionStateChange` → `State === "Terminated"` AND `OnInviteCancelledByThem` received |
| **Call ended normally** | `OnSessionStateChange` → `State === "Terminated"` AND `OnBye` or `OnByeSent` received |
| **Transport failure** | `CallState === "Disconnected"` |

**Recommended terminal signal:** `State === "Terminated"` on `OnSessionStateChange` is the **most reliable** ended signal, even if some call-flow events are missed due to network/SIP timing.

### Call-flow events vs. session lifecycle

`OnSessionStateChange` is a **lifecycle signal**. The other PostMessage events are **call-flow signals**. Use both for robust assertions:

| Event | Meaning | Session state when seen |
|---|---|---|
| `OnTrying` | Outbound INVITE sent | `Establishing` |
| `OnProgress` | Provisional response (180 / 183) received | `Establishing` |
| `OnCallAnswered` | 200 OK received (call answered at SIP level) | `Established` |
| `OnAccept` | Call fully accepted (SIP 200 OK received / sent) | `Established` |
| `OnCallConnected` | Media connected / usable | `Established` |

---

## 📊 Call Status Enumeration

All values are from `src/SipProviderTypes.ts`. The SIP layer sets machine-readable enum values only. Browser-Phone-Core maps them to localised display strings.

### Outbound pre-answer

| Value | String | Meaning |
|---|---|---|
| `StartingAudioCall` | `"StartingAudioCall"` | Building SDP offer for audio-only call |
| `StartingVideoCall` | `"StartingVideoCall"` | Building SDP offer for video call |
| `Trying` | `"Trying"` | INVITE sent, awaiting provisional response |
| `Ringing` | `"Ringing"` | 180 Ringing received |
| `Connecting` | `"Connecting"` | 183 Session Progress / SDP negotiation underway |
| `SessionInProgress` | `"SessionInProgress"` | 182 or multi-party session in progress |
| `Redirect` | `"Redirect"` | 181 / 3xx redirect received |

### Inbound pre-answer

| Value | String | Meaning |
|---|---|---|
| `Incoming` | `"Incoming"` | Inbound INVITE received, ringing locally |
| `Answering` | `"Answering"` | Answer in progress (media / SDP being negotiated) |

### Active call

| Value | String | Meaning |
|---|---|---|
| `CallInProgress` | `"CallInProgress"` | Call answered and actively connected |
| `InProgress` | `"InProgress"` | Transient — set during Unhold / Unmute before returning to `CallInProgress` |
| `OnHold` | `"OnHold"` | Call on hold |
| `OnMute` | `"OnMute"` | Microphone muted; call still connected |
| `Conference` | `"Conference"` | Conference leg active |
| `RecordingStarted` | `"RecordingStarted"` | Recording underway |
| `RecordingStopped` | `"RecordingStopped"` | Recording stopped |

### Terminal

| Value | String | Meaning |
|---|---|---|
| `Ended` | `"Ended"` | Call ended normally |
| `Cancelled` | `"Cancelled"` | Outbound call cancelled before answer |
| `Missed` | `"Missed"` | Inbound call not answered |
| `Failed` | `"Failed"` | Infrastructure / server error |
| `Rejected` | `"Rejected"` | Call rejected (4xx / 6xx) |
| `AnsweredElsewhere` | `"AnsweredElsewhere"` | Answered on another device |
| `Disconnected` | `"Disconnected"` | Provider or session disconnected |
| `Redirect` | `"Redirect"` | SIP redirect (terminal in some flows) |

---

## 📋 Disposition Codes

Source: `src/SipProviderTypes.ts` — `Dispositions` enum. The `Disposition` field in a CDR is a machine-readable enum key. `ReasonText` carries the human-readable equivalent.

### Quick Reference

| Disposition Key | Category | Actively assigned | Notes |
|---|---|---|---|
| `NormalCallClearing` | Normal | ✓ (CDR fallback) | Q.850 cause 16 |
| `BusyHere` | No answer / rejection | defined only | Q.850 17, SIP 486 |
| `CallRejected` | No answer / rejection | defined only | Q.850 21, SIP 603 |
| `NoAnswer` | No answer / rejection | defined only | Ringback timeout |
| `Cancelled` | No answer / rejection | ✓ | Outbound cancelled by us |
| `Missed` | No answer / rejection | ✓ | Inbound missed |
| `BlindTransfer` | Transfer — blind | ✓ | Main/parent session CDR |
| `BlindTransferTo` | Transfer — blind | ✓ | Synthetic destination-leg CDR |
| `AttendedTransfer` | Transfer — attended | ✓ | Parent/main session CDR |
| `AttendedTransferTo` | Transfer — attended | ✓ | Child/consultation session CDR |
| `AttendedTransferFailed` | Transfer — attended | ✓ | Parent CDR on failed transfer |
| `AttendedTransferToFailed` | Transfer — attended | ✓ | Child CDR on failed transfer |
| `ConferenceCall` | Conference | defined only | Reserved for future use |
| `ConferenceCallRejected` | Conference | ✓ | Participant rejected invite |
| `AnsweredElsewhere` | Device / policy | ✓ | SIP forking — answered on another device |
| `DeclinedDoNotDisturb` | Device / policy | defined only | DND active |
| `DeclinedCallWaiting` | Device / policy | defined only | Call waiting disabled |
| `CallFailed` | Failure | ✓ | SIP 5xx server/infrastructure error |
| `CallFailedToAnswer` | Failure | ✓ | Answered but no 200 OK within timeout |

### Actively assigned disposition details

<details>
<summary><strong>NormalCallClearing</strong></summary>

Call ended normally — both parties connected, one side hung up.

| Field | Value |
|---|---|
| `Disposition` | `"NormalCallClearing"` |
| `ReasonCode` | `16` |
| `ReasonText` | e.g. `"Normal Call Clearing"` |
| `TerminatedBy` | `"us"` or `"them"` |
| `TransferFromDisplayName` | not present |
| `TransferToDisplayName` | not present |

Set by CDR fallback in `BuildAndAddCDRMessage` when `ReasonCode == 16` and no other `Disposition` has already been set.

</details>

<details>
<summary><strong>Cancelled</strong></summary>

Outbound call cancelled by us before it was answered (SIP 487).

| Field | Value |
|---|---|
| `Disposition` | `"Cancelled"` |
| `TerminatedBy` | `"us"` |

</details>

<details>
<summary><strong>Missed</strong></summary>

Inbound call — remote party hung up before we answered (missed call).

| Field | Value |
|---|---|
| `Disposition` | `"Missed"` |
| `TerminatedBy` | `"them"` |

</details>

<details>
<summary><strong>BlindTransfer (main session CDR)</strong></summary>

We initiated a blind transfer — the original party was transferred to a new destination without a consultation call.

| Field | Value |
|---|---|
| `Disposition` | `"BlindTransfer"` |
| `ReasonCode` | `202` |
| `ReasonText` | `"You Blind Transferred [transferee] to [target]"` |
| `TerminatedBy` | `"us"` |
| `TransferFromDisplayName` | Display name of the **transferee** (party we were talking to, transferred away) |
| `TransferToDisplayName` | Display name of the **target** (destination they were transferred to) |

</details>

<details>
<summary><strong>BlindTransferTo (synthetic destination-leg CDR)</strong></summary>

Synthetic CDR representing the new outbound leg. Not a live SIP session — fabricated to provide a complete call history entry for the transfer destination.

| Field | Value |
|---|---|
| `Disposition` | `"BlindTransferTo"` |
| `ReasonCode` | `202` |
| `Direction` | `"outbound"` |
| `BlindTransferDestination` | `true` |
| `TransferFromDisplayName` | Display name of the **transferee** (original caller) |
| `TransferToDisplayName` | Display name of the **target** (transfer destination) |
| `CDRs` | `[parentSessionId]` — links to the original main session CDR |

</details>

<details>
<summary><strong>AttendedTransfer (parent/main session CDR)</strong></summary>

We completed an attended transfer — the original call party was transferred to the consultation call party.

| Field | Value |
|---|---|
| `Disposition` | `"AttendedTransfer"` |
| `ReasonCode` | `202` |
| `ReasonText` | `"Attended Transfer to [attendee]"` |
| `TerminatedBy` | `"us"` |
| `TransferFromDisplayName` | Display name of the **original party** (caller being handed off) |
| `TransferToDisplayName` | Display name of the **attendee** (consultation call party who receives the caller) |
| `AttendedTransferee` | `{ SessionId, DisplayName }` — original caller |
| `AttendedTransferTarget` | `{ SessionId, DisplayName }` — consultation target |

</details>

<details>
<summary><strong>AttendedTransferTo (child/consultation session CDR)</strong></summary>

The consultation/child leg of a completed attended transfer.

| Field | Value |
|---|---|
| `Disposition` | `"AttendedTransferTo"` |
| `ReasonCode` | `202` |
| `ReasonText` | `"Attended Transfer to [original party]"` |
| `TerminatedBy` | `"us"` |
| `TransferFromDisplayName` | Same as the parent CDR's `TransferFromDisplayName` |
| `TransferToDisplayName` | Same as the parent CDR's `TransferToDisplayName` |

Both CDRs in an attended transfer pair have **identical** `TransferFromDisplayName` / `TransferToDisplayName` values for easy correlation.

</details>

<details>
<summary><strong>AttendedTransferFailed / AttendedTransferToFailed</strong></summary>

Set when the attended transfer was attempted but rejected.

- `AttendedTransferFailed` — on the parent/main session CDR
- `AttendedTransferToFailed` — on the consultation/child session CDR

</details>

<details>
<summary><strong>ConferenceCallRejected</strong></summary>

A conference participant rejected the invitation.

| Field | Value |
|---|---|
| `Disposition` | `"ConferenceCallRejected"` |
| `ReasonCode` | `202` |
| `ReasonText` | `"Conference Call Rejected"` |
| `TerminatedBy` | `"them"` |

Set only when `session.EarlyConferenceCallRejected === true`.

</details>

<details>
<summary><strong>AnsweredElsewhere</strong></summary>

The incoming call was answered on another device or endpoint before it was answered here (SIP forking).

| Field | Value |
|---|---|
| `Disposition` | `"AnsweredElsewhere"` |

Set in `MobileSipCore.ts` in the `CallAnsweredElsewhere` handler. Other CDR fields (`ReasonCode`, `ReasonText`, `TerminatedBy`) are not explicitly set at this assignment site — they come from the existing session data.

</details>

<details>
<summary><strong>CallFailed / CallFailedToAnswer</strong></summary>

- `CallFailed` — call failed due to a server or infrastructure error (SIP 5xx).
- `CallFailedToAnswer` — call was answered (user pressed accept) but never reached `Established` state — no SIP 200 OK received within the answer timeout.

</details>

### CDR scenario matrix

| Scenario | `Direction` | `Disposition` | `TerminatedBy` |
|---|---|---|---|
| Normal outbound, hung up by us | `outbound` | `NormalCallClearing` | `"us"` |
| Normal outbound, hung up by them | `outbound` | `NormalCallClearing` | `"them"` |
| Normal inbound, hung up by us | `inbound` | `NormalCallClearing` | `"us"` |
| Normal inbound, hung up by them | `inbound` | `NormalCallClearing` | `"them"` |
| Outbound cancelled before answer | `outbound` | `Cancelled` | `"us"` |
| Inbound missed (remote hung up) | `inbound` | `Missed` | `"them"` |
| Outbound rejected by remote (4xx) | `outbound` | `CallRejected` / `BusyHere` | `"them"` |
| Blind transfer — main session | either | `BlindTransfer` | varies |
| Blind transfer — destination leg (synthetic) | `outbound` | `BlindTransferTo` | — |
| Attended transfer completed — main session | either | `AttendedTransfer` | varies |
| Attended transfer completed — consultation leg | `outbound` | `AttendedTransferTo` | varies |
| Attended transfer failed — main session | either | `AttendedTransferFailed` | varies |
| Attended transfer failed — consultation leg | `outbound` | `AttendedTransferToFailed` | varies |
| Conference participant rejected | `outbound` | `ConferenceCallRejected` | `"them"` |
| Call answered elsewhere (SIP fork) | `inbound` | `AnsweredElsewhere` | — |
| SIP 5xx failure | either | `CallFailed` | `"them"` |
| Answer timeout (no 200 OK) | `inbound` | `CallFailedToAnswer` | — |

---

## 📡 Events Catalogue

### `window.phone.EventTypes` — Core event bus constants

All values are plain strings matching their key name. Raised via `window.phone.RaiseEvent(message)` and received as DOM `CustomEvent` on `window`.

| Constant | Value | Description |
|---|---|---|
| `OnMessage` | `"OnMessage"` | A message has been received or sent |
| `OnMessageStreamItemAdded` | `"OnMessageStreamItemAdded"` | A new item added to the message stream |
| `OnMessageStreamItemUpdated` | `"OnMessageStreamItemUpdated"` | An existing message stream item was updated |
| `OnMessageStreamItemDeleted` | `"OnMessageStreamItemDeleted"` | A message stream item was deleted |
| `OnBuddySelected` | `"OnBuddySelected"` | A buddy was selected in the UI |
| `OnBuddyAdded` | `"OnBuddyAdded"` | A new buddy was added |
| `OnBuddyUpdated` | `"OnBuddyUpdated"` | A buddy's data was updated |
| `OnBuddyDeleted` | `"OnBuddyDeleted"` | A buddy was deleted |
| `OnSessionStarted` | `"OnSessionStarted"` | A call session has started |
| `OnSessionEnded` | `"OnSessionEnded"` | A call session has ended |
| `OnSessionTimerUpdated` | `"OnSessionTimerUpdated"` | The session call timer was updated |
| `OnRecordingStarted` | `"OnRecordingStarted"` | Recording started on a session |
| `OnRecordingEnded` | `"OnRecordingEnded"` | Recording ended on a session |
| `OnSessionStateChange` | `"OnSessionStateChange"` | A session changed SIP.js state |

> `OnIncomingCall` is handled specially within `RaiseEvent` (dedup guard + direct property call) but is **not** listed in `window.phone.EventTypes`. It is used as a raw string internally.

### Listening to events

```js
// Using EventTypes constant (recommended)
window.addEventListener(window.phone.EventTypes.OnSessionStarted, (event) => {
    console.log("Session started:", event.detail);
});

// Using a webhook callback
window.phone.Webhooks.OnSessionEnded = (message) => {
    console.log("Session ended:", message.Data);
};

// OnIncomingCall — direct property assignment
window.phone.OnIncomingCall = (callDetails) => {
    console.log("Incoming call from:", callDetails.CallerId);
};
```

### `RaiseEvent` dispatch pipeline

When `window.phone.RaiseEvent(message)` is called:

1. Resolves `eventName` from `message.Event ?? message.Activity`. Returns early if neither is set.
2. Stamps `message.Timestamp` via `window.phone.TimeNow()` if absent.
3. **`OnIncomingCall` dedup guard:** suppresses duplicate events for the same `SessionId` within 2 000 ms (state stored in `window.phone._lastOnIncomingCall`).
4. Calls `window.phone.Webhooks[eventName](message)` if registered.
5. For `OnIncomingCall` only: calls `window.phone.OnIncomingCall(message.Data ?? message)` if it is a function.
6. Dispatches `new CustomEvent(eventName, { detail: message.Data ?? message })` on `window`.
7. Dispatches the same `CustomEvent` on `window.parent` / `window.top` (cross-origin errors silently ignored).
8. Posts a deep-cloned copy via `window.postMessage(...)` to `window.location.origin`.
9. Posts the same clone to `window.parent` via `postMessage("*")` if inside an iframe.

> The `detail` of the dispatched `CustomEvent` is `message.Data ?? message`. If `Data` is present, listeners receive the payload unwrapped; if absent, they receive the full event object.

### `SipProviderPostMessage` — Provider to UI events

<details>
<summary><strong>Incoming Call</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnIncomingCall` | `"OnIncomingCall"` | Incoming call notification |
| `IncomingCallBuddyId` | `"IncomingCallBuddyId"` | Buddy ID resolved for an incoming call |
| `AutoAnswer` | `"AutoAnswer"` | Auto-answer triggered |

</details>

<details>
<summary><strong>Call Lifecycle</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnCallAnswered` | `"OnCallAnswered"` | Call was answered |
| `OnCallConnected` | `"OnCallConnected"` | Call connected (media active) |
| `OnAccept` | `"OnAccept"` | Call accepted (SIP 200 OK received / sent) |
| `OnTrying` | `"OnTrying"` | Outbound INVITE sent |
| `OnProgress` | `"OnProgress"` | Provisional response received |
| `OnHold` | `"OnHold"` | Call placed on hold |
| `OnUnhold` | `"OnUnhold"` | Call taken off hold |
| `OnMute` | `"OnMute"` | Call muted |
| `OnUnmute` | `"OnUnmute"` | Call unmuted |
| `OnDecline` | `"OnDecline"` | Call declined by us |
| `OnSessionStateChange` | `"OnSessionStateChange"` | Session state changed |
| `OnRingbackTimeout` | `"OnRingbackTimeout"` | Ringback timeout — no answer from remote |

</details>

<details>
<summary><strong>Call Endings</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnInviteCancelledByUs` | `"OnInviteCancelledByUs"` | We cancelled the outbound invite |
| `OnInviteCancelledByThem` | `"OnInviteCancelledByThem"` | Remote party cancelled the invite |
| `OnInviteCancelled` | `"OnInviteCancelled"` | Invite cancelled (generic) |
| `OnInviteRejectedByUs` | `"OnInviteRejectedByUs"` | We rejected an incoming invite |
| `OnInviteRejectedByThem` | `"OnInviteRejectedByThem"` | Remote party rejected our invite |
| `OnInviteReject` | `"OnInviteReject"` | Invite rejected (generic) |
| `OnCallRejectedByUs` | `"OnCallRejectedByUs"` | Call rejected by us |
| `OnCallFailed` | `"OnCallFailed"` | Call failed due to server / infrastructure error (SIP 5xx) |
| `OnCancel` | `"OnCancel"` | Call cancelled |
| `OnByeSent` | `"OnByeSent"` | BYE sent |
| `OnBye` | `"OnBye"` | BYE received |

</details>

<details>
<summary><strong>Transfer</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnBlindTransferStarted` | `"OnBlindTransferStarted"` | Blind transfer initiated |
| `OnCompleteTransfer` | `"OnCompleteTransfer"` | Transfer completed |

</details>

<details>
<summary><strong>Conference</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnConferenceStarted` | `"OnConferenceStarted"` | Conference call started |
| `OnConferenceJoined` | `"OnConferenceJoined"` | Joined the conference |
| `OnConferenceEnded` | `"OnConferenceEnded"` | Conference ended |
| `OnConferenceCallRejected` | `"OnConferenceCallRejected"` | Conference participant rejected invite |
| `OnConferenceCallLeft` | `"OnConferenceCallLeft"` | Participant left / conference ended |
| `ConferenceCallJoined` | `"ConferenceCallJoined"` | Legacy / alternate conference join key |
| `ConferenceCallLeft` | `"ConferenceCallLeft"` | Legacy / alternate conference left key |

</details>

<details>
<summary><strong>Recording</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnRecordingStarted` | `"OnRecordingStarted"` | Recording started |
| `OnRecordingStopped` | `"OnRecordingStopped"` | Recording stopped |
| `OnRecordingCompleted` | `"OnRecordingCompleted"` | Recording completed and saved |

</details>

<details>
<summary><strong>Registration and Transport</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnRegistrationSuccessful` | `"OnRegistrationSuccessful"` | SIP registration succeeded |
| `OnRegistrationSent` | `"OnRegistrationSent"` | REGISTER request sent |
| `OnRegistererStateChange` | `"OnRegistererStateChange"` | Registerer state changed |
| `OnUnregistered` | `"OnUnregistered"` | Provider unregistered |
| `OnRegistererError` | `"OnRegistererError"` | Registerer encountered an error |
| `OnTransportConnectError` | `"OnTransportConnectError"` | Transport connection error |

</details>

<details>
<summary><strong>Call Waiting / DND</strong></summary>

| Key | String | Description |
|---|---|---|
| `CallDeclinedByDoNotDisturb` | `"CallDeclinedByDoNotDisturb"` | Call declined — Do Not Disturb active |
| `OnCallWaitingDisabled` | `"OnCallWaitingDisabled"` | Call waiting disabled |

</details>

<details>
<summary><strong>Session / SDP / DTMF</strong></summary>

| Key | String | Description |
|---|---|---|
| `OnSessionDescriptionHandlerCreated` | `"OnSessionDescriptionHandlerCreated"` | SDP handler created |
| `OnIceCandidate` | `"OnIceCandidate"` | ICE candidate received |
| `OnIceConnectionStateChange` | `"OnIceConnectionStateChange"` | ICE connection state changed |
| `OnSendDtmf` | `"OnSendDtmf"` | DTMF tone was sent |
| `OnReceiveDtmf` | `"OnReceiveDtmf"` | DTMF tone was received |

</details>

### Session event activity payloads

<details>
<summary><strong>AddSessionEvent — Call lifecycle activities (WebSipCore.ts)</strong></summary>

| Activity | Fields |
|---|---|
| `OnTrying` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnProgress` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction`, `ProgressCode` (180/181/182/183) |
| `OnAccept` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |

</details>

<details>
<summary><strong>AddSessionEvent — Call lifecycle activities (Browser-Phone-SipProvider.ts)</strong></summary>

| Activity | Fields |
|---|---|
| `OnInviteReceived` | `SessionId`, `Time`, `BuddyId`, `DisplayName`, `Direction` (`'inbound'`), `From` (CallerID), `To` (DID), `WithVideo` |
| `OnCallAnswered` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction`, `AnswerTime` |
| `OnCancelled` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnDeviceChange` | `SessionId`, `Device`, `DeviceId`, `DisplayName` |
| `OnInviteRejectedByUs` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction`, `ReasonCode`, `ReasonText`, `TerminatedBy` |
| `OnInviteRejectedByThem` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction`, `ReasonCode`, `ReasonText`, `TerminatedBy` |
| `OnInviteCancelledByUs` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction`, `ReasonCode`, `ReasonText`, `TerminatedBy` |
| `OnInviteCancelledByThem` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction`, `ReasonCode`, `ReasonText`, `TerminatedBy` |
| `CallDeclinedByDoNotDisturb` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` (`'inbound'`), `From` |
| `AutoAnswer` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` (`'inbound'`), `From` |
| `OnCallWaitingDisabled` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` (`'inbound'`), `From` |

</details>

<details>
<summary><strong>AddCallActivity — Hold / Mute / Transfer activities</strong></summary>

| Activity | Fields |
|---|---|
| `OnHold` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnUnhold` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnMute` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnUnmute` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnBlindTransferStarted` | `SessionId`, `TargetContact`, `TargetSession`, `BlindTransferTransferee` (`SessionId`, `DisplayName`, `BuddyId`, `Direction`), `BlindTransferTarget` (`Number`, `DisplayName`) |
| `OnBlindTransferCompleted` | `SessionId`, `TargetContact`, `TargetSession`, `Sip`, `BlindTransferTransferee`, `BlindTransferTarget` |
| `OnAttendedTransferStarted` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `AttendeeSessionId`, `AttendeeDisplayName`, `AttendeeContact` |
| `OnCancelAttendedTransfer` | `SessionId`, `Time`, `DisplayName`, `AttendeeSessionId`, `AttendeeDisplayName`, `RejectedByUs` (bool) |
| `OnAttendedTransferCompleted` | `SessionId`, `TargetContact`, `TargetSession`, `AttendedTransferee` (`SessionId`, `DisplayName`), `AttendedTransferTarget` (`SessionId`, `DisplayName`) |

</details>

<details>
<summary><strong>PostMessage — Direct provider to UI notifications</strong></summary>

| Event | Fields |
|---|---|
| `OnInviteSent` | `SessionId`, `Direction`, `Caller`, `Time`, `DisplayName`, `BuddyId` |
| `OnHold` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `Unhold` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `Mute` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `UnMute` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnCallConnected` | `SessionId`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnCallReceivedBye` | `SessionId`, `Sip`, `StatusCode`, `ReasonPhrase`, `Time`, `DisplayName`, `BuddyId`, `Direction` |
| `OnBlindTransferCompleted` | `SessionId`, `Timestamp`, `Response`, `BlindTransferTransferee` (`SessionId`, `DisplayName`, `BuddyId`, `Direction`), `BlindTransferTarget` (`Number`, `DisplayName`) |

</details>

---

## 📄 CDR Structure

Source: `src/CdrMessage.ts` — `CdrMessageData` interface. A CDR is emitted at the end of every call session via the `OnCallDetailRecord` event.

### Core fields

| Field | Type | Description |
|---|---|---|
| `SessionId` | `string` | Session identifier |
| `BuddyId` | `string` | Buddy / contact identifier |
| `Direction` | `"inbound" \| "outbound"` | Call direction |
| `StartTime` | `string` | ISO timestamp — session created |
| `EndTime` | `string` | ISO timestamp — session ended |
| `AnswerTime` | `string` | ISO timestamp — call answered; `undefined` if never answered |
| `TalkTime` | `number` | Seconds the call was connected (answered to end) |
| `Duration` | `number` | Total session duration in seconds |
| `FromName` | `string` | Display name of the calling party |
| `FromNumber` | `string` | SIP URI / number of the calling party |
| `ToName` | `string` | Display name of the called party |
| `ToNumber` | `string` | SIP URI / number of the called party |
| `CallId` | `string` | SIP `Call-ID` header value |
| `UserAgent` | `string` | SIP `User-Agent` of the remote party |
| `ProfileUserId` | `string` | Profile / user identifier of the local user |
| `Network` | `string` | Network type at call time |
| `WithVideo` | `boolean` | `true` if the session included video |
| `Disposition` | `string` | `Dispositions` enum key — why the call ended |
| `ReasonCode` | `number` | SIP / Q.850 reason code |
| `ReasonText` | `string` | SIP reason text |
| `TerminatedBy` | `string` | `"us"` or `"them"` |
| `Events` | `any[]` | Array of call activity log entries |
| `DeviceId` | `string` | Device identifier (optional) |
| `CDRs` | `{ CDRId: string }[]` | Related CDR IDs (optional; e.g. transfer child CDRs) |
| `ExtraCallDetailRecordValues` | `Record<string, any>` | Custom extra values from `SipProviderSettings.ExtraCallDetailRecordsValues` |
| `ProviderData` | `ProviderData` | SIP provider details (see below) |
| `PeerConnection` | `PeerConnectionData` | WebRTC peer connection stats (see below) |

### Transfer-specific fields

| Field | Type | Description |
|---|---|---|
| `TransferFromDisplayName` | `string` | Transfer calls only — display name of the party being transferred away |
| `TransferToDisplayName` | `string` | Transfer calls only — display name of the transfer destination |
| `BlindTransferDestination` | `boolean` | `true` when this CDR is the destination leg of a blind transfer |
| `AttendedTransferee` | `{ SessionId?, DisplayName? }` | Original caller info on attended transfer CDRs |
| `AttendedTransferTarget` | `{ SessionId?, DisplayName? }` | Consultation call target info on attended transfer CDRs |

### `ProviderData` fields

| Field | Type | Description |
|---|---|---|
| `Type` | `"sip"` | Always `"sip"` |
| `Description` | `string` | Provider description |
| `Invite` | `string` | SIP INVITE content |
| `TargetUri` | `string` | Target SIP URI |
| `User` | `string` | SIP user (optional) |
| `ReasonCode` | `number` | SIP reason code |
| `ReasonText` | `string` | SIP reason text |

### `PeerConnectionData` fields

| Field | Type | Description |
|---|---|---|
| `InboundRtpStreamStats` | `RtpStreamStats[]` | Inbound RTP statistics |
| `OutboundRtpStreamStats` | `RtpStreamStats[]` | Outbound RTP statistics |
| `RemoteInboundRtpStreamStats` | `RtpStreamStats[]` | Remote inbound RTP statistics |
| `SdpData` | `string` | Local SDP description |
| `IceCandidate` | `IceCandidate[]` | ICE candidates used |
| `TurnServer` | `string` | TURN server used |
| `StunServer` | `string` | STUN server used |

### CDR reception

```js
window.addEventListener("OnCallDetailRecord", (event) => {
    const cdr = event.detail; // CdrMessageData
    console.log(`Call ${cdr.Disposition} — ${cdr.Duration}s — terminated by ${cdr.TerminatedBy}`);
});
```

---

## 🖥️ UI Interaction Points

Source: `Browser-Phone-UI.js` — DOM templates and action bindings; `phone-ui-api.md`.

The UI layer reads and writes `session` object fields and binds DOM nodes. Tests that drive the UI must use these exact selectors.

### Session object fields used by the UI

<details>
<summary><strong>Core identity / state (read-only in most flows)</strong></summary>

`Id`, `Provider`, `Direction`, `State`, `Status`, `Timer`, `DisplayName`, `DisplayNumber`, `WithVideo`

</details>

<details>
<summary><strong>UI view / tile state</strong></summary>

| Field | Values | Description |
|---|---|---|
| `View` | `"extended"` or minimized | UI toggles on maximize/minimize |
| `ExtendedTile` | `call \| stats \| events \| custom \| ai` | UI reads for tile selection |

</details>

<details>
<summary><strong>Mute / hold / record toggles</strong></summary>

| Field | Type | Description |
|---|---|---|
| `isOnMute` | `boolean` | Read to set button visibility after handler |
| `isOnHold` | `boolean` | Read to set button visibility after handler |
| `isRecording` | `boolean` | Read to set button visibility after handler |

</details>

<details>
<summary><strong>Conference / attended transfer relationships</strong></summary>

| Field | Description |
|---|---|
| `ConferenceCall` | Child session id |
| `ConferenceCallJoined` | `boolean` |
| `ParentSession` | Child to parent session id |
| `AttendedTransferCall` | Child session id |
| `AttendedTransferCallSource` | `boolean` |

</details>

<details>
<summary><strong>Media device selection</strong></summary>

`AudioInputDevice`, `AudioOutputDevice`, `VideoInputDevice`

</details>

### DOM selectors — call controls

#### Minimized and maximized call tiles

| Action | Handler | Session fields read | DOM selectors |
|---|---|---|---|
| Mute | `phone.OnMute(session, buddy)` | `isOnMute` | `.mute-button`, `.unmute-button` |
| Unmute | `phone.OnUnmute(session, buddy)` | `isOnMute` | `.mute-button`, `.unmute-button` |
| Hold | `phone.OnHold(session, buddy)` | `isOnHold`, `isOnMute` | `.hold-button`, `.unhold-button`, `.mute-button`, `.unmute-button` |
| Unhold | `phone.OnUnhold(session, buddy)` | `isOnHold`, `isOnMute` | `.hold-button`, `.unhold-button`, `.mute-button`, `.unmute-button` |
| Answer | `phone.OnAnswer` | — | `.answer-call-button` |
| Decline | `phone.OnDecline` | — | `.decline-button` |
| Cancel | `phone.OnCancel` | — | `.cancel-button` |
| Hangup | `phone.OnHangup` | — | `.hangup-button` |
| DTMF | `phone.OpenDtmfWindow(session)` | — | `.dtmf-outbound-button` |
| Start recording | `phone.OnStartRecording` | `isRecording` | `.record-start-button` |
| Stop recording | `phone.OnStopRecording` | `isRecording` | `.record-stop-button` |
| Conference | `phone.OpenConferenceWindow` | `ConferenceCall`, `ParentSession` | `.conference-button`, `.additional-buttons` |
| Transfer | `phone.OpenTransferWindow` | `AttendedTransferCall`, `ParentSession` | `.transfer-button`, `.additional-buttons` |
| Change media | `phone.OpenDeviceSelector` | `WithVideo` | `.change-media-button` |
| Present | `phone.OpenPresentationWindow` | `WithVideo` | `.present-button` |

#### Status / metrics refresh (data-attribute selectors)

| Session field | DOM selector |
|---|---|
| `Status` | `[data-call-status-identity='${session.Id}']` |
| `Timer` | `[data-call-timer-identity='${session.Id}']` |
| `RtpSenderLevel` | `[data-sender-levels-identity='${session.Id}']` |
| `RtpReceiverLevel` | `[data-receiver-levels-identity='${session.Id}']` |
| `WithVideo` | `.call-video-icon`, `.call-audio-icon` |

### DOM selectors — child call controls (conference / attended transfer)

| Action | Handler | Session fields read | DOM selectors |
|---|---|---|---|
| Child mute | `phone.OnMute` | `isOnMute` | `.child-mute-button`, `.child-unmute-button` |
| Child hold | `phone.OnHold` | `isOnHold` | `.child-hold-button`, `.child-unhold-button` |
| Join conference | `phone.OnJoinConference(childSession)` | `ConferenceCallJoined` | `.conference-join-button` |
| Cancel conference | `phone.OnCancelConference(childSession)` | — | `.child-cancel-button` |
| Complete transfer | `phone.OnCompleteTransfer(childSession)` | — | `.complete-transfer-button` |
| Cancel transfer | `phone.OnCancelAttendedTransfer(childSession)` | — | `.child-cancel-button` |
| Child hangup | `phone.OnHangupConference` / `phone.OnHangupAttendedTransfer` | — | `.child-hangup-button` |
| Child DTMF | `phone.OpenDtmfWindow` | — | `.child-dtmf-outbound-button` |

Child status selectors:

| Data | DOM selector |
|---|---|
| Child status | `.child-call-status` + `[data-call-status-identity='${childSession.Id}']` |
| Child timer | `.child-call-timer` + `[data-call-timer-identity='${childSession.Id}']` |
| Child buttons (in-call) | `.child-in-call-buttons` |
| Child buttons (ringing) | `.child-inbound-ringing-buttons` |
| Child buttons (outbound) | `.child-outbound-call-buttons` |

### DOM selectors — device selector window

Opened by `phone.OpenDeviceSelector`. Session fields read: `AudioInputDevice`, `AudioOutputDevice`, `VideoInputDevice`, `WithVideo`.

| Selector | Purpose |
|---|---|
| `.microphone-text` | Microphone label |
| `.speaker-text` | Speaker label |
| `.camera-text` | Camera label |
| `.microphone-select` | Microphone `<select>` |
| `.speaker-select` | Speaker `<select>` |
| `.webcam-select` | Camera `<select>` |
| `.video-devices` | Camera section container (shown when `WithVideo === true`) |

### DOM selectors — DTMF window

Opened by `phone.OpenDtmfWindow(session)`.

| Selector | Purpose |
|---|---|
| `.dial-button` (with `data-key-press`) | Each DTMF digit button |

### DOM selectors — transfer window

Opened by `phone.OpenTransferWindow`. Session fields read: `Provider` (for filtering contacts), `ConferenceCall`, `AttendedTransferCall`, `ParentSession`.

| Selector | Purpose |
|---|---|
| `.search-transfer-desc`, `.buddy-search` | Search input |
| `.search-result-area`, `.search-result-list` | Search results |
| `.blind-transfer` | Blind transfer action button |
| `.attended-transfer` | Attended transfer action button |

### DOM selectors — conference window

Opened by `phone.OpenConferenceWindow`. Session fields read: `Provider`, `ConferenceCall`.

| Selector | Purpose |
|---|---|
| `.search-conference-desc`, `.buddy-search` | Search input |
| `.search-result-area`, `.search-result-list` | Search results |
| `.start-conference` | Start conference action button |

### DOM selectors — presentation window

Opened by `phone.OpenPresentationWindow`. Session fields written by UI: `PresentImage`, `PresentPictureMediaStream`, `PresentVideoMediaStream`, `PresentAudioMediaStream`, `VideoResampleInterval`, `PresentCanvas`, `PresentCanvasMediaStream`.

| Selector | Presentation mode |
|---|---|
| `.present-blank` | Blank / mute screen |
| `.present-picture` | Share a static image |
| `.present-webcam` | Share webcam |
| `.present-screen` | Share screen |
| `.present-video` | Share a video file |
| `.present-whiteboard` | Whiteboard |

---

*Generated 2026-03-25 — all state names, event names, disposition codes, field names, and API methods are copied exactly from the source files listed above.*
