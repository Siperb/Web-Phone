[Home](../../../../README.md) &gt; [Browser-Phone-Storage](../../../../README.md#browser-phone-storage)

## IndexStorage.GetBuddyById() method

Fetch a single `MyBuddies` record by its id. Keyed get — no scan.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
GetBuddyById(id: string): Promise<any | null>;
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
