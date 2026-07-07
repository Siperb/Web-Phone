[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.SaveBuddy() function

Save a buddy to the storage.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.SaveBuddy(key: string, data: BuddyObject): Promise<boolean>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | <code>string</code> | The buddy id (store key). |
|  data | <code>BuddyObject</code> | The buddy object to persist. |

<b>Returns:</b>

Promise&lt;boolean&gt;

A promise resolving to true on success, or false if persistence throws.

## Remarks

Persists the buddy to the `MyBuddies` store under `key` via `phone.IndexStorage.SaveToStore`. Before saving, the transient fields `MessageStreamItems`, `Sessions`, and `Selected` are stripped from a shallow copy, which is then deep-cloned. Errors are caught and logged (`phone.Log.warn`), and the method resolves to false rather than rejecting.
