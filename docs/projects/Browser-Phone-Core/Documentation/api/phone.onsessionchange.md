[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.OnSessionChange() function

Registers a callback for session state changes.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.OnSessionChange(callback: (data: { sessionId: string; state: string; status: string; event: any }) => void): () => void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  callback | (data: { sessionId: string; state: string; status: string; event: any }) =&gt; void | Called with `{ sessionId, state, status, event }` on each change. `state` is the coarse `CallState` lifecycle value (Establishing \| Established \| Terminated \| Rejected \| Disconnected); `status` is the granular `CallStatus` value (Trying \| Ringing \| CallInProgress \| OnHold \| Ended \| Cancelled \| ...). |

<b>Returns:</b>

() =&gt; void

A function that removes the listener when called.

## Remarks

Adds a `window` listener for the `OnSessionStateChange` event. Because that event is dispatched by the host app and may omit `State`/`Status`, the handler falls back to the live session's current values (via `phone.GetSession`) so the callback always receives them.

## Example

```typescript
// Subscribe
const unsub = phone.OnSessionChange(({ sessionId, state, status }) => {
    console.log("Session", sessionId, "changed to", state, "(" + status + ")");
});

// Unsubscribe
unsub();
```
