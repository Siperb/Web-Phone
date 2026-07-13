[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.RaiseEvent() function

Central event dispatcher. Resolves the event name, invokes any matching webhook and/or property callback, dispatches a DOM `CustomEvent`, and forwards the event across frames via `postMessage`.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.RaiseEvent(message: PhoneEvent): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  message | [PhoneEvent](./phoneevent.md) | The event payload. Its <code>Event</code> (or fallback <code>Activity</code>) names the event; <code>Data</code> carries the detail delivered to listeners. |

<b>Returns:</b>

void

## Remarks

Resolves the event name from `message.Event`, falling back to `message.Activity`; if neither is present it warns via `phone.Log.warn` and returns. It stamps `message.Timestamp` when missing (using `phone.TimeNow()` if available, otherwise a new ISO string) and ensures `phone.Webhooks` exists.

It applies a dedup guard for `OnIncomingCall`: repeat events for the same `Data.SessionId` within 2 seconds are suppressed (tracked via `phone._lastOnIncomingCall`). It then invokes `phone.Webhooks[eventName]` when it is a function, and for `OnIncomingCall` also calls the `phone.OnIncomingCall` property callback if one is assigned (wrapped in try/catch).

For DOM delivery it dispatches `CustomEvent(eventName, { detail })` on the current `window`, where `detail` is `message.Data` (or the whole message when there is no `Data`). It re-dispatches that `CustomEvent` on `window.parent` (or `window.top`) when the phone runs inside an iframe/webview; cross-origin failures are ignored. Finally it forwards the event via `postMessage`: a JSON-cloned copy of the full `message` is posted to `window.location.origin`, and, when embedded, another copy is posted to `window.parent` with targetOrigin `"*"`. Both `postMessage` calls are guarded against errors.
