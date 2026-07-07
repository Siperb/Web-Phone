[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.CancelTransfer() function

Cancels a pending attended transfer and restores the original call.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.CancelTransfer(childSessionId: string): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  childSessionId | string | The child session ID returned by `AttendedTransfer`. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Looks up the child session via `phone.GetSession` and delegates to `phone.OnCancelAttendedTransfer`. A missing child session is logged and ignored.

## Example

```typescript
phone.CancelTransfer(childSessionId);
```
