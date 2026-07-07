[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.LoadBuddyMessages() function

Load the messages for a buddy.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.LoadBuddyMessages(buddyID: string): Promise<MessageStreamItem[]>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddyID | <code>string</code> | The buddy id whose messages to load. |

<b>Returns:</b>

Promise&lt;MessageStreamItem[]&gt;

The buddy's message stream items.

## Remarks

Queries the `MessageStream` indexedDB store by the `BuddyId` index via `phone.IndexStorage.GetFromStoreByIndex` (defaulting to an empty list when nothing is found), then maps each stored record through `phone.BuildMessageStreamItem`, collecting the built items into the returned array.
