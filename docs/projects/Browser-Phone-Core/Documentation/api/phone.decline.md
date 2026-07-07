[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.Decline() function

Decline a call.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.Decline(sessionId: string): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  sessionId | string | The sessionId of the call to decline. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Looks up the session via `phone.GetSession`; if it exists, delegates to `phone.OnDecline`. Missing sessions are logged and ignored.

## Example

```typescript
phone.Decline(sessionId);
```
