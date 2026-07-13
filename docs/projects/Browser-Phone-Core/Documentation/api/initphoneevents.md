[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## InitPhoneEvents() function

Initializes the phone events system: defines the `EventTypes` constant map and installs the `RaiseEvent` dispatch function onto `window.phone`. It is called automatically when the module loads and can be called again during initialization; it is idempotent.

Some members attached here are part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md). Members marked "(Phone API)" below carry an `@PhoneAPI` docstring tag in source.

<b>Signature:</b>

```typescript
export function InitPhoneEvents(): void
```

<b>Returns:</b>

void

## Remarks

The module also ensures `window.phone`, `window.phone.EventTypes`, and `window.phone.Webhooks` exist at load time, and calls `InitPhoneEvents()` once immediately so that `RaiseEvent` and `EventTypes` are always available.

### Runtime API attached to `window.phone`

|  Method | Signature | Description |
|  --- | --- | --- |
|  EventTypes | <code>phone.EventTypes: Record&lt;string, string&gt;</code> | Map of event-name constants (e.g. <code>OnMessage</code>, <code>OnBuddyAdded</code>, <code>OnSessionStarted</code>, <code>OnSessionEnded</code>, <code>OnSessionStateChange</code>, <code>OnBuddyMaintenanceCompleted</code>). Each value equals its key; use these constants when adding <code>window.addEventListener</code> handlers. (Phone API) |
|  [RaiseEvent](./phone.raiseevent.md) | <code>phone.RaiseEvent(message: PhoneEvent): void</code> | Central event dispatcher. Resolves the event name, invokes any matching webhook and/or property callback, dispatches a DOM <code>CustomEvent</code>, and forwards the event across frames via <code>postMessage</code>. (Phone API) |

Both `phone.EventTypes` and `phone.RaiseEvent` carry an `@PhoneAPI` docstring tag and are listed in [PHONE_API.md](../PHONE_API.md). `phone.EventTypes` is a data member, so its Phone-API documentation lives on this page rather than a standalone page; `phone.RaiseEvent` has its own page at [phone.raiseevent.md](./phone.raiseevent.md).

`RaiseEvent` resolves the event name from `message.Event` (falling back to `message.Activity`) and warns and returns if neither is present. It stamps `message.Timestamp` when missing, using `phone.TimeNow()` if available or an ISO string otherwise, and ensures `phone.Webhooks` exists.

It applies a dedup guard for `OnIncomingCall`: repeat events for the same `Data.SessionId` within 2 seconds are suppressed (tracked via `phone._lastOnIncomingCall`). It then invokes `phone.Webhooks[eventName]` if it is a function, and for `OnIncomingCall` also calls a `phone.OnIncomingCall` property callback if one is assigned (wrapped in try/catch).

For DOM delivery it dispatches a `CustomEvent(eventName, { detail })` on the current `window`, where `detail` is `message.Data` (or the whole message when there is no `Data`) so listeners receive the payload directly. It also re-dispatches that `CustomEvent` on `window.parent` (or `window.top`) when the phone runs inside an iframe/webview; cross-origin failures are ignored.

Finally it forwards the event via `postMessage`: a JSON-cloned copy of the full `message` is posted to the current `window.location.origin`, and, when embedded, another copy is posted to `window.parent` with targetOrigin `"*"`. Both `postMessage` calls are guarded against errors.
