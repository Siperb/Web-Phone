[Home](../../../../README.md) &gt; [Browser-Phone-Storage](../../../../README.md#browser-phone-storage)

## phone.LoadFromStorage() function

Read the raw string stored at `key`. Part of the Phone API — installed on `window.phone.LoadFromStorage` by [HookupLocalStorageCallbacks()](./browserphonestorage.hookuplocalstoragecallbacks.md).

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.LoadFromStorage<T>(key: string): T | null;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | string | The localStorage key. |

<b>Returns:</b>

T | null

The stored string cast to `T`, or `null` if the key is absent or reading throws.

## Remarks

Runtime closure over the backing class method [BrowserPhoneStorage.Get()](./browserphonestorage.md). The value is the raw string from `localStorage.getItem` cast to `T` — no parsing is performed. On error it logs `console.error` and returns `null`.
