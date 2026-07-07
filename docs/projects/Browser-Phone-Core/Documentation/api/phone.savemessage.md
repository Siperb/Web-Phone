[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.SaveMessage() function

Save a message to the message stream.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.SaveMessage(key: string, data: MessageStreamItem): Promise<string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | <code>string</code> | The message id (store key). |
|  data | <code>MessageStreamItem</code> | The message object to save. |

<b>Returns:</b>

Promise&lt;string&gt;

The message key on success, or null when the indexedDB save failed and the message was held in the `SavedMessages` fallback.

## Remarks

Attempts to save to the `MessageStream` indexedDB store via `phone.IndexStorage.SaveToStore`; on success it also clears any prior `SavedMessages` entry for that id (via the internal `removeSavedMessage`) and returns the key. On failure it logs a warning and falls back to upserting the message into the deduped `SavedMessages` localStorage list, returning null.
