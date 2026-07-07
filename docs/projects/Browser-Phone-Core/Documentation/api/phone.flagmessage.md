[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.FlagMessage() function

Flag a message.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.FlagMessage(messageId: string): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  messageId | <code>string</code> | The message id to flag. |

<b>Returns:</b>

Promise&lt;void&gt;

A promise that resolves when the message has been flagged.

## Remarks

Loads the item via `phone.GetMessageStreamItem`; logs an error and returns early when it is not found. Sets `Flagged = true` on the item, then locates the matching in-memory `buddy.MessageStreamItems` entry across `phone.MyBuddies` (matched by `BuddyId` and `Id`), sets its `Flagged` flag, and persists the change via `phone.SetMessageStreamItem`.
