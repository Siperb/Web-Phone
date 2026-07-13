[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.OnMessageSent() function

Marks a message as sent-pending and refreshes the UI.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.OnMessageSent(message: MessageStreamItem | string): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  message | <code>MessageStreamItem \| string</code> | The message stream item, or its Id, to update. |

<b>Returns:</b>

void

## Remarks

Delegates to the shared internal `updateDeliveryStatus` helper with status `SENT_PENDING`. That helper resolves a string Id to a full item via `phone.GetMessageStreamItem`, applies the status to the stored copy, syncs the matching in-memory `buddy.MessageStreamItems` entry (refreshing `buddy.LastInteraction` when it is the buddy's most recent item), persists via `phone.SetMessageStreamItem`, and refreshes the UI (`phone.UpdateBuddyList`, `phone.UpdateStage`). Errors are caught and logged via `phone.Log.error`.
