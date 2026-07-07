[Home](../../../../README.md) &gt; [Browser-Phone-Storage](../../../../README.md#browser-phone-storage)

## phone.SaveToStorage() function

Save `data` to `window.localStorage` under `key`. Part of the Phone API — installed on `window.phone.SaveToStorage` by [HookupLocalStorageCallbacks()](./browserphonestorage.hookuplocalstoragecallbacks.md).

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.SaveToStorage(key: string, data: any): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | string | The localStorage key. |
|  data | any | Value to persist. Stored verbatim via <code>setItem</code>; non-string values are coerced by the platform, so callers must <code>JSON.stringify</code> objects themselves. |

<b>Returns:</b>

void

## Remarks

Runtime closure over the backing class method [BrowserPhoneStorage.Save()](./browserphonestorage.md). On failure, logs `console.error` and rethrows a wrapped error: `Storage save failed: <message>`. No JSON handling is performed — a previous attempt to auto-parse on [phone.LoadFromStorage()](./browserphonestorage.get.md) broke a downstream consumer that did its own `JSON.parse` and was reverted; do not reintroduce auto-stringify/parse.
