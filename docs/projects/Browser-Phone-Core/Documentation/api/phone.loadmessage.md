[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.LoadMessage() method

Load a message from the message stream.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
LoadMessage(messageId: string): Promise<MessageStreamItem | null>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  messageId | <code>string</code> | The message id to load. |

<b>Returns:</b>

Promise&lt;MessageStreamItem &#124; null&gt;

The message object, or null when it cannot be found or recovered.

## Remarks

Reads the item from the `MessageStream` indexedDB store via `phone.IndexStorage.GetFromStore`. When it is missing (or the read throws), an internal `tryRecoverMessage` routine searches the `SavedMessages` localStorage fallback; a match found there is re-saved into indexedDB via `phone.IndexStorage.SaveToStore` before being returned. Returns null when neither store yields the message.
