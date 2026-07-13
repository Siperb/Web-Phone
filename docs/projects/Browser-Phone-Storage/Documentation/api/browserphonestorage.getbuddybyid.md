[Home](../../../../README.md) &gt; [Browser-Phone-Storage](../../../../README.md#browser-phone-storage)

## phone.LoadBuddy() function

Fetch a single `MyBuddies` record by its id. Keyed get — no scan. Reachable on the Phone API as `phone.LoadBuddy`, a thin closure over the backing method `BrowserPhoneStorage.GetBuddyById`, installed by [HookupIndexStorageCallbacks()](./browserphonestorage.hookupindexstoragecallbacks.md).

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.LoadBuddy(key: string): Promise<any | null>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | string | Buddy id (the record's <code>id</code> keyPath). |

<b>Returns:</b>

Promise&lt;any | null&gt;

The buddy record, or `null` if absent.

## Remarks

Backing method: `BrowserPhoneStorage.GetBuddyById`. Thin domain alias for [GetFromStore("MyBuddies", id)](./indexstorage.getfromstore.md).
