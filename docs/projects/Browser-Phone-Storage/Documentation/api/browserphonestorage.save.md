[Home](../../../../README.md) &gt; [Browser-Phone-Storage](../../../../README.md#browser-phone-storage)

## BrowserPhoneStorage.Save() method

Write `data` to `window.localStorage` under `key`.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
Save(key: string, data: any): void;
```

## Phone API usage

Preferred entry point — installed on the global phone object as `window.phone.SaveToStorage`:

```typescript
window.phone.SaveToStorage("myKey", JSON.stringify(value));
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | string | The localStorage key. |
|  data | any | Value to persist. Stored verbatim via <code>setItem</code>; non-string values are coerced by the platform, so callers must <code>JSON.stringify</code> objects themselves. |

<b>Returns:</b>

void

## Remarks

On failure, logs `console.error` and rethrows a wrapped error: `Storage save failed: <message>`. No JSON handling is performed — a previous attempt to auto-parse on [Get()](./browserphonestorage.get.md) broke a downstream consumer that did its own `JSON.parse` and was reverted; do not reintroduce auto-stringify/parse.
