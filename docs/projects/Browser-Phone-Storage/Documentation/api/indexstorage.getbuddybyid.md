[Home](../../../../README.md) &gt; [Browser-Phone-Storage](../../../../README.md#browser-phone-storage)

## phone.IndexStorage.GetBuddyById() method

Fetch a single `MyBuddies` record by its id. Keyed get — no scan. Reachable on the Phone API as `phone.IndexStorage.GetBuddyById` (the instance is installed on `window.phone.IndexStorage` by [HookupCallbacks()](./indexstorage.hookupcallbacks.md)).

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.IndexStorage.GetBuddyById(id: string): Promise<any | null>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  id | string | Buddy id (the record's <code>id</code> keyPath). |

<b>Returns:</b>

Promise&lt;any | null&gt;

The buddy record, or `null` if absent.

## Remarks

Thin domain alias for [GetFromStore("MyBuddies", id)](./indexstorage.getfromstore.md).
