# 📖 Browser-Phone Developer Master Reference

> **Accuracy rule:** Every method name, field name, callback name, type, parameter, and code example in this document is copied exactly from the source files. Nothing is invented or paraphrased.

---

## 📑 Table of Contents

- [🏗️ Architecture Overview](#️-architecture-overview)
- [📦 Browser-Phone-Core](#-browser-phone-core)
- [📡 Browser-Phone-SipProvider](#-browser-phone-sipprovider)
- [🎙️ Browser-Phone-MediaManager](#️-browser-phone-mediamanager)
- [🖥️ Browser-Phone-UI](#️-browser-phone-ui)
- [🗂️ Data Structures](#️-data-structures)

---

## 🏗️ Architecture Overview

```
Host Application
       │
       ▼
window.phone  (public API surface — Browser-Phone-Core)
       │
       ├── BrowserPhoneCore  (bootstraps all subsystems via HookUpEvents())
       │         │
       │         ├── SessionCallbacks
       │         ├── BuddyCallbacks
       │         ├── CoreCallbacks
       │         ├── MessageStreamCallbacks
       │         ├── MessagingCallbacks
       │         ├── ProviderCallbacks
       │         ├── CallkitCallbacks
       │         ├── PresentationCallbacks
       │         └── NetworkHandler
       │
       ├── SipProvider  (Browser-Phone-SipProvider)
       │         │
       │         ├── WebSipCore    (browser / SIP.js 0.21.2)
       │         └── MobileSipCore (React Native)
       │
       ├── MediaManager  (Browser-Phone-MediaManager)
       │         │
       │         ├── MediaManagerCore.Web
       │         └── MediaManagerCore.Mobile
       │
       └── UI  (Browser-Phone-UI — optional host-app UI layer)
```

**Layer responsibilities:**

| Layer | Responsibility |
|---|---|
| Host App | Owns the page; calls `Init()`, configures `window.phone.Settings`, handles events |
| `window.phone` | Public API — call control, buddy management, messaging, events, storage |
| `BrowserPhoneCore` | Wires all subsystems; session/buddy lifecycle; event dispatch |
| SipProvider | SIP signalling (SIP.js), WebRTC peer connection, DTMF, registration |
| MediaManager | Device enumeration, audio/video capture, ringtones, recording |
| UI | DOM rendering, buddy list, call stage, conference windows |

**Initialisation order:**
1. Set `window.phone.Settings` including `LoadFromStorage` and `PROFILE_USER_ID`
2. Call `await window.phone.InitBrowserPhone(new BrowserPhoneCore())`
3. Call `await window.phone.InitMediaManager(phone.MediaManagerCore.Web)`
4. Call `await window.phone.Init(sipConfiguration)` (registers SIP provider)

---

## 📦 Browser-Phone-Core

Source: `src/Browser-Phone-Core.ts`, `src/Browser-Phone-Core-Types.ts`, all callback modules.

<details>
<summary><strong>📘 BrowserPhoneCore — Initialisation</strong></summary>

### `InitBrowserPhone(core)`

```typescript
/**
 * Bootstraps the BrowserPhoneCore instance.
 * @param {BrowserPhoneCore} core - Instance of BrowserPhoneCore.
 * @returns {Promise<void>}
 * @example
 * await window.phone.InitBrowserPhone(new BrowserPhoneCore());
 */
```

Internally calls:
1. `core.LoadDefaultSettings()` — sets default values for any missing `window.phone.Settings` keys
2. `core.HookUpEvents()` — registers all callback modules:
   - `InitSessionCallbacks()`
   - `InitBuddyCallbacks()`
   - `InitCoreCallbacks()`
   - `InitMessageStreamCallbacks()`
   - `InitMessagingCallbacks()`
   - `InitNetworkHandler()`
   - `InitPhoneEvents()`
3. `core.LoadProviders()` — clears `Settings.Providers = []` before re-populating

**Throws** if `window.phone.Settings.LoadFromStorage` is not a function, or `window.phone.Settings.PROFILE_USER_ID` is falsy.

### `window.phone.Log`

```typescript
window.phone.Log.debug(message: string, ...args: any[]): void
window.phone.Log.info(message: string, ...args: any[]): void
window.phone.Log.warn(message: string, ...args: any[]): void
window.phone.Log.error(message: string, ...args: any[]): void
```

</details>

---

### 🔔 Events System

<details>
<summary><strong>InitPhoneEvents / RaiseEvent</strong></summary>

**Source:** `src/Browser-Phone-Events.ts`

```typescript
/**
 * Dispatches a PhoneEvent to all registered listeners.
 * @param {PhoneEvent} message - The event object to raise.
 * @returns {void}
 * @example
 * window.phone.RaiseEvent({ Type: window.phone.EventTypes.OnBuddyAdded, Data: buddy });
 */
window.phone.RaiseEvent(message: PhoneEvent): void
```

**Dispatch order:**
1. Webhook callback (if `window.phone.webhook` is set)
2. `window.phone.OnIncomingCall` property (for inbound call events only; dedup guard: 2-second window per `SessionId`)
3. DOM `CustomEvent` dispatch on `window`
4. `window.postMessage` broadcast

### `window.phone.EventTypes`

| Constant | Value |
|---|---|
| `OnMessage` | `"OnMessage"` |
| `OnMessageStreamItemAdded` | `"OnMessageStreamItemAdded"` |
| `OnMessageStreamItemUpdated` | `"OnMessageStreamItemUpdated"` |
| `OnMessageStreamItemDeleted` | `"OnMessageStreamItemDeleted"` |
| `OnBuddySelected` | `"OnBuddySelected"` |
| `OnBuddyAdded` | `"OnBuddyAdded"` |
| `OnBuddyUpdated` | `"OnBuddyUpdated"` |
| `OnBuddyDeleted` | `"OnBuddyDeleted"` |
| `OnSessionStarted` | `"OnSessionStarted"` |
| `OnSessionEnded` | `"OnSessionEnded"` |
| `OnSessionTimerUpdated` | `"OnSessionTimerUpdated"` |
| `OnRecordingStarted` | `"OnRecordingStarted"` |
| `OnRecordingEnded` | `"OnRecordingEnded"` |
| `OnSessionStateChange` | `"OnSessionStateChange"` |

> Note: `OnIncomingCall` is handled separately (not in `EventTypes`), with a 2-second dedup guard per `SessionId`.

</details>

---

### 👥 Buddy Callbacks

<details>
<summary><strong>Buddy Lifecycle</strong></summary>

**Source:** `src/BuddyCallbacks.ts`

#### `OnBuddySelected(buddy)`

```typescript
/**
 * Called when a buddy is selected in the UI.
 * @param {BuddyObject} buddy - The buddy that was selected.
 * @returns {void}
 */
window.phone.OnBuddySelected(buddy: BuddyObject): void
```

Raises `EventTypes.OnBuddySelected`.

#### `OnBuddyAdded(buddy)`

```typescript
/**
 * Called when a new buddy is added to the list.
 * @param {BuddyObject} buddy - The newly added buddy.
 * @returns {void}
 */
window.phone.OnBuddyAdded(buddy: BuddyObject): void
```

Raises `EventTypes.OnBuddyAdded`.

#### `OnBuddyUpdated(buddy)`

```typescript
/**
 * Called when a buddy's properties are updated.
 * @param {BuddyObject} buddy - The updated buddy.
 * @returns {void}
 */
window.phone.OnBuddyUpdated(buddy: BuddyObject): void
```

Raises `EventTypes.OnBuddyUpdated`.

#### `OnBuddyDeleted(buddy)`

```typescript
/**
 * Two-phase deletion: first soft-deletes (AutoDelete = true), then on second call removes fully.
 * @param {BuddyObject} buddy - The buddy to delete.
 * @returns {void}
 */
window.phone.OnBuddyDeleted(buddy: BuddyObject): void
```

**Two-phase deletion pattern:**
1. First call: sets `buddy.AutoDelete = true`, saves the buddy, raises `OnBuddyUpdated`
2. Second call (after expiry): removes from `window.phone.MyBuddies`, persists the new list, raises `OnBuddyDeleted`

</details>

<details>
<summary><strong>Buddy Lookup</strong></summary>

```typescript
/**
 * Finds a buddy by their contact identifier.
 * @param {string} contact - The contact address or number.
 * @returns {BuddyObject | null}
 */
window.phone.GetBuddyByContact(contact: string): BuddyObject | null

/**
 * Finds a buddy by their unique ID.
 * @param {string} id - The buddy's unique ID.
 * @returns {BuddyObject | null}
 */
window.phone.GetBuddyById(id: string): BuddyObject | null

/**
 * Returns the first buddy that has an active session.
 * @returns {BuddyObject | null}
 */
window.phone.GetBuddyWithSession(): BuddyObject | null

/**
 * Returns the active session for a given buddy.
 * @param {BuddyObject} buddy
 * @returns {SessionObject | null}
 */
window.phone.GetBuddySession(buddy: BuddyObject): SessionObject | null
```

</details>

<details>
<summary><strong>Buddy Persistence</strong></summary>

```typescript
/**
 * Saves a buddy to storage. Strips MessageStreamItems, Sessions, and Selected before persisting.
 * @param {BuddyObject} buddy
 * @returns {void}
 */
window.phone.SaveBuddy(buddy: BuddyObject): void

/**
 * Loads all buddies from storage. Runs three maintenance passes:
 * handleAutoDeleteBuddies, handleDuplicateBuddies, sanitizeMalformedBuddies.
 * @returns {void}
 */
window.phone.LoadBuddies(): void
```

</details>

<details>
<summary><strong>CreateValidBuddy</strong></summary>

```typescript
/**
 * Creates and validates a new BuddyObject.
 * Returns null if DisplayName is invalid.
 * Sets defaults for all other fields.
 * @param {Partial<BuddyObject>} data
 * @returns {BuddyObject | null}
 */
window.phone.CreateValidBuddy(data: Partial<BuddyObject>): BuddyObject | null
```

Returns `null` if `DisplayName` is missing or invalid. All other fields receive defaults.

</details>

---

### 🔧 Buddy Maintenance

**Source:** `src/BuddyMaintenance.ts`

<details>
<summary><strong>Maintenance Functions</strong></summary>

| Export | Signature | Purpose |
|---|---|---|
| `isBuddyExpired` | `(buddy: BuddyObject) => boolean` | Returns `true` if buddy is older than `MaxBuddyAge` (default: 30 days) |
| `mergeBuddyMessages` | `(keepBuddy, dropBuddy) => Promise<void>` | Rewrites `BuddyId` on IndexDB records from `dropBuddy` to `keepBuddy` |
| `handleAutoDeleteBuddies` | `(buddies: BuddyObject[]) => BuddyObject[]` | Removes expired buddies with `AutoDelete = true` |
| `handleDuplicateBuddies` | `(buddies: BuddyObject[]) => BuddyObject[]` | Deduplicates by contact; keeps the one with the lexicographically later `LastActivity` |
| `sanitizeMalformedBuddies` | `(buddies: BuddyObject[]) => BuddyObject[]` | Removes buddies with missing or malformed required fields |

**Expiry override:** `window.phone.Settings.MaxBuddyAge` (number, in days).

</details>

---

### 📞 Core Callbacks

**Source:** `src/CoreCallbacks.ts` — `InitCoreCallbacks()` registers all functions on `window.phone`.

<details>
<summary><strong>SaveSettings()</strong></summary>

```typescript
/**
 * Saves the current window.phone.Settings to storage.
 * Strips the Providers array before persisting (it is runtime-only).
 * @returns {void}
 * @example
 * window.phone.SaveSettings();
 */
```

- Deep-copies `Settings`, clears `settings.Providers = []` in the copy only
- Calls `window.phone.SaveToStorage("Settings-" + window.phone.PROFILE_USER_ID, JSON.stringify(settings))`
- The in-memory `window.phone.Settings.Providers` is **not** mutated

</details>

<details>
<summary><strong>OnAudioCall(contact, buddy, existingSession?)</strong></summary>

```typescript
/**
 * Initiates an outbound audio call.
 * @param {ContactObject} contact - The contact to call (must include at least Number; Provider selects the VoIP provider).
 * @param {BuddyObject} buddy - The buddy associated with the call.
 * @param {SessionObject} [existingSession] - Optional pre-constructed session to resume or continue.
 * @returns {Promise<void | SessionObject>} Resolves with the session object on success, void on failure.
 * @example
 * await window.phone.OnAudioCall({ Number: '*65', Provider: 'sip' }, buddy);
 */
```

**Behaviour:**
1. Resolves audio input device by label from `window.phone.MyAudioinputDevices`, falling back to `"default"`
2. Resolves audio output device by label from `window.phone.MySpeakerDevices`, falling back to `"default"`
3. Constructs `SessionObject` with `State: "Establishing"`, `Direction: "outbound"`, `WithVideo: false`
4. If `existingSession` provided, normalises and uses it instead
5. Guards against duplicate session IDs — returns early if already in `buddy.Sessions`
6. Pushes session onto `buddy.Sessions`, sets `session.BuddyId`
7. Calls `window.phone.CollapseOtherExtendedSessions(session.Id)`
8. Resolves provider via `window.phone.GetProvider(contact.Provider || "sip")`
9. If `SupportsRegistration === true` and not `"Connected"` or `"Registered"`: marks `Rejected`, shows toast, calls `RemoveSession`
10. Awaits `useProvider.AudioCall(contact.Number, session)`
11. Calls `window.phone.SelectBuddy(buddy)`, `UpdateStage()`, `UpdateBuddyList()`

</details>

<details>
<summary><strong>OnCancel(session, buddy)</strong></summary>

```typescript
/**
 * Cancels an outbound call that has not yet been answered.
 * @param {SessionObject} session - The session to cancel.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

1. Calls `window.phone.StopRingback(session)`
2. Sets `session.State = "Ended"`, `session.Timer = 0`
3. Calls `useProvider.Cancel(session)` if available
4. After 100ms: filters session from `buddy.Sessions`, calls `UpdateBuddyList()`, `UpdateStage()`

</details>

<details>
<summary><strong>OnHangup(session, buddy)</strong></summary>

```typescript
/**
 * Hangs up an active or established call.
 * @param {SessionObject} session - The session to hang up.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

1. Guards against null/undefined `session`
2. Sets `session.State = "Ended"`, `session.Timer = 0`
3. Handles both string and object forms of `session.Provider` (uses `session.Provider.Type` if object)
4. Calls `useProvider.Hangup(session)` if available
5. Schedules `RemoveSession` after `removeDelay` ms (default `1000`; `5000` on provider error)

</details>

<details>
<summary><strong>OnAnswer(session, buddy)</strong></summary>

```typescript
/**
 * Answers an inbound call.
 * @param {SessionObject} session - The inbound session to answer.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

Sets `session.State = "Establishing"`, `session.Status` to `window.phone.Lang.connecting`, calls `UpdateStage()`, then awaits `useProvider.Answer(session)`.

</details>

<details>
<summary><strong>OnDecline(session, buddy)</strong></summary>

```typescript
/**
 * Declines an inbound call.
 * @param {SessionObject} session - The inbound session to decline.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.Decline(session)`, then after 1000ms removes the session. Belt-and-braces: removal setTimeout fires twice (inside and outside the `if` block).

</details>

<details>
<summary><strong>OnHold(session, buddy)</strong></summary>

```typescript
/**
 * Places an active call on hold.
 * @param {SessionObject} session - The session to hold.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.Hold(session)`, appends `{ TimeStamp, Type: "Call placed on hold" }` to `session.Activity`, sets `session.isOnHold = true`, calls `window.phone.OnCallHold(session)`.

</details>

<details>
<summary><strong>OnUnhold(session, buddy)</strong></summary>

```typescript
/**
 * Resumes a call that was on hold.
 * @param {SessionObject} session - The session to unhold.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.Unhold(session)`, appends `{ TimeStamp, Type: "Unhold" }` to `session.Activity`, sets `session.isOnHold = false`, calls `window.phone.OnCallUnhold(session)`.

</details>

<details>
<summary><strong>OnMute(session, buddy)</strong></summary>

```typescript
/**
 * Mutes the microphone for the active session.
 * @param {SessionObject} session - The session to mute.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.Mute(session)`, appends `{ TimeStamp, Type: "Muted" }` to `session.Activity`.

</details>

<details>
<summary><strong>OnUnmute(session, buddy)</strong></summary>

```typescript
/**
 * Unmutes the microphone for the active session.
 * @param {SessionObject} session - The session to unmute.
 * @param {BuddyObject} buddy - The buddy associated with the session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.UnMute(session)` (capital M), appends `{ TimeStamp, Type: "Unmuted" }` to `session.Activity`.

> Note: The provider method is `UnMute`, not `Unmute`.

</details>

<details>
<summary><strong>OnSendDtmf(dtmf, session)</strong></summary>

```typescript
/**
 * Sends a DTMF tone during an active call.
 * @param {string} dtmf - The DTMF digit(s) to send (e.g. "1", "#", "*").
 * @param {SessionObject} session - The active session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.SendDtmf(dtmf, session)`.

</details>

<details>
<summary><strong>OnAttendedTransfer(currentBuddy, session, buddy, contact)</strong></summary>

```typescript
/**
 * Initiates an attended (consultative) transfer.
 * @param {BuddyObject} currentBuddy - The buddy holding the original call.
 * @param {SessionObject} session - The original call session.
 * @param {BuddyObject} buddy - The transfer target buddy.
 * @param {ContactObject} contact - The transfer target contact.
 * @returns {Promise<void>}
 */
```

1. Creates child `SessionObject` with `State: "Establishing"`, `Status: "Attended Transfer"`, `Direction: "outbound"`, `ParentSessionId: session.Id`
2. Pushes `newChildSession` onto `currentBuddy.Sessions`
3. Sets `session.AttendedTransferCall = newChildSession.Id`
4. Calls `useProvider.AttendedTransfer(currentBuddy, session, buddy, contact, newChildSession)`

</details>

<details>
<summary><strong>OnCancelAttendedTransfer(childSession)</strong></summary>

```typescript
/**
 * Cancels an in-progress attended transfer (before it is completed).
 * @param {SessionObject} childSession - The child/transfer-leg session to cancel.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.CancelAttendedTransfer(childSession)`. If `childSession.ParentSessionId` is set, retrieves parent, clears `parentSession.AttendedTransferCall = null`.

</details>

<details>
<summary><strong>OnCompleteTransfer(childSession)</strong></summary>

```typescript
/**
 * Completes an attended transfer, connecting the original caller to the transfer target.
 * @param {SessionObject} childSession - The child/transfer-leg session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.CompleteTransfer(childSession)`.

</details>

<details>
<summary><strong>OnHangupAttendedTransfer(childSession)</strong></summary>

```typescript
/**
 * Hangs up the transfer leg of an attended transfer without completing it.
 * @param {SessionObject} childSession - The child/transfer-leg session.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.HangupAttendedTransfer(childSession)`.

</details>

<details>
<summary><strong>OnBlindTransfer(currentBuddy, session, buddy, contact)</strong></summary>

```typescript
/**
 * Initiates a blind (unattended) transfer.
 * @param {BuddyObject} currentBuddy - The buddy holding the original call.
 * @param {SessionObject} session - The original call session.
 * @param {BuddyObject} buddy - The transfer target buddy.
 * @param {ContactObject} contact - The transfer target contact.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.BlindTransfer(currentBuddy, session, buddy, contact)`.

</details>

<details>
<summary><strong>OnStartRecording(session)</strong></summary>

```typescript
/**
 * Starts recording the active call session.
 * Selects the video source based on the RecordPresenting setting.
 * @param {SessionObject} session - The session to start recording.
 * @returns {Promise<void>}
 */
```

**Video source priority** (when `RecordPresenting === true` and `session.Presenting` is set):
1. `session.PresentScreenMediaStream`
2. `session.PresentCanvasMediaStream`
3. `session.PresentVideoMediaStream`
4. Fallback: `session.RtpSenderVideoMediaStream`

Sets `session.RecordingMediaStream` (single-track proxy stream), then calls `window.phone.RecordSession(session)`.

</details>

<details>
<summary><strong>OnStopRecording(session)</strong></summary>

```typescript
/**
 * Stops the active call recording and cleans up the proxy media stream.
 * @param {SessionObject} session - The session to stop recording.
 * @returns {Promise<void>}
 */
```

Calls `window.phone.StopRecordingSession(session)`, removes all tracks from `session.RecordingMediaStream`, deletes the property.

</details>

<details>
<summary><strong>OnUpdateRecording(session)</strong></summary>

```typescript
/**
 * Updates the active recording when the presentation source changes.
 * Only performs track swaps if session.isRecording is true.
 * @param {SessionObject} session - The session whose recording should be updated.
 * @returns {Promise<void>}
 */
```

Returns immediately if `session.isRecording` is falsy. Uses same source priority as `OnStartRecording`. Last-resort fallback: reads live video track from `session.RTPSession?.sessionDescriptionHandler?.peerConnection`. Calls `window.phone.UpdateRecordingSession(session)` after any track swap.

</details>

<details>
<summary><strong>OnConference(currentBuddy, session, buddy, contact)</strong></summary>

```typescript
/**
 * Initiates a conference call between the current session and a new participant.
 * @param {BuddyObject} currentBuddy - The buddy in the current call.
 * @param {SessionObject} session - The current call session.
 * @param {BuddyObject} buddy - The conference participant buddy.
 * @param {ContactObject} contact - The conference participant contact.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.Conference(currentBuddy, session, buddy, contact)`.

</details>

<details>
<summary><strong>OnJoinConference(session)</strong></summary>

```typescript
/**
 * Joins an existing conference from the given session.
 * @param {SessionObject} session - The session to join the conference with.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.JoinConference(session)`.

</details>

<details>
<summary><strong>OnHangupConference(session)</strong></summary>

```typescript
/**
 * Hangs up a conference session.
 * @param {SessionObject} session - The conference session to hang up.
 * @returns {Promise<void>}
 */
```

Calls `useProvider.HangupConference(session)`.

</details>

<details>
<summary><strong>OnVideoCall(contact, buddy)</strong></summary>

```typescript
/**
 * Initiates an outbound video call.
 * @param {ContactObject} contact - The contact to call (must include Provider).
 * @param {BuddyObject} buddy - The buddy associated with the call.
 * @returns {Promise<SessionObject | void>}
 */
```

1. Only proceeds if `useProvider.SupportsVideo === true` (strict boolean)
2. Validates `window.phone.Settings.VideoInputDevice` and `VideoSrcId` — normalises to `"default"` if missing
3. Shows toast with `Lang.no_video_device_body` / `Lang.no_video_device_title` if `MyVideoinputDevices` is empty
4. Constructs `SessionObject` with `WithVideo: true`, `IsVideoMuted: false`
5. Awaits `useProvider.VideoCall(contact.Number, session)`

</details>

<details>
<summary><strong>OnPresentBlank(session)</strong></summary>

```typescript
/**
 * Switches the active video presentation to a blank (black) screen.
 * @param {SessionObject} session - The active video session.
 * @returns {Promise<void>}
 */
```

Sets `session.Presenting = "Blank"`, calls `window.phone.UpdateSession(session)`, then `useProvider.ToggleVideo(session, session.IsVideoMuted)`.

</details>

<details>
<summary><strong>OnSendTextMessage(buddy, contact, message)</strong></summary>

```typescript
/**
 * Sends an outbound text message to a contact.
 * @param {BuddyObject} buddy - The buddy to send the message to.
 * @param {ContactObject} contact - The contact (must include Provider and Number).
 * @param {string} message - The message body text.
 * @returns {Promise<void>}
 */
```

1. Generates UUID via `window.phone.UID()`
2. Constructs `MessageStreamItem` with `Type: "MSG"`, `Direction: "outbound"`, `Status: "QUEUED"`
3. Calls `window.phone.AddMessage(buddy, messageItem)` (persists before delivery)
4. Awaits `useProvider.SendMessage(buddy, contact, messageItem)`

</details>

<details>
<summary><strong>TimeNow() / UID() / RandomAvatar()</strong></summary>

```typescript
/**
 * Returns the current date and time as an ISO 8601 UTC string.
 * @returns {string}
 */
window.phone.TimeNow(): string   // new Date().toISOString()

/**
 * Generates a cryptographically random UUID v4.
 * @returns {string}
 */
window.phone.UID(): string   // uuidv4()

/**
 * Returns a URL for a randomly selected avatar image.
 * @returns {string}
 * // "https://cdn.siperb.com/avatars/default.3.webp" (web platform)
 * // or "./avatars/default.3.webp" (non-web platform)
 */
window.phone.RandomAvatar(): string
```

`RandomAvatar` reads `window.phone.Settings.AvailableAvatar` (array). Falls back to `'./avatars/default.0.webp'` if the array is empty. Returns CDN URL if `Platform === "web"` or `Platform` is undefined.

</details>

**CoreCallbacks API Reference:**

| Export | Signature | Returns |
|---|---|---|
| `SaveSettings` | `() => void` | `void` |
| `OnAudioCall` | `(contact: ContactObject, buddy: BuddyObject, existingSession?: SessionObject) => Promise<void \| SessionObject>` | `Promise<void \| SessionObject>` |
| `OnCancel` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnHangup` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnAnswer` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnDecline` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnHold` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnUnhold` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnMute` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnUnmute` | `(session: SessionObject, buddy: BuddyObject) => Promise<void>` | `Promise<void>` |
| `OnSendDtmf` | `(dtmf: string, session: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnAttendedTransfer` | `(currentBuddy: BuddyObject, session: SessionObject, buddy: BuddyObject, contact: ContactObject) => Promise<void>` | `Promise<void>` |
| `OnCancelAttendedTransfer` | `(childSession: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnCompleteTransfer` | `(childSession: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnHangupAttendedTransfer` | `(childSession: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnBlindTransfer` | `(currentBuddy: BuddyObject, session: SessionObject, buddy: BuddyObject, contact: ContactObject) => Promise<void>` | `Promise<void>` |
| `OnStartRecording` | `(session: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnStopRecording` | `(session: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnUpdateRecording` | `(session: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnConference` | `(currentBuddy: BuddyObject, session: SessionObject, buddy: BuddyObject, contact: ContactObject) => Promise<void>` | `Promise<void>` |
| `OnJoinConference` | `(session: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnHangupConference` | `(session: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnVideoCall` | `(contact: ContactObject, buddy: BuddyObject) => Promise<SessionObject \| void>` | `Promise<SessionObject \| void>` |
| `OnPresentBlank` | `(session: SessionObject) => Promise<void>` | `Promise<void>` |
| `OnSendTextMessage` | `(buddy: BuddyObject, contact: ContactObject, message: string) => Promise<void>` | `Promise<void>` |
| `TimeNow` | `() => string` | `string` |
| `UID` | `() => string` | `string` |
| `RandomAvatar` | `() => string` | `string` |

---

### 📋 Session Callbacks

**Source:** `src/SessionCallbacks.ts` — `InitSessionCallbacks()` registers all session functions.

<details>
<summary><strong>Session Management</strong></summary>

```typescript
/**
 * Returns all currently active sessions across all buddies.
 * @returns {SessionObject[]}
 */
window.phone.GetActiveSessions(): SessionObject[]

/**
 * Retrieves a session by its ID.
 * @param {string} id - The session ID.
 * @returns {SessionObject | null}
 */
window.phone.GetSession(id: string): SessionObject | null

/**
 * Adds a new session to global state.
 * @param {SessionObject} session
 * @returns {void}
 */
window.phone.AddSession(session: SessionObject): void

/**
 * Patches a session in global state. Does NOT update the Timer field.
 * @param {SessionObject} session
 * @returns {void}
 */
window.phone.UpdateSession(session: SessionObject): void

/**
 * Removes a session from global state.
 * @param {string} id - The session ID to remove.
 * @returns {void}
 */
window.phone.RemoveSession(id: string): void

/**
 * Subscribes to session change events.
 * @param {(session: SessionObject) => void} callback
 * @returns {() => void} Unsubscribe function
 */
window.phone.OnSessionChange(callback: (session: SessionObject) => void): () => void
```

> Note: `UpdateSession` intentionally skips the `Timer` field to avoid overwriting the running timer.

</details>

<details>
<summary><strong>Call Timer</strong></summary>

```typescript
window.phone.StartCallTimer(session: SessionObject): void
window.phone.StopCallTimer(session: SessionObject): void
window.phone.UpdateSessionTimer(session: SessionObject): void
```

</details>

<details>
<summary><strong>Call State & Status</strong></summary>

```typescript
window.phone.UpdateCallStatus(session: SessionObject, status: string): void
window.phone.UpdateCallState(session: SessionObject, state: string): void
```

</details>

<details>
<summary><strong>Session Events</strong></summary>

```typescript
/**
 * Adds an event to the session's event log.
 * Dedup: same Activity within 100ms is dropped. OnCallAnswered is only allowed once per session.
 * @param {SessionObject} session
 * @param {SessionEvent} event
 * @returns {void}
 */
window.phone.AddSessionEvent(session: SessionObject, event: SessionEvent): void
```

</details>

<details>
<summary><strong>Audio Levels & Stats</strong></summary>

```typescript
window.phone.UpdateSessionSenderAudioLevel(session: SessionObject, level: number): void
window.phone.UpdateSessionReceiverAudioLevel(session: SessionObject, level: number): void
window.phone.UpdateSessionSenderStats(session: SessionObject, stats: any): void
window.phone.UpdateSessionReceiverStats(session: SessionObject, stats: any): void
window.phone.UpdateSessionRemoteInboundRtpStreamStats(session: SessionObject, stats: any): void
```

**MOS quality threshold:** `packet_loss >= 1` OR `mos_avg < 4` triggers a quality warning.

</details>

<details>
<summary><strong>Multi-Call Helpers</strong></summary>

```typescript
/**
 * Places all sessions except the given one on hold.
 * @param {string} exceptSessionId
 * @returns {Promise<void>}
 */
window.phone.PlaceOtherCallsOnHold(exceptSessionId: string): Promise<void>

/**
 * Collapses all extended session views except the given one.
 * @param {string} exceptSessionId
 * @returns {void}
 */
window.phone.CollapseOtherExtendedSessions(exceptSessionId: string): void
```

</details>

<details>
<summary><strong>Inbound Call</strong></summary>

```typescript
/**
 * Handles an inbound call event from a provider.
 * @param {SessionObject} session - The inbound session.
 * @param {BuddyObject} buddy - The associated buddy.
 * @returns {void}
 */
window.phone.OnIncomingCall(session: SessionObject, buddy: BuddyObject): void
```

</details>

### `SessionEventTypes` (50+ constants)

Key session event type strings used in `AddSessionEvent`:

| Constant | Description |
|---|---|
| `OnCallAnswered` | Call was answered (only allowed once per session) |
| `OnCallConnected` | Media connected |
| `OnCallEnded` | Call ended |
| `OnHold` | Call placed on hold |
| `OnUnhold` | Call resumed from hold |
| `OnMute` | Microphone muted |
| `OnUnmute` | Microphone unmuted |
| `OnTransfer` | Transfer initiated |
| `OnConference` | Conference initiated |
| `ConferenceOwner` | Session is conference owner |
| `ConferenceParticipant` | Session is conference participant |
| `Transferee` | Session is attended transfer transferee |
| `Target` | Session is attended transfer target |
| ... | (50+ total — see `src/SessionCallbacks.ts`) |

---

### 💬 Message Stream Callbacks

**Source:** `src/MessageStreamCallbacks.ts` — `InitMessageStreamCallbacks()`

<details>
<summary><strong>Message Persistence</strong></summary>

**Dual-storage:** localStorage backup + IndexedDB canonical. Each write is verified with a read-back.

```typescript
/**
 * Adds a MessageStreamItem to a buddy's message history and persists it.
 * @param {BuddyObject} buddy
 * @param {MessageStreamItem} item
 * @returns {Promise<void>}
 */
window.phone.AddMessage(buddy: BuddyObject, item: MessageStreamItem): Promise<void>

/**
 * Builds a MessageStreamItem from raw data.
 * @param {Partial<MessageStreamItem>} data
 * @returns {MessageStreamItem}
 */
window.phone.BuildMessageStreamItem(data: Partial<MessageStreamItem>): MessageStreamItem

/**
 * Updates a CDR message item for a session.
 * @param {BuddyObject} buddy
 * @param {SessionObject} session
 * @param {Partial<MessageStreamItem>} updates
 * @returns {Promise<void>}
 */
window.phone.UpdateCallDetailRecord(buddy: BuddyObject, session: SessionObject, updates: Partial<MessageStreamItem>): Promise<void>

/**
 * Loads a message from storage.
 * @param {string} messageId
 * @returns {Promise<MessageStreamItem | null>}
 */
window.phone.LoadMessage(messageId: string): Promise<MessageStreamItem | null>

/**
 * Retrieves a MessageStreamItem from in-memory state.
 * @param {BuddyObject} buddy
 * @param {string} messageId
 * @returns {MessageStreamItem | null}
 */
window.phone.GetMessageStreamItem(buddy: BuddyObject, messageId: string): MessageStreamItem | null

/**
 * Sets (overwrites) a MessageStreamItem in in-memory state.
 * @param {BuddyObject} buddy
 * @param {MessageStreamItem} item
 * @returns {void}
 */
window.phone.SetMessageStreamItem(buddy: BuddyObject, item: MessageStreamItem): void

/**
 * Saves a MessageStreamItem to storage.
 * @param {BuddyObject} buddy
 * @param {MessageStreamItem} item
 * @returns {Promise<void>}
 */
window.phone.SaveMessage(buddy: BuddyObject, item: MessageStreamItem): Promise<void>

/**
 * Loads all messages for a buddy from storage.
 * @param {BuddyObject} buddy
 * @returns {Promise<void>}
 */
window.phone.LoadBuddyMessages(buddy: BuddyObject): Promise<void>

/**
 * Flags a message (e.g. marks as read, failed, etc.).
 * @param {BuddyObject} buddy
 * @param {string} messageId
 * @param {string} flag
 * @returns {Promise<void>}
 */
window.phone.FlagMessage(buddy: BuddyObject, messageId: string, flag: string): Promise<void>

/**
 * Normalises saved messages on load (repairs missing fields, upgrades schema).
 * @param {MessageStreamItem[]} messages
 * @returns {MessageStreamItem[]}
 */
window.phone.normalizeSavedMessages(messages: MessageStreamItem[]): MessageStreamItem[]
```

> Known bug: CDR body duration always shows 0 seconds in the human-readable `Body` field.
> Known quirk: `CDRMessageItem` has a misspelled field `TermindatedBy` (not `TerminatedBy`).

</details>

---

### 📨 Messaging Callbacks

**Source:** `src/MessagingCallbacks.ts` — `InitMessagingCallbacks()`

<details>
<summary><strong>Message Status Handlers</strong></summary>

All handlers are fire-and-forget (synchronous wrappers around async):

```typescript
window.phone.OnMessageSent(buddy: BuddyObject, message: MessageStreamItem): void
window.phone.OnMessageDelivered(buddy: BuddyObject, message: MessageStreamItem): void
window.phone.OnMessageRead(buddy: BuddyObject, message: MessageStreamItem): void

/**
 * @param {BuddyObject} buddy
 * @param {MessageStreamItem} message
 * @param {string} Reason - Written at both top level and inside ProviderData
 */
window.phone.OnMessageFailed(buddy: BuddyObject, message: MessageStreamItem, Reason: string): void

/**
 * Handles an inbound message received from a provider.
 * Note: hardcoded to Provider: "sip"
 */
window.phone.OnMessageReceived(buddy: BuddyObject, message: MessageStreamItem): void
```

</details>

---

### 🌐 Network Handler

**Source:** `src/NetworkHandler.ts` — `InitNetworkHandler()`

<details>
<summary><strong>Network State</strong></summary>

```typescript
window.phone.Online: boolean          // Current network state
window.phone.IsOnline(): boolean      // Returns window.phone.Online
```

Registers listeners for `DOMContentLoaded`, `online`, `offline` DOM events. Updates `window.phone.Online` accordingly.

</details>

---

### 📱 Phone API (Top-Level)

**Source:** `src/PhoneAPI.ts`

<details>
<summary><strong>Call Control</strong></summary>

All accept polymorphic params: `string | SessionObject | BuddyObject`.

```typescript
window.phone.Dial(contact: string | ContactObject, buddy?: BuddyObject): Promise<SessionObject | void>
window.phone.EndCall(session: string | SessionObject): Promise<void>
window.phone.Answer(session: string | SessionObject): Promise<void>
window.phone.Decline(session: string | SessionObject): Promise<void>
window.phone.Hold(session: string | SessionObject): Promise<void>
window.phone.Unhold(session: string | SessionObject): Promise<void>
window.phone.Mute(session: string | SessionObject): Promise<void>
window.phone.Unmute(session: string | SessionObject): Promise<void>

/**
 * Initiates an attended transfer.
 * @returns {{ session: SessionObject, childSessionId: string }}
 */
window.phone.AttendedTransfer(session: string | SessionObject, target: string | ContactObject): Promise<{ session: SessionObject, childSessionId: string }>
window.phone.CompleteTransfer(childSessionId: string): Promise<void>
window.phone.CancelTransfer(childSessionId: string): Promise<void>
window.phone.BlindTransfer(session: string | SessionObject, target: string | ContactObject): Promise<void>
window.phone.SendDtmf(dtmf: string, session: string | SessionObject): Promise<void>
```

</details>

<details>
<summary><strong>Buddy Management</strong></summary>

```typescript
/**
 * Adds a new buddy. Returns null for duplicate Id or DisplayName.
 * @returns {BuddyObject | null}
 */
window.phone.AddBuddy(data: Partial<BuddyObject>): BuddyObject | null

window.phone.DeleteBuddy(buddy: string | BuddyObject): void
window.phone.UpdateBuddy(buddy: string | BuddyObject, updates: Partial<BuddyObject>): void
```

</details>

<details>
<summary><strong>Recording API</strong></summary>

```typescript
window.phone.SaveRecording(session: SessionObject): Promise<void>
window.phone.GetRecording(recordingId: string): Promise<RecordingObject | null>
window.phone.PlayRecording(recordingId: string): Promise<void>

/**
 * Generates a JPEG data URL thumbnail from the first frame of a recording.
 * @returns {Promise<string | null>} JPEG data URL or null
 */
window.phone.GenerateRecordingThumbnail(recordingId: string): Promise<string | null>
```

</details>

---

### 🎥 Presentation Callbacks

**Source:** `src/PresentationCallbacks.ts`

<details>
<summary><strong>Presentation Functions</strong></summary>

All require `session.State === "Established"` (except stop functions and `OnPresentBlank`):

```typescript
/**
 * Starts presenting a video stream.
 * Sets session.Presenting = "Video"
 * @param {SessionObject} session
 * @param {MediaStream} stream
 * @returns {Promise<void>}
 */
window.phone.OnPresentVideo(session: SessionObject, stream: MediaStream): Promise<void>

/**
 * Stops presenting video, restores original stream.
 */
window.phone.OnStopPresentingVideo(session: SessionObject): Promise<void>

/**
 * Presents blank screen. Sets session.Presenting = "Blank".
 * Does NOT require Established state.
 */
window.phone.OnPresentBlank(session: SessionObject): Promise<void>

/**
 * Starts screen sharing. Calls navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).
 * Sets session.Presenting = "Screen"
 */
window.phone.OnPresentScreen(session: SessionObject): Promise<void>

window.phone.OnStopPresentingScreen(session: SessionObject): Promise<void>

/**
 * Sets session.Presenting = "Whiteboard"
 */
window.phone.OnPresentWhiteboard(session: SessionObject): Promise<void>

window.phone.OnStopPresentingWhiteboard(session: SessionObject): Promise<void>
```

`session.Presenting` values: `"Blank" | "Picture" | "Webcam" | "Screen" | "Video" | "Whiteboard" | null`

`OnPresentVideo` saves originals to `session.OriginalRtpSenderVideoMediaStream` and `session.OriginalRtpSenderAudioMediaStream`.

</details>

---

### 🔌 Provider Callbacks

**Source:** `src/ProviderCallbacks.ts`

<details>
<summary><strong>Provider Management</strong></summary>

```typescript
/**
 * Registers a provider.
 * @param {object} provider - Provider object with TypeStr property.
 * @returns {void}
 */
window.phone.AddProvider(provider: object): void

/**
 * Retrieves a registered provider.
 * @param {string | { Type: string }} type - Provider TypeStr or { Type } object.
 * @returns {object | null}
 */
window.phone.GetProvider(type: string | { Type: string }): object | null

/**
 * Returns all registered providers.
 * @returns {object[]}
 */
window.phone.GetProviders(): object[]

window.phone.ProviderConnected(provider: object): void
window.phone.ProviderDisconnected(provider: object): void   // stub
window.phone.ConnectProvider(type: string): void
window.phone.UpdateProviderStatus(provider: object, status: string): void
window.phone.UpdateProviderState(provider: object, state: string): void
window.phone.ProviderError(provider: object, error: any): void
```

Providers are identified by `TypeStr`. `GetProvider` accepts both a string and a `{ Type }` object.

</details>

<details>
<summary><strong>Provider Messaging Stubs</strong></summary>

```typescript
window.phone.ProviderMessage(provider: object, message: any): void
window.phone.ProviderMessageReceived(provider: object, message: any): void
window.phone.ProviderMessageSent(provider: object, message: any): void
window.phone.ProviderMessageDelivered(provider: object, message: any): void
window.phone.ProviderMessageRead(provider: object, message: any): void
```

</details>

---

### 🔔 Callkit Callbacks

**Source:** `src/CallkitCallbacks.ts`

<details>
<summary><strong>Callkit Functions</strong></summary>

```typescript
/**
 * Called when a call starts. Posts { Source: "phone", Action: "OnCallStarted", Data: ... } via postMessage.
 */
window.phone.OnCallStarted(session: SessionObject): void

/**
 * Called when a call connects. If typeof RecordAllCalls === "boolean" and RecordAllCalls === true,
 * automatically starts recording.
 * Note: uses strict boolean true check (typeof RecordAllCalls === "boolean")
 */
window.phone.OnCallConnected(session: SessionObject): void

/**
 * Called when a call ends. Posts { Source: "phone", Action: "OnCallEnded", Data: ... } via postMessage.
 */
window.phone.OnCallEnded(session: SessionObject): void

window.phone.OnCallOutgoing(session: SessionObject): void   // stub
window.phone.OnCallMissed(session: SessionObject): void     // stub

/**
 * Returns the total number of active calls across all providers.
 * @returns {number}
 */
window.phone.GetCallCount(): number
```

> Note: `OnCallConnected` uses `typeof RecordAllCalls === "boolean"` guard — only strict `true` triggers auto-record.

</details>

---

## 📡 Browser-Phone-SipProvider

Source: `src/SipProvider.ts`, `src/WebSipCore.ts`, `src/MobileSipCore.ts`, `src/SipProviderTypes.ts`

<details>
<summary><strong>📘 Architecture & Initialisation</strong></summary>

### Dual-Core Architecture

| Core | Platform | Underlying Library |
|---|---|---|
| `WebSipCore` | Browser | SIP.js 0.21.2 |
| `MobileSipCore` | React Native | SIP.js (React Native bridge) |

### Configuration Hierarchy

```typescript
SipProviderConfiguration extends SipProviderSettings, SipProviderCallbacks, SipProviderMethods
```

### Initialisation Flow

```
window.phone.Init(settings)
  → BrowserPhoneSipProvider.Core.Init(settings)
    → SipProvider.Init(settings)
      → UserAgentManager.CreateUserAgent(settings)
```

### `window.phone.Init(settings)`

```typescript
/**
 * Initialises the SIP provider with the given configuration.
 * @param {SipProviderConfiguration} settings - Full configuration object.
 * @returns {Promise<void>}
 * @example
 * await window.phone.Init({
 *   SipUsername: "1000",
 *   SipPassword: "secret",
 *   SipDomain: "pbx.example.com",
 *   WssServer: "wss://pbx.example.com",
 *   WebSocketPort: 443,
 * });
 */
```

</details>

---

### ⚙️ SipProvider Settings

**Source:** `src/SipProviderTypes.ts:460` — `SipProviderSettings` interface

<details>
<summary><strong>SipProviderSettings Fields</strong></summary>

**Identity**

| Key | Type | Description |
|---|---|---|
| `DeviceId` | `string` | Unique device identifier for this SIP provider instance |
| `Platform` | `string` | Platform identifier — e.g. `"web"`, `"mobile"`, `"desktop"` |
| `DisplayName` | `string` | Display name included in SIP `From` header |
| `UserAgentStr` | `string` | SIP `User-Agent` header value |

**SIP Account**

| Key | Type | Description |
|---|---|---|
| `SipUsername` | `string` | SIP authentication username |
| `SipPassword` | `string` | SIP authentication password |
| `SipDomain` | `string` | SIP domain for authentication and routing |
| `ContactUserName` | `string` | Contact username for SIP requests |

**Transport**

| Key | Type | Description |
|---|---|---|
| `WssServer` | `string` | WSS server URL for secure WebSocket connections |
| `WebSocketPort` | `number` | WebSocket port number |
| `WssInTransport` | `boolean` | Use WSS (WebSocket Secure) in transport URI |
| `ServerPath` | `string` | Server path for SIP requests |
| `IpInContact` | `boolean` | Include IP address in the SIP `Contact` header |
| `TransportConnectionTimeout` | `number` | Transport connection timeout (ms) |
| `TransportReconnectionTimeout` | `number` | Delay between reconnection attempts (ms) |
| `TransportReconnectionAttempts` | `number` | Maximum number of reconnection attempts |

**Registration**

| Key | Type | Description |
|---|---|---|
| `RegisterExpires` | `number` | Registration expiration time (seconds) |
| `RegisterContactParams` | `string \| Record<string, any>` | Extra parameters appended to the REGISTER Contact header |
| `ExtraRegisterHeaders` | `string \| Record<string, string>` | Extra headers sent in REGISTER requests |
| `ExtraRegisterContactParams` | `string \| Record<string, any>` | Additional Contact parameters for REGISTER |

**ICE / STUN**

| Key | Type | Description |
|---|---|---|
| `IceStunServerJson` | `string` | ICE STUN server configuration (JSON string) |
| `IceStunCheckTimeout` | `number` | Timeout for ICE STUN connectivity check (ms) |

**Audio Processing**

| Key | Type | Description |
|---|---|---|
| `AutoGainControl` | `boolean` | Enable automatic gain control |
| `EchoCancellation` | `boolean` | Enable echo cancellation |
| `NoiseSuppression` | `boolean` | Enable noise suppression |
| `DtmfType` | `"inband" \| "info" \| "outband"` | DTMF transport method |

**Video**

| Key | Type | Description |
|---|---|---|
| `MaxFrameRate` | `string` | Maximum video frame rate constraint |
| `MaxHeight` | `string` | Maximum video height constraint |
| `MaxAspectRatio` | `string` | Maximum video aspect ratio constraint |

**Call Timing**

| Key | Type | Description |
|---|---|---|
| `RingbackTimeout` | `number` | Ringback timeout before `OnRingbackTimeout` fires (ms) |
| `NoAnswerTimeout` | `number` | No-answer timeout for inbound calls (ms) |
| `AudioLevelInterval` | `number` | Audio level polling interval (ms) |
| `PeerConnectionStatsInterval` | `number` | Peer connection stats collection interval (ms) |

**SIP Extras**

| Key | Type | Description |
|---|---|---|
| `ExtraInviteHeaders` | `Record<string, string>` | Extra headers added to every INVITE request |
| `ExtraCallDetailRecordsValues` | `Record<string, string>` | Extra key-value pairs merged into every CDR |

**WebRTC**

| Key | Type | Description |
|---|---|---|
| `BundlePolicy` | `string` | WebRTC `RTCConfiguration.bundlePolicy` value |

**Misc**

| Key | Type | Description |
|---|---|---|
| `LogSipMessage` | `(message: any) => void` | Custom SIP message logger |
| `[key: string]` | `any` | Additional dynamic properties for extensibility |

</details>

<details>
<summary><strong>window.phone.Settings — Runtime Keys</strong></summary>

These are **runtime globals** consumed by the browser-phone integration code (not the typed `SipProviderSettings` interface).

| Key | Type | Default | Notes |
|---|---|---|---|
| `Providers` | `any[]` | `[]` | Array of registered SIP providers |
| `AutoHoldOnInvite` | `boolean \| undefined` | Enabled when `true` or `undefined` | Holds other calls before sending INVITE |
| `AutoHoldOnAnswer` | `boolean \| undefined` | Enabled when `true` or `undefined` | Holds other calls when answering |
| `AudioSrcId` | `string` | `'default'` | Preferred audio input selector |
| `VideoSrcId` | `string` | `'default'` | Preferred video input selector |
| `CaptureVideoHeight` | `string` | `""` | Video height for outbound video calls |
| `CaptureVideoFps` | `string` | `""` | Video FPS for outbound video calls |
| `CaptureVideoAspectRatio` | `string` | `""` | Video aspect ratio for outbound video calls |
| `MirrorVideo` | `string` | `"rotateY(180deg)"` | CSS transform for local video preview |
| `MaxVideoBandwidth` | `string` | `"2048"` | Max video bandwidth for outbound calls |
| `AutoDeleteDefault` | `boolean` | — | Enables auto-delete behavior fallback |
| `ProfileUserName` | `string` | `""` | Used as `ToName` fallback in CDR/message payloads |
| `DoNotDisturb` | `boolean` | `false` | Inbound calls declined unless `buddy.EnableDuringDnd` is true |
| `AutoAnswer` | `boolean` | `false` | Auto-answers inbound calls after `AutoAnswerTimeout` |
| `AutoAnswerTimeout` | `number` | `1000` (ms) | Delay before auto-answer triggers |
| `CallWaiting` | `boolean` | `true` | When false, new inbound calls rejected with "Call Waiting Disabled" |
| `SelectRingingLine` | `boolean` | `false` | Selects the ringing line's buddy in UI when multiple calls exist |
| `EnableVideoCalling` | `boolean` | — | Sets `phone.SipProvider.SupportsVideo = true` during provider init |
| `AutoGainControl` | `boolean` | `true` | Default WebRTC audio processing setting |
| `EchoCancellation` | `boolean` | `true` | Default WebRTC audio processing setting |
| `NoiseSuppression` | `boolean` | `true` | Default WebRTC audio processing setting |

</details>

---

### 📞 Calling API

**Source:** `src/SipProvider.ts` — methods on the SipProvider instance

<details>
<summary><strong>Outbound Calls</strong></summary>

```typescript
/**
 * Initiates an outbound audio call.
 * @param {SessionObject} session - The session object.
 * @param {ContactObject} contact - The contact to call.
 * @returns {Promise<SipProviderResponse>}
 */
AudioCall(session: SessionObject, contact: ContactObject): Promise<SipProviderResponse>

/**
 * Initiates an outbound video call.
 * Note: parameter order is reversed from AudioCall.
 * @param {ContactObject} contact - The contact to call.
 * @param {SessionObject} session - The session object.
 * @returns {Promise<SipProviderResponse>}
 */
VideoCall(contact: ContactObject, session: SessionObject): Promise<SipProviderResponse>
```

> Note: `AudioCall` takes `(session, contact)` but `VideoCall` takes `(contact, session)` — parameter order is reversed.

</details>

<details>
<summary><strong>Inbound Call Handling</strong></summary>

```typescript
/**
 * Answers an inbound call.
 * @param {SessionObject} session
 * @returns {Promise<SipProviderResponse>}
 */
AnswerAudioCall(session: SessionObject): Promise<SipProviderResponse>

/**
 * Rejects an inbound call.
 * @param {SessionObject} session
 * @param {string} [reasonCode]
 * @param {string} [reasonText]
 * @returns {Promise<SipProviderResponse>}
 */
RejectCall(session: SessionObject, reasonCode?: string, reasonText?: string): Promise<SipProviderResponse>
```

</details>

<details>
<summary><strong>Call Control</strong></summary>

```typescript
Hangup(session: SessionObject): Promise<SipProviderResponse>
Cancel(session: SessionObject, reasonCode?: string, reasonText?: string): Promise<SipProviderResponse>

/**
 * Hold = re-INVITE with sendonly/inactive (SIP signalling).
 */
Hold(session: SessionObject): Promise<SipProviderResponse>
Unhold(session: SessionObject): Promise<SipProviderResponse>

/**
 * Mute = track disable only (no SIP signalling).
 */
Mute(session: SessionObject): Promise<SipProviderResponse>
UnMute(session: SessionObject): Promise<SipProviderResponse>

/**
 * Sends DTMF.
 * @param {string} dtmf - DTMF digit(s)
 * @param {SessionObject} session
 * @param {{ duration?: number, interToneGap?: number, preferInfo?: boolean }} [options]
 */
SendDTMF(dtmf: string, session: SessionObject, options?: { duration?: number, interToneGap?: number, preferInfo?: boolean }): Promise<SipProviderResponse>
```

> Note: Mute disables the audio track — no SIP re-INVITE. Hold sends a re-INVITE with `sendonly`/`inactive`.
> Note: Provider method is `SendDTMF` (capital DTMF).

</details>

<details>
<summary><strong>Video Presentation</strong></summary>

```typescript
/**
 * Enables or disables video. Sets session.IsVideoMuted = !enabled.
 */
ToggleVideo(session: SessionObject, enabled: boolean): Promise<SipProviderResponse>

/**
 * Presents an external video stream. Saves originals to:
 *   session.OriginalRtpSenderVideoMediaStream
 *   session.OriginalRtpSenderAudioMediaStream
 */
PresentVideo(session: SessionObject, stream: MediaStream): Promise<SipProviderResponse>

StopPresentingVideo(session: SessionObject): Promise<SipProviderResponse>
```

</details>

---

### 🔄 Session State

<details>
<summary><strong>CallState Enum</strong></summary>

Source: `src/SipProviderTypes.ts`

| Value | String | Notes |
|---|---|---|
| `Initial` | `"Inital"` | **Intentionally misspelled** in source |
| `Inital` | `"Inital"` | Deprecated alias for `Initial` |
| `Establishing` | `"Establishing"` | |
| `Established` | `"Established"` | |
| `Terminated` | `"Terminated"` | |
| `Rejected` | `"Rejected"` | |
| `Disconnected` | `"Disconnected"` | |

> Note: `CallState.Initial` is stored as the string `"Inital"` (misspelled). This is intentional in the source.

</details>

<details>
<summary><strong>CallStatus Enum</strong></summary>

**Outbound pre-answer:**

| Value | Description |
|---|---|
| `StartingAudioCall` | Preparing audio call |
| `StartingVideoCall` | Preparing video call |
| `Trying` | INVITE sent |
| `Ringing` | 180/183 received |
| `Connecting` | Negotiating |

**Inbound pre-answer:**

| Value | Description |
|---|---|
| `Incoming` | INVITE received |
| `Answering` | Answering in progress |

**Active call:**

| Value | Description |
|---|---|
| `CallInProgress` | Call established |
| `InProgress` | Alternative in-progress status |
| `OnHold` | Call on hold |
| `OnMute` | Microphone muted |
| `Conference` | Conference call active |
| `RecordingStarted` | Recording in progress |
| `RecordingStopped` | Recording stopped |

**Terminal:**

| Value | Description |
|---|---|
| `Ended` | Call ended normally |
| `Cancelled` | Call cancelled before answer |
| `Failed` | Call failed |
| `Rejected` | Call rejected |
| `Missed` | Inbound call missed |
| `AnsweredElsewhere` | Answered on another device |
| `Redirect` | Call redirected |
| `Disconnected` | Disconnected |

</details>

<details>
<summary><strong>CallView Enum</strong></summary>

| Value | String |
|---|---|
| `Basic` | `"basic"` |
| `Extended` | `"extended"` |

</details>

<details>
<summary><strong>OnSessionStateChange Event</strong></summary>

The canonical session lifecycle PostMessage event. `State: "Terminated"` is the most reliable terminal signal.

```typescript
// Payload shape:
{
  Event: "OnSessionStateChange",
  Source: "SipProvider",
  Destination: "Phone",
  Data: {
    SessionId: string,
    Time: string,      // ISO timestamp from provider TimeNow()
    State: string      // SIP.js SessionState: "Establishing" | "Established" | "Terminated"
  }
}
```

**SIP.js SessionState values:**

| State | Meaning |
|---|---|
| `Initial` | Session object exists but not yet establishing |
| `Establishing` | INVITE transaction / negotiation in progress |
| `Established` | Dialog established |
| `Terminated` | Session ended — treat as terminal |

**Typical outbound call flow:**

| Order | Event | Session State |
|---|---|---|
| 1 | `OnTrying` | `Establishing` |
| 2 | `OnProgress` (180/183) | `Establishing` |
| 3 | `OnCallAnswered`, `OnAccept` | `Established` |
| 4 | `OnCallConnected` | `Established` |
| 5 | `OnBye` / `OnByeSent` / `OnHangup` | `Terminated` |

**Typical inbound call flow:**

| Order | Event | Session State |
|---|---|---|
| 1 | `OnIncomingCall` | `Initial` or `Establishing` |
| 2 | `OnAccept` | `Established` |
| 3 | `OnCallConnected` | `Established` |
| 4 | `OnBye` / `OnHangup` | `Terminated` |

</details>

---

### 📊 CDR Messages

**Source:** `src/SipProviderTypes.ts` — `CdrMessageData` interface

<details>
<summary><strong>CdrMessageData Fields</strong></summary>

| Field | Type | Description |
|---|---|---|
| `SessionId` | `string` | Session identifier |
| `BuddyId` | `string` | Associated buddy identifier |
| `Direction` | `string` | `"inbound"` or `"outbound"` |
| `StartTime` | `string` | ISO timestamp of call start |
| `EndTime` | `string` | ISO timestamp of call end |
| `AnswerTime` | `string` | ISO timestamp when call was answered |
| `TalkTime` | `number` | Duration of active talk (seconds) |
| `Duration` | `number` | Total call duration (seconds) |
| `FromName` | `string` | Caller display name |
| `FromNumber` | `string` | Caller number/URI |
| `ToName` | `string` | Callee display name |
| `ToNumber` | `string` | Callee number/URI |
| `CallId` | `string` | SIP Call-ID |
| `UserAgent` | `string` | User-Agent string |
| `ProfileUserId` | `string` | Profile user identifier |
| `Network` | `string` | Network identifier |
| `WithVideo` | `boolean` | Whether call included video |
| `Disposition` | `string` | Call disposition (see Dispositions enum) |
| `ReasonCode` | `string` | SIP reason code |
| `ReasonText` | `string` | SIP reason text |
| `TerminatedBy` | `string` | Who terminated the call |
| `Events` | `SessionEvent[]` | Session event log |
| `DeviceId` | `string` | Device identifier |
| `CDRs` | `any[]` | Additional CDR records |
| `ExtraCallDetailRecordValues` | `Record<string, string>` | Extra values from `ExtraCallDetailRecordsValues` setting |
| `ProviderData` | `ProviderData` | SIP-specific data |
| `PeerConnection` | `PeerConnectionData` | WebRTC peer connection data |

**Transfer fields:**

| Field | Type | Description |
|---|---|---|
| `TransferFromDisplayName` | `string` | Display name of transfer originator |
| `TransferToDisplayName` | `string` | Display name of transfer target |
| `BlindTransferDestination` | `string` | Blind transfer target URI |
| `AttendedTransferee` | `string` | Attended transfer transferee |
| `AttendedTransferTarget` | `string` | Attended transfer target |

**`ProviderData` structure:**

| Field | Type | Description |
|---|---|---|
| `Type` | `string` | Always `"sip"` |
| `Description` | `string` | Provider description |
| `Invite` | `any` | SIP INVITE details |
| `TargetUri` | `string` | Target SIP URI |
| `User` | `string` | SIP user |
| `ReasonCode` | `string` | SIP reason code |
| `ReasonText` | `string` | SIP reason text |

**`PeerConnectionData` structure:**

| Field | Description |
|---|---|
| `InboundRtpStreamStats` | Inbound RTP statistics |
| `OutboundRtpStreamStats` | Outbound RTP statistics |
| `RemoteInboundRtpStreamStats` | Remote inbound RTP statistics |
| `SdpData` | SDP negotiation data |
| `IceCandidate` | ICE candidate information |
| `TurnServer` | TURN server used |
| `StunServer` | STUN server used |

</details>

---

### 🎯 Dispositions

**Source:** `src/SipProviderTypes.ts` — `Dispositions` enum

<details>
<summary><strong>Dispositions Enum</strong></summary>

**Actively assigned dispositions:**

| Value | Description |
|---|---|
| `NormalCallClearing` | Call ended normally |
| `BusyHere` | Remote was busy |
| `CallRejected` | Call was explicitly rejected |
| `NoAnswer` | No answer within timeout |
| `Cancelled` | Caller cancelled before answer |
| `Missed` | Inbound call missed |
| `BlindTransfer` | Session was blind-transferred away |
| `BlindTransferTo` | Session received as blind transfer target |
| `AttendedTransfer` | Session was attended-transferred away |
| `AttendedTransferTo` | Session received as attended transfer target |
| `AttendedTransferFailed` | Attended transfer failed (source leg) |
| `AttendedTransferToFailed` | Attended transfer failed (target leg) |
| `ConferenceCall` | Session was part of a conference |
| `ConferenceCallRejected` | Conference leg was rejected |
| `AnsweredElsewhere` | Call answered on another device |
| `DeclinedDoNotDisturb` | Declined due to DND |
| `DeclinedCallWaiting` | Declined due to call waiting disabled |
| `CallFailed` | Call failed |
| `CallFailedToAnswer` | Call failed before answer |

</details>

---

### 🔁 Transfers

**Source:** `src/SipProvider.ts`

<details>
<summary><strong>Blind Transfer</strong></summary>

```typescript
/**
 * @param {BuddyObject} currentBuddy
 * @param {SessionObject} session - The active session to transfer
 * @param {BuddyObject} buddy - The transfer target buddy
 * @param {ContactObject} contact - The transfer target contact
 * @returns {Promise<SipProviderResponse>}
 */
BlindTransfer(currentBuddy: BuddyObject, session: SessionObject, buddy: BuddyObject, contact: ContactObject): Promise<SipProviderResponse>
```

</details>

<details>
<summary><strong>Attended Transfer</strong></summary>

```typescript
/**
 * @param {BuddyObject} currentBuddy
 * @param {SessionObject} session - The original session
 * @param {BuddyObject} buddy - Target buddy
 * @param {ContactObject} contact - Target contact
 * @param {SessionObject} targetSession - The new transfer leg session
 * @returns {Promise<SipProviderResponse>}
 */
AttendedTransfer(currentBuddy: BuddyObject, session: SessionObject, buddy: BuddyObject, contact: ContactObject, targetSession: SessionObject): Promise<SipProviderResponse>

CompleteTransfer(childSession: SessionObject): Promise<SipProviderResponse>
CancelAttendedTransfer(childSession: SessionObject): Promise<SipProviderResponse>
HangupAttendedTransfer(childSession: SessionObject): Promise<SipProviderResponse>
```

</details>

---

### 🤝 Conference

**Source:** `src/SipProvider.ts`

<details>
<summary><strong>Conference Flow (3-phase)</strong></summary>

```typescript
/**
 * Phase 1: Initiate conference call to a new participant.
 * @returns {Promise<{ Success: boolean, TargetSession: SessionObject, TargetContact: ContactObject }>}
 */
Conference(currentBuddy: BuddyObject, session: SessionObject, buddy: BuddyObject, contact: ContactObject): Promise<{ Success: boolean, TargetSession: SessionObject, TargetContact: ContactObject }>

/**
 * Phase 2: Join the conference (mix audio streams).
 */
JoinConference(parentSession: SessionObject): Promise<SipProviderResponse>

/**
 * Cancel the conference before joining.
 */
CancelConference(childSession: SessionObject): Promise<SipProviderResponse>

/**
 * Hang up the conference.
 */
HangupConference(childSession: SessionObject): Promise<SipProviderResponse>
```

**Session fields set during conference:**

| Field | Description |
|---|---|
| `session.ConferenceChildren[]` | Array of child session IDs |
| `session.ParentSessionId` | ID of the parent session (on child) |
| `session.Data.ConferenceCall` | `true` when in conference |
| `session.Data.ConferenceCallId` | Peer conference session ID |

Audio mixing uses the Web Audio API via `GetMediaStreamMix` callback.

</details>

---

### 🔔 SipProvider Callbacks (`SipProviderMethods`)

**Source:** `src/SipProviderTypes.ts` — `SipProviderMethods` interface

All callbacks the SIP provider calls on `window.phone`:

<details>
<summary><strong>Media Callbacks</strong></summary>

| Callback | Signature | Description |
|---|---|---|
| `GetUserMedia` | `(constraints) => Promise<MediaStream>` | Get microphone/camera access |
| `GetAudioSrcID` | `() => string` | Current audio input device ID |
| `GetAudioInputDevices` | `() => MediaDeviceInfo[]` | Enumerated audio inputs |
| `GetSupportedConstraints` | `() => MediaTrackSupportedConstraints` | Browser supported constraints |
| `GetVideoSrcID` | `() => string` | Current video input device ID |
| `GetVideoInputDevices` | `() => MediaDeviceInfo[]` | Enumerated video inputs |

</details>

<details>
<summary><strong>Call Lifecycle Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `IncomingCall` | Inbound INVITE received |
| `IncomingCallCompleted` | Inbound call processing complete |
| `Connecting` | Provider connecting |
| `OnTrying` | Outbound INVITE sent (100 Trying) |
| `OnProgress` | Provisional response received (180/183) |
| `OnAccept` | Call accepted (200 OK) |
| `OnAnswer` | Call answered |
| `CallConnected` | Media connected |
| `CallInviteRejected` | INVITE rejected |
| `CallCancelled` | Call cancelled |
| `SessionReceivedBye` | BYE received |
| `OnRingbackTimeout` | Ringback timeout expired |

</details>

<details>
<summary><strong>Session Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `AddSession` | Add session to global state |
| `UpdateSession` | Update session in global state |
| `PhoneUpdateSession` | Phone-level session update |
| `GetBuddySession` | Get active session for buddy |
| `UpdateCallStatus` | Update call status string |
| `UpdateCallState` | Update call state string |
| `AddCallActivity` | Add activity event to session |
| `UID` | Generate UUID |

</details>

<details>
<summary><strong>Audio/Stats Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `OnTrackAdded` | Remote audio/video track received |
| `OnPresentVideo` | Video presentation started |
| `OnStopPresentingVideo` | Video presentation stopped |
| `UpdateSenderAudioLevel` | Local audio level update |
| `UpdateReceiverAudioLevel` | Remote audio level update |
| `OnIsTalking` | Voice activity detection |
| `UpdateRemoteInboundRtpStreamStats` | Remote RTP stats |
| `UpdateSenderStats` | Sender RTP stats |
| `UpdateReceiverStats` | Receiver RTP stats |
| `OnReceiveDtmf` | DTMF digit received |

</details>

<details>
<summary><strong>UI / Status Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `UpdateUI` | Trigger UI re-render |
| `UpdateProviderStatus` | Update provider status display |
| `UpdateProfileStatus` | Update profile/presence status |
| `PostMessage` | Send PostMessage to host window |

</details>

<details>
<summary><strong>Transfer / Conference Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `MakeAttendedCall` | Create attended transfer leg |
| `OnBlindTransferCompleted` | Blind transfer completed |
| `OnConferenceTrying` | Conference leg trying |
| `OnConferenceAccept` | Conference leg accepted |
| `OnConferenceProgress` | Conference leg in progress |
| `OnConferenceReject` | Conference leg rejected |
| `GetMediaStreamMix` | Get Web Audio mixed stream for conference |
| `Conference` | Initiate conference |
| `CancelConference` | Cancel conference |
| `HangupConference` | Hang up conference |
| `JoinConference` | Join conference |

</details>

<details>
<summary><strong>Messaging Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `OnMessage` | Message received |
| `OnMessageFailed` | Message delivery failed |
| `OnMessageDelivered` | Message delivered |
| `OnMessageRead` | Message read |

</details>

<details>
<summary><strong>Registration / Transport Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `OnRegistered` | Registration successful |
| `OnRegistrationAccepted` | Registration accepted |
| `OnRegistrationSuccessful` | Registration confirmed |
| `OnRegistrationFailed` | Registration failed |
| `OnTransportConnected` | WebSocket transport connected |
| `OnTransportDisconnected` | WebSocket transport disconnected |
| `OnReconnectTransport` | Reconnect transport |
| `OnTransportReconnectFailing` | Transport reconnect failing |
| `CheckConnection` | Check connection status |
| `CaptureCalls` | Capture pending calls |
| `CallReconnect` | Reconnect after network change |

</details>

<details>
<summary><strong>Logging Callbacks</strong></summary>

| Callback | Description |
|---|---|
| `LogEvent` | Log a call event |
| `LogTransportEvent` | Log a transport event |

</details>

---

### 🎙️ SipProvider Recordings

**Source:** `src/SipProvider.ts`

<details>
<summary><strong>Recording API</strong></summary>

```typescript
/**
 * Starts recording the session.
 * @param {SessionObject} session
 * @returns {Promise<SipProviderResponse>}
 */
StartRecording(session: SessionObject): Promise<SipProviderResponse>

/**
 * Stops recording the session.
 * @param {SessionObject} session
 * @returns {Promise<SipProviderResponse>}
 */
StopRecording(session: SessionObject): Promise<SipProviderResponse>
```

**`RecordingObject` structure:**

| Field | Type | Description |
|---|---|---|
| `Id` | `string` | Recording identifier |
| `Blob` | `Blob` | Recording audio/video data |
| `Meta` | `RecordingMeta` | Recording metadata |

**`RecordingMeta` structure:**

| Field | Type | Description |
|---|---|---|
| `Size` | `number` | File size in bytes |
| `MimeType` | `string` | MIME type (e.g. `"video/webm"`) |
| `StartTime` | `string` | ISO timestamp of recording start |
| `StopTime` | `string` | ISO timestamp of recording stop |
| `WithVideo` | `boolean` | Whether recording includes video |

Video recording composites remote + local onto a canvas. Local video is shown as a PiP overlay.

</details>

---

### 📨 SipProvider Events

**Source:** `src/SipProviderTypes.ts`

<details>
<summary><strong>SipProviderPostMessage Enum (~50 constants)</strong></summary>

Used for UI event communication (PostMessage from SipProvider to host):

Key events include: `OnRegistered`, `OnRegistrationFailed`, `OnTransportConnected`, `OnTransportDisconnected`, `OnIncomingCall`, `OnTrying`, `OnProgress`, `OnCallAnswered`, `OnAccept`, `OnCallConnected`, `OnBye`, `OnByeSent`, `OnHangup`, `OnSessionStateChange`, `OnHold`, `OnUnhold`, `OnMute`, `OnUnmute`, `OnDtmf`, `OnBlindTransfer`, `OnAttendedTransfer`, `OnConference`, `OnConferenceJoined`, `OnConferenceHangup`, `OnPresentVideo`, `OnStopPresentingVideo`, and more.

</details>

<details>
<summary><strong>SipProviderMobileEvents Enum (~80 constants)</strong></summary>

Used for React Native WebView bridge events. A superset of `SipProviderPostMessage` with additional mobile-specific events for push notifications, background handling, and native UI integration.

</details>

---

### 🎥 Video Configuration

<details>
<summary><strong>Required Callbacks for Video</strong></summary>

| Callback | Required | Description |
|---|---|---|
| `GetUserMedia` | Yes | Camera/mic access |
| `GetVideoSrcID` | Yes | Current camera device ID |
| `GetVideoInputDevices` | Optional | Enumerate cameras |
| `OnTrackAdded` | Optional | Handle incoming video track |
| `OnPresentVideo` | Optional | Video presentation started |
| `OnStopPresentingVideo` | Optional | Video presentation stopped |

**Video settings (in `SipProviderSettings`):**

| Setting | Description |
|---|---|
| `MaxFrameRate` | Max video frame rate constraint |
| `MaxHeight` | Max video height constraint |
| `MaxAspectRatio` | Max video aspect ratio constraint |

</details>

---

## 🎙️ Browser-Phone-MediaManager

Source: `src/Media-Manager.ts`, `src/Media-Manager-Core-Web.ts`, `src/AudioContext.ts`

<details>
<summary><strong>📘 Overview</strong></summary>

The `Media-Manager` is the public-facing façade layer. It initialises with a platform core (Web or Mobile) and exposes a unified `window.phone.*` API for media operations.

```javascript
await window.phone.InitMediaManager(phone.MediaManagerCore.Web);
// or
await window.phone.InitMediaManager(phone.MediaManagerCore.Mobile);
```

`InitMediaManager(core)` calls `core.Init()` internally and wires all `phone.*` functions to delegate to the core. It stores the active core at `window.phone.MediaManager`.

</details>

---

### 🔧 MediaManager Public API

<details>
<summary><strong>All Public Functions</strong></summary>

All functions are async (return `Promise`) unless noted.

| Function | Parameters | Returns | Notes |
|---|---|---|---|
| `phone.InitMediaManager(core)` | `core`: MediaManagerCore | `Promise<void>` | Must be called first |
| `phone.PlayAudio(url)` | `url`: string | `Promise<void>` | Plays audio on configured speaker |
| `phone.StartRingback(sessionId)` | `sessionId`: string | `Promise<void>` | Outgoing call ringback tone |
| `phone.StopRingback()` | — | `Promise<void>` | Stops ringback |
| `phone.StartRingtone(sessionId)` | `sessionId`: string | `Promise<void>` | No-op if `phone.Settings.EnableRingtone === false` |
| `phone.StopRingtone()` | — | `Promise<void>` | Stops ringtone |
| `phone.GetDeviceLabel(deviceId)` | `deviceId`: string | `string \| null` | **Synchronous** |
| `phone.OnTrackAdded(session, stream)` | `session`, `stream`: MediaStream | `Promise<void>` | Remote audio track received |
| `phone.OnDeviceChange(kind, label, session)` | `kind`: `"audioinput" \| "audiooutput"`, `label`: string, `session` | `Promise<void>` | Sets `session.AudioOutputDevice` or `session.AudioInputDevice` |
| `phone.SetSpeakerDevice(session, deviceId)` | `session`, `deviceId`: string | `Promise<void>` | Switch speaker for active session |
| `phone.SetMicrophoneDevice(session, deviceId)` | `session`, `deviceId`: string | `Promise<void>` | Switch microphone for active session |
| `phone.PlayBeep(session)` | `session` | `Promise<void>` | Call-waiting beep |
| `phone.DetectDevices()` | — | `Promise<void>` | Re-enumerates available devices |
| `phone.RecordSession(session)` | `session` | `Promise<void>` | Starts recording |
| `phone.StopRecordingSession(session)` | `session` | `Promise<void>` | Stops and finalises recording |
| `phone.UpdateRecordingSession(session)` | `session` | `Promise<void>` | Updates recording stream after presentation change |
| `phone.UpgradeSessionToAudioContext(session)` | `session` | `Promise<MediaStream>` | Upgrades to Web Audio mixing graph; returns mixed stream |
| `phone.AddStreamToAudioContext(session, stream)` | `session`, `stream`: MediaStream | `Promise<void>` | Adds external stream to audio mix |
| `phone.AddAudioFileToAudioContext(session)` | `session` | `Promise<void>` | Injects preloaded audio file into mix |

> Note: `phone.AddInputTrackToAudioContext`, `phone.TestAudioContextMixer`, and `phone.CreateAudioContextTestPlayer` exist on the façade but have no Web core implementation and silently resolve.

</details>

---

### 🌐 Global Properties

<details>
<summary><strong>Properties Set After InitMediaManager()</strong></summary>

| Property | Type | Description |
|---|---|---|
| `phone.HasAudioDevice` | `boolean` | Whether an audio input device is available |
| `phone.HasVideoDevice` | `boolean` | Whether a video input device is available |
| `phone.HasOutputDevice` | `boolean` | Whether an audio output device is available |
| `phone.MyAudioinputDevices` | `Array<{deviceId, label}>` | List of microphone devices |
| `phone.MyVideoinputDevices` | `Array<{deviceId, label}>` | List of camera devices |
| `phone.MySpeakerDevices` | `Array<{deviceId, label}>` | List of speaker/output devices |
| `phone.SupportedConstraints` | `Object` | Browser's supported `MediaTrackConstraints` |
| `phone.AudioBlobs` | `Object` | Preloaded audio files |
| `phone.MediaManager` | `Object` | Reference to the active Media Manager instance |

</details>

---

### ⚙️ MediaManager Settings

<details>
<summary><strong>All Settings (window.phone.Settings)</strong></summary>

Set before calling `InitMediaManager()`.

**Device Settings**

| Setting | Type | Default | Description |
|---|---|---|---|
| `AudioOutputId` | string | `"default"` | Speaker device ID (or label) |
| `AudioSrcId` | string | `"default"` | Microphone device ID |
| `VideoInputDevice` | string | `"default"` | Camera device ID |
| `AudioOutputDevice` | string | — | Output device label for `OnTrackAdded` routing via `setSinkId` |

**Audio Constraints** (applied when `SetMicrophoneDevice` re-captures via `getUserMedia`)

| Setting | Type | Default | Description |
|---|---|---|---|
| `AutoGainControl` | boolean | — | Enables automatic gain control |
| `EchoCancellation` | boolean | — | Enables echo cancellation |
| `NoiseSuppression` | boolean | — | Enables noise suppression |

**Ringtone**

| Setting | Type | Default | Description |
|---|---|---|---|
| `EnableRingtone` | boolean | `true` | Set to `false` to suppress `phone.StartRingtone()` entirely |

**Media File Location**

| Setting | Type | Default | Description |
|---|---|---|---|
| `MediaLocation` | string | `"./media/"` | Custom path prefix for all preloaded audio files. Must end with `/`. |

**Recording**

| Setting | Type | Default | Description |
|---|---|---|---|
| `RecordingVideoFps` | number | `12` | Frame rate for canvas capture |
| `RecordingVideoSize` | string | `"HD"` | Canvas resolution preset: `"SD"`, `"HD"`, `"FHD"` |
| `RecordingLayout` | string | `"them-pnp"` | How local and remote video are composed |
| `RecordOnlyAudioInVideoCall` | boolean | — | Force audio-only recording for video calls |

**Recording Layout Options:**

| Value | Description |
|---|---|
| `"them-pnp"` (default) | Remote video full-frame; local video as small PiP at top-left |
| `"side-by-side"` | Canvas double-width; local left, remote right, 5px gap |
| `"them-only"` | Remote video only; no local PiP |
| `"us-only"` | Not implemented; behaves like `"them-only"` |

**Video Size Presets:**

| Value | Resolution | PiP size (them-pnp) |
|---|---|---|
| `"SD"` | 640×360 | ~100px |
| `"HD"` (default) | 1280×720 | ~144px |
| `"FHD"` | 1920×1080 | ~240px |

</details>

---

### 🎵 Web Core — Preloaded Audio

**Source:** `src/Media-Manager-Core-Web.ts`

<details>
<summary><strong>Preloaded Audio Files (phone.AudioBlobs)</strong></summary>

The Web core preloads these audio files during `Init()`:

`Alert`, `Ringtone`, `speech_orig`, `Busy_UK`, `Busy_US`, `CallWaiting`, `Congestion_UK`, `Congestion_US`, `EarlyMedia_Australia`, `EarlyMedia_European`, `EarlyMedia_Japan`, `EarlyMedia_UK`, `EarlyMedia_US`

Files are loaded from `phone.Settings.MediaLocation` (default `"./media/"`), except `Alert.mp3` which also tries `"./lib/media/"`.

The Web core polls `DetectDevices()` every 1 second during `Init()`.

</details>

<details>
<summary><strong>Recording Session Properties</strong></summary>

Properties set on `session.Data` during recording:

| Property | Description |
|---|---|
| `session.Data.MediaRecorder` | The `MediaRecorder` instance |
| `session.Data.RecordingCanvas` | Canvas element for video compositing |
| `session.Data.RecordingLocalVideoEl` | Local video `<video>` element |
| `session.Data.RecordingRemoteVideoEl` | Remote video `<video>` element |
| `session.Data.RecordingAudioStreams` | Array of audio streams being mixed |
| `session.Data.RecordingAudioContext` | `AudioContext` for recording mix |
| `session.Data.RecordingAudioDestination` | `MediaStreamAudioDestinationNode` |

```typescript
/**
 * Taps a live audio stream into the recording audio graph.
 * @param {SessionObject} session
 * @param {MediaStream} stream
 */
AddRecordingAudioSource(session: SessionObject, stream: MediaStream): void
```

</details>

---

### 🔊 AudioContext Mixing

**Source:** `src/AudioContext.ts`

<details>
<summary><strong>Web Audio Mixing Graph</strong></summary>

**Graph structure:**
```
Local Mic → gainNode → masterGain → destination → MediaStream
```

**Graph object shape:**
```typescript
{
  id: string,
  inputs: {
    [inputId: string]: {
      id: string,
      type: string,
      stream: MediaStream,
      source: MediaStreamAudioSourceNode,
      gain: GainNode
    }
  },
  masterGain: GainNode,
  destination: MediaStreamAudioDestinationNode
}
```

**Session properties set after `UpgradeSessionToAudioContext`:**

| Property | Description |
|---|---|
| `session.ConferenceAudioContext` | The `AudioContext` instance |
| `session.ConferenceAudioContextGraph` | The mixing graph object |
| `session.ConferenceOriginalSenderStream` | Original sender stream before upgrade |
| `session.ConferenceMixedOutputStream` | The mixed output `MediaStream` |

```typescript
/**
 * Upgrades outbound audio to a Web Audio mixing graph.
 * @param {SessionObject} session
 * @returns {Promise<MediaStream>} The mixed output stream
 */
window.phone.UpgradeSessionToAudioContext(session: SessionObject): Promise<MediaStream>

/**
 * Adds an external stream to the session's audio mix.
 * @param {SessionObject} session
 * @param {MediaStream} stream
 * @returns {Promise<void>}
 */
window.phone.AddStreamToAudioContext(session: SessionObject, stream: MediaStream): Promise<void>

/**
 * Injects a preloaded audio file into the mix.
 * @param {SessionObject} session
 * @returns {Promise<void>}
 */
window.phone.AddAudioFileToAudioContext(session: SessionObject): Promise<void>

/**
 * Returns the mixed output stream.
 * @param {SessionObject} session
 * @returns {MediaStream}
 */
GetMixedOutputStream(session: SessionObject): MediaStream

/**
 * Creates a test audio player for the audio context.
 * @param {SessionObject} session
 */
CreateTestAudioContextPlayer(session: SessionObject): void
```

</details>

---

### 🔌 Core Interface Contract

<details>
<summary><strong>Required Core Methods</strong></summary>

A core must implement (all should return `Promise`):

| Method | Required |
|---|---|
| `Init()` | Yes |
| `GetAudioDevices()` | Yes |
| `GetVideoDevices()` | Yes |
| `DetectDevices()` | Yes |
| `PlayAudio(url)` | Yes |
| `PlayBeep(session)` | Yes |
| `StartRingback(sessionId)` | Yes |
| `StopRingback()` | Yes |
| `StartRingtone(sessionId)` | Yes |
| `StopRingtone()` | Yes |
| `OnTrackAdded(session, stream)` | Yes |
| `OnDeviceChange(kind, label, session)` | Yes |
| `SetSpeakerDevice(session, deviceId)` | Yes |
| `SetMicrophoneDevice(session, deviceId)` | Yes |
| `RecordSession(session)` | Yes |
| `StopRecordingSession(session)` | Yes |
| `UpdateRecordingSession(session)` | Optional |
| `UpgradeSessionToAudioContext(session)` | Optional |
| `AddStreamToAudioContext(session, stream)` | Optional |
| `AddAudioFileToAudioContext(session)` | Optional |
| `GetDeviceLabel(deviceId)` | Optional |

</details>

---

## 🖥️ Browser-Phone-UI

Source: `docs/BUDDIES.md`, `docs/CONFERENCE.md`, `docs/CallStatus.md`, `docs/DispositionData.md`, `docs/EventsData.md`, `docs/textMessages.md`

---

### 👥 Buddy Shape (`window.phone.MyBuddies`)

<details>
<summary><strong>BuddyObject Fields (UI Perspective)</strong></summary>

| Field | Type | Description |
|---|---|---|
| `Id` | `string` | Unique buddy identifier |
| `DisplayName` | `string` | Display name shown in UI |
| `DisplayNumber` | `string` | Number/address shown in UI |
| `Provider` | `string` | Provider TypeStr |
| `Sessions` | `SessionObject[]` | Active sessions |
| `MessageStreamObjects` | `MessageStreamItem[]` | Message history |
| `LastActivity` | `string` | ISO timestamp of last activity |
| `AutoDelete` | `boolean` | Soft-delete flag |
| `EnableDuringDnd` | `boolean` | Allow calls through DND |

</details>

<details>
<summary><strong>SessionObject Fields (UI Perspective)</strong></summary>

| Field | Type | Description |
|---|---|---|
| `Id` | `string` | Session identifier |
| `DisplayName` | `string` | Remote party display name |
| `DisplayNumber` | `string` | Remote party number |
| `View` | `CallView` | `"basic"` or `"extended"` |
| `Provider` | `string \| { Type: string }` | Provider for this session |
| `Direction` | `string` | `"inbound"` or `"outbound"` |
| `State` | `string` | `CallState` value |
| `Status` | `string` | `CallStatus` value |
| `ExtendedTile` | `boolean` | Whether extended tile is shown |
| `Timer` | `number` | Call duration (seconds) |
| `AudioInputDevice` | `string` | Current audio input device |
| `AudioOutputDevice` | `string` | Current audio output device |
| `WithVideo` | `boolean` | Whether session includes video |
| `VideoInputDevice` | `string` | Current video input device |
| `Activity` | `ActivityItem[]` | Session event log |
| `isOnHold` | `boolean` | Hold state |
| `IsVideoMuted` | `boolean` | Video mute state |
| `IsTalking` | `boolean` | Voice activity (receiver) |
| `IsSenderTalking` | `boolean` | Voice activity (sender) |
| `Presenting` | `string \| null` | Current presentation mode |

**Media streams:**

| Field | Description |
|---|---|
| `RtpSenderAudioMediaStream` | Local outbound audio stream |
| `RtpSenderVideoMediaStream` | Local outbound video stream |
| `RtpSenderLevel` | Local audio level (0-1) |
| `RtpSenderStats` | Local RTP stats |
| `RtpReceiverAudioMediaStream` | Remote inbound audio stream |
| `RtpReceiverVideMediaStreams` | Remote inbound video streams (note: `RtpReceiverVid`**`e`**`MediaStreams` — missing 'o') |
| `RtpReceiverLevel` | Remote audio level (0-1) |
| `RtpReceiverStats` | Remote RTP stats |

**Child call fields:**

| Field | Description |
|---|---|
| `ConferenceCall` | Child conference session ID |
| `ConferenceCallJoined` | Whether conference has been joined |
| `AttendedTransferCall` | Child attended transfer session ID |
| `AttendedTransferCallSource` | Source session for attended transfer |

</details>

---

### 🤝 Conference (UI)

<details>
<summary><strong>Conference UI Callbacks & Settings</strong></summary>

**Required setting:**
```javascript
phone.Settings.EnableCallConferenceCall = true;
```

**Required UI callbacks:**

```typescript
phone.OnStartConference(session: SessionObject): void
phone.OnConference(currentBuddy: BuddyObject, session: SessionObject, buddy: BuddyObject, contact: ContactObject): void
phone.OnJoinConference(childSession: SessionObject): void
phone.OnCancelConference(childSession: SessionObject): void
phone.OnHangupConference(childSession: SessionObject): void
```

**UI helper functions:**

```typescript
phone.OpenConferenceWindow(session: SessionObject, currentBuddy: BuddyObject): void
phone.GetSessionById(ID: string): SessionObject | null
```

**Session properties set by UI:**

| Property | Description |
|---|---|
| `parentSession.ConferenceCall` | Child session ID |
| `childSession.ParentSession` | Parent session ID |
| `childSession.ConferenceCallJoined` | `boolean` — whether joined |

**HTML templates used:** `#instant_conference`, `#conference_select_buddy`, `#child_call`

</details>

---

### 💬 Text Messages (UI)

<details>
<summary><strong>MessageStreamItem (UI Renderer)</strong></summary>

**Minimum required fields:**

| Field | Type | Description |
|---|---|---|
| `Type` | `string` | Must be `"MSG"` for text messages |
| `Body` | `string` | Message text content |
| `Date` | `string` | ISO timestamp |
| `Direction` | `string` | `"inbound"` or `"outbound"` |

**Delivery status display:**

| DeliveryStatus value | Display | Meaning |
|---|---|---|
| `1` | One tick | Sent |
| `2` | Two ticks | Delivered |
| `3` | Two blue ticks | Read |
| `4` | Failed icon | Failed |

> Note: Single emoji in `Body` renders larger in the UI.

**Send handler:**

```typescript
phone.OnSendTextMessage = async function(buddy: BuddyObject, message: string): Promise<void>
```

</details>

---

### 📋 Call Status (UI Reference)

<details>
<summary><strong>Typical Call Flows (UI Perspective)</strong></summary>

**Outbound call:**

```
OnAudioCall() → State: Establishing, Status: StartingAudioCall
  → OnTrying      → Status: Trying
  → OnProgress    → Status: Ringing
  → OnAccept      → State: Established, Status: CallInProgress
  → OnCallConnected → media flowing
  → OnHangup      → State: Terminated, Status: Ended
```

**Inbound call:**

```
OnIncomingCall() → State: Establishing, Status: Incoming
  → OnAnswer      → Status: Answering
  → OnAccept      → State: Established, Status: CallInProgress
  → OnCallConnected → media flowing
  → OnBye         → State: Terminated, Status: Ended
```

> Note: `CallState.Inital` typo is preserved in source. Display strings are the Core's responsibility, not the UI's.

</details>

---

### 📊 Session Events & Activities (UI)

<details>
<summary><strong>AddSessionEvent Payloads</strong></summary>

Events posted by `WebSipCore.ts` and `Browser-Phone-SipProvider.ts` via `AddSessionEvent`:

Key event types and their origin contexts:

| Event Type | Origin | Description |
|---|---|---|
| `OnCallAnswered` | `SipProvider.ts` | Call answered (only once per session) |
| `OnCallConnected` | `WebSipCore.ts` | Media connected |
| `OnHold` | `Browser-Phone-SipProvider.ts` | Call placed on hold |
| `OnUnhold` | `Browser-Phone-SipProvider.ts` | Call resumed from hold |
| `OnMute` | `Browser-Phone-SipProvider.ts` | Microphone muted |
| `OnUnmute` | `Browser-Phone-SipProvider.ts` | Microphone unmuted |
| `ConferenceOwner` | `SipProvider.ts` | Session is conference owner |
| `ConferenceParticipant` | `SipProvider.ts` | Session is conference participant |
| `Transferee` | `UserAgentManager.ts` | Session is attended transfer transferee |
| `Target` | `UserAgentManager.ts` | Session is attended transfer target |

</details>

<details>
<summary><strong>AddCallActivity Payloads</strong></summary>

Activities posted via `AddCallActivity` from `SipProvider.ts`, `UserAgentManager.ts`, `Browser-Phone-SipProvider.ts`:

Key activity types:

| Activity Type | Context |
|---|---|
| `"Outgoing call"` | Outbound call initiated |
| `"Incoming call"` | Inbound call received |
| `"Call answered"` | Call was answered |
| `"Call ended"` | Call ended |
| `"Call on hold"` | Call placed on hold |
| `"Call resumed"` | Call taken off hold |
| `"Call transferred"` | Blind transfer completed |
| `"Conference started"` | Conference initiated |
| `"Conference joined"` | Conference joined |

</details>

---

## 🗂️ Data Structures

Source: `src/Browser-Phone-Core-Types.ts`, `src/SipProviderTypes.ts`

<details>
<summary><strong>ContactObject</strong></summary>

```typescript
interface ContactObject {
  Number: string;       // Phone number or SIP URI
  Provider?: string;    // Provider TypeStr (e.g. "sip")
  Name?: string;        // Display name
  [key: string]: any;
}
```

</details>

<details>
<summary><strong>BuddyObject</strong></summary>

```typescript
interface BuddyObject {
  Id: string;
  DisplayName: string;
  DisplayNumber: string;
  Provider: string;
  Sessions: SessionObject[];
  MessageStreamObjects: MessageStreamItem[];
  LastActivity: string;       // ISO timestamp
  AutoDelete?: boolean;       // Soft-delete flag
  EnableDuringDnd?: boolean;  // Allow calls through DND
  [key: string]: any;
}
```

</details>

<details>
<summary><strong>SessionObject</strong></summary>

```typescript
interface SessionObject {
  Id: string;
  BuddyId?: string;
  DisplayName?: string;
  DisplayNumber?: string;
  Provider: string | { Type: string };
  Direction: "inbound" | "outbound";
  State: string;                  // CallState value
  Status?: string;                // CallStatus value
  WithVideo?: boolean;
  IsVideoMuted?: boolean;
  isOnHold?: boolean;
  IsTalking?: boolean;
  IsSenderTalking?: boolean;
  Presenting?: "Blank" | "Picture" | "Webcam" | "Screen" | "Video" | "Whiteboard" | null;
  Timer?: number;
  Activity?: ActivityItem[];
  View?: "basic" | "extended";
  ExtendedTile?: boolean;

  // Media streams
  RTPSession?: any;               // SIP.js Session object
  RtpSenderAudioMediaStream?: MediaStream;
  RtpSenderVideoMediaStream?: MediaStream;
  RtpReceiverAudioMediaStream?: MediaStream;
  RtpReceiverVideoMediaStream?: MediaStream;
  RtpReceiverVideoMediaStreams?: MediaStream[];
  RtpSenderVideoMediaStreams?: MediaStream[];
  OriginalRtpSenderVideoMediaStream?: MediaStream;
  OriginalRtpSenderAudioMediaStream?: MediaStream;

  // Conference
  ConferenceChildren?: string[];
  ParentSessionId?: string;
  ConferenceCall?: string;
  ConferenceCallJoined?: boolean;

  // Transfer
  AttendedTransferCall?: string;
  AttendedTransferCallSource?: string;
  ParentSession?: string;

  // Recording
  isRecording?: boolean;
  RecordingMediaStream?: MediaStream;

  // Conference audio context
  ConferenceAudioContext?: AudioContext;
  ConferenceAudioContextGraph?: object;
  ConferenceOriginalSenderStream?: MediaStream;
  ConferenceMixedOutputStream?: MediaStream;

  // Data bag
  Data?: {
    Direction?: string;
    WithVideo?: boolean;
    CallState?: string;
    CallStatus?: string;
    Disposition?: string;
    ReasonCode?: string;
    ReasonText?: string;
    TerminatedBy?: string;
    StartTime?: string;
    EndTime?: string;
    Duration?: number;
    Events?: SessionEvent[];
    // Recording
    MediaRecorder?: MediaRecorder;
    RecordingCanvas?: HTMLCanvasElement;
    RecordingLocalVideoEl?: HTMLVideoElement;
    RecordingRemoteVideoEl?: HTMLVideoElement;
    RecordingAudioStreams?: MediaStream[];
    RecordingAudioContext?: AudioContext;
    RecordingAudioDestination?: MediaStreamAudioDestinationNode;
    [key: string]: any;
  };

  [key: string]: any;
}
```

</details>

<details>
<summary><strong>MessageStreamItem</strong></summary>

```typescript
interface MessageStreamItem {
  Id: string;
  Type: "MSG" | "CDR" | "SYSTEM";    // MessageType enum
  Direction: "inbound" | "outbound"; // Direction enum
  Body: string;
  Date: string;                       // ISO timestamp
  Status?: MessageDeliveryStatus;
  MessageProtocol?: string;
  ProviderData?: {
    Description?: string;
    [key: string]: any;
  };
  // CDR-specific fields (when Type === "CDR")
  SessionId?: string;
  // Note: CDRMessageItem has misspelled field TermindatedBy (not TerminatedBy)
  [key: string]: any;
}

type MessageDeliveryStatus =
  | "QUEUED"
  | "SENT_PENDING"
  | "SENT_CONFIRMED"
  | "DELIVERED"
  | "READ"
  | "FAILED";
```

</details>

<details>
<summary><strong>RecordingObject</strong></summary>

```typescript
interface RecordingObject {
  Id: string;
  Blob: Blob;
  Meta: RecordingMeta;
}

interface RecordingMeta {
  Size: number;
  MimeType: string;
  StartTime: string;   // ISO timestamp
  StopTime: string;    // ISO timestamp
  WithVideo: boolean;
}
```

</details>

<details>
<summary><strong>SessionEvent / ActivityItem</strong></summary>

```typescript
interface SessionEvent {
  TimeStamp: string;   // ISO timestamp
  Type: string;        // Event type string
  [key: string]: any;
}

interface ActivityItem {
  TimeStamp: string;
  Type: string;
  [key: string]: any;
}
```

</details>

<details>
<summary><strong>PhoneEvent</strong></summary>

```typescript
interface PhoneEvent {
  Type: string;   // One of window.phone.EventTypes values
  Data?: any;
  [key: string]: any;
}
```

</details>

<details>
<summary><strong>PhoneSettings</strong></summary>

```typescript
interface PhoneSettings {
  LoadFromStorage: (key: string) => string | null;
  SaveToStorage?: (key: string, value: string) => void;
  PROFILE_USER_ID: string;
  Providers?: any[];
  MaxBuddyAge?: number;        // Days; default 30
  RecordPresenting?: boolean;
  AvailableAvatar?: string[];
  Platform?: string;
  // ... all runtime keys listed in SipProvider Settings section
  [key: string]: any;
}
```

</details>

<details>
<summary><strong>Enumerations Summary</strong></summary>

**MessageType**

| Value | String |
|---|---|
| `MSG` | `"MSG"` |
| `CDR` | `"CDR"` |
| `SYSTEM` | `"SYSTEM"` |

**Direction**

| Value | String |
|---|---|
| `Inbound` | `"inbound"` |
| `Outbound` | `"outbound"` |

**CallState** (stored values)

| Value | Stored string | Note |
|---|---|---|
| `Initial` | `"Inital"` | Misspelled in source — intentional |
| `Inital` | `"Inital"` | Deprecated alias |
| `Establishing` | `"Establishing"` | |
| `Established` | `"Established"` | |
| `Terminated` | `"Terminated"` | |
| `Rejected` | `"Rejected"` | |
| `Disconnected` | `"Disconnected"` | |

**CallView**

| Value | String |
|---|---|
| `Basic` | `"basic"` |
| `Extended` | `"extended"` |

**MessageDeliveryStatus** (type alias)

`"QUEUED" | "SENT_PENDING" | "SENT_CONFIRMED" | "DELIVERED" | "READ" | "FAILED"`

</details>

---

## 📝 Known Quirks & Edge Cases

<details>
<summary><strong>Documented Bugs & Gotchas</strong></summary>

| Issue | Location | Detail |
|---|---|---|
| `CallState.Initial` is misspelled | `SipProviderTypes.ts` | Stored as `"Inital"` — intentional in source |
| CDR body duration always shows 0 seconds | `MessageStreamCallbacks.ts` | The human-readable `Body` field always shows 0s duration |
| `CDRMessageItem.TermindatedBy` is misspelled | `MessageStreamCallbacks.ts` | Field is `TermindatedBy`, not `TerminatedBy` |
| `AudioCall` vs `VideoCall` parameter order reversed | `SipProvider.ts` | `AudioCall(session, contact)` but `VideoCall(contact, session)` |
| `OnDecline` removal fires twice | `CoreCallbacks.ts` | Belt-and-braces: removal `setTimeout` runs inside and outside the `if` block |
| `OnCallConnected` strict boolean guard | `CallkitCallbacks.ts` | `typeof RecordAllCalls === "boolean"` — only exact `true` triggers auto-record |
| `OnUnmute` provider method is `UnMute` | `CoreCallbacks.ts` | Capital M — provider method is `UnMute`, not `Unmute` |
| `UpdateSession` skips Timer field | `SessionCallbacks.ts` | Intentional — avoids overwriting the running timer |
| `AddSessionEvent` dedup | `SessionCallbacks.ts` | Same `Activity` within 100ms is dropped; `OnCallAnswered` allowed only once |
| `RtpReceiverVideMediaStreams` spelling | `UI/BUDDIES.md` | Note the missing 'o': `RtpReceiverVid`**`e`**`MediaStreams` |
| `OnMessageReceived` hardcoded Provider | `MessagingCallbacks.ts` | Always sets `Provider: "sip"` regardless of actual provider |
| `UpgradeSessionToAudioContext` stubs on facade | `Media-Manager.ts` | `AddInputTrackToAudioContext`, `TestAudioContextMixer`, `CreateAudioContextTestPlayer` silently resolve |

</details>
