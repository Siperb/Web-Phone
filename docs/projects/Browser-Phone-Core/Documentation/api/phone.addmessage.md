[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.AddMessage() function

Add a message to the message stream.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.AddMessage(buddy: BuddyObject, message: MessageStreamItem): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddy | <code>BuddyObject</code> | The buddy object the message belongs to. |
|  message | <code>MessageStreamItem</code> | The message object to add. |

<b>Returns:</b>

Promise&lt;void&gt;

A promise that resolves when the message has been added and the buddy persisted.

## Remarks

Ensures `buddy.MessageStreamItems` exists, assigns the message an Id (falling back to `message.SessionId` then `phone.UID()`) and `BuddyId`, then pushes a built item from `phone.BuildMessageStreamItem` onto the buddy. The message is persisted via `phone.SaveMessage` (indexedDB first, `SavedMessages` fallback on failure). It updates `buddy.LastActivity` and refreshes `buddy.LastInteraction` with a rich preview (only for CDR/MSG items), refreshes the UI (`phone.UpdateBuddyList`, `phone.UpdateStage`), and persists a sanitized copy of the buddy (Sessions cleared, `Selected` false) via `phone.SaveBuddy`. Finally, when defined, `phone.OnMessageAdded(message)` is invoked. All steps are wrapped in try/catch with errors logged via `phone.Log`.
