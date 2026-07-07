[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.CompleteTransfer() function

Completes a pending attended transfer, connecting the original caller to the destination.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.CompleteTransfer(childSessionId: string): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  childSessionId | string | The child session ID returned by `AttendedTransfer`. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Looks up the child session via `phone.GetSession` and delegates to `phone.OnCompleteTransfer`. A missing child session is logged and ignored.

## Example

```typescript
phone.CompleteTransfer(childSessionId);
```
