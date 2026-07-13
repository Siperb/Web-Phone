[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetBuddyById() function

Get a buddy by id.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.GetBuddyById(buddyId: string): Promise<BuddyObject | null>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddyId | <code>string</code> | The buddy id to resolve. |

<b>Returns:</b>

Promise&lt;BuddyObject &#124; null&gt;

A promise resolving to the buddy with the given id, or null if not found.

## Remarks

Resolves first from the in-memory `phone.MyBuddies` list. On a miss, it falls back to loading the buddy from the `MyBuddies` store via `phone.IndexStorage.GetFromStore`. Resolves to null when neither source has the buddy.
