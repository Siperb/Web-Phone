[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.UpdateMessage() function

Update one message by Id, accepting a full message object or a partial patch.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.UpdateMessage(message: Partial<MessageStreamItem> & { Id: string }): Promise<MessageStreamItem | null>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  message | <code>Partial&lt;MessageStreamItem&gt; &amp; { Id: string }</code> | A full message object or a partial patch; only <code>Id</code> is required and the supplied fields overlay the stored record. |

<b>Returns:</b>

Promise&lt;MessageStreamItem &#124; null&gt;

The merged/stored message, or null when <code>Id</code> is missing or the message could not be found.

## Remarks

The canonical update-one-message function. Reads the current record via `phone.LoadMessage` (which recovers from the `SavedMessages` fallback when needed), overlays the incoming (possibly partial) fields onto it, bumps the owning buddy's activity via `phone.UpdateBuddyLastActivity` from the merged record, and persists through `phone.SaveMessage` — so the update inherits the durable `SavedMessages` fallback. Errors are caught and logged via `phone.Log.error`. The deprecated `phone.SetMessageStreamItem` forwards here.
