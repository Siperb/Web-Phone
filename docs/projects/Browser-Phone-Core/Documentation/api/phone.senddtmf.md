[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.SendDtmf() method

Send DTMF to a session.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
SendDtmf(sessionId: string, dtmf: string): boolean;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  sessionId | string | The sessionId to send DTMF to. |
|  dtmf | string | The DTMF digits to send (e.g. <code>"1"</code>, <code>"1#"</code>, <code>"1*"</code>). |

<b>Returns:</b>

boolean

`true` when a provider was found and the DTMF send was dispatched; `false` when the session's provider could not be resolved. Also returns `undefined` when the session itself is not found.

## Remarks

This method is synchronous despite dispatching an asynchronous provider call. It resolves the session via `phone.GetSession` and its provider via `phone.GetProvider`, then fires `useProvider.SendDtmf(dtmf, session)` in a floating async IIFE (errors are logged, not thrown or awaited). It returns `true` immediately after dispatch rather than awaiting delivery.

## Example

```typescript
phone.SendDtmf(sessionId, "1");    // send DTMF "1"
phone.SendDtmf(sessionId, "1#");   // send DTMF "1#"
phone.SendDtmf(sessionId, "1*");   // send DTMF "1*"
```
