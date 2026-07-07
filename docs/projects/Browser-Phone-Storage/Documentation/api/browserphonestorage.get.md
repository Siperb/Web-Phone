[Home](../../../../README.md) &gt; [Browser-Phone-Storage](../../../../README.md#browser-phone-storage)

## BrowserPhoneStorage.Get() method

Read the raw string stored at `key`.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
Get<T>(key: string): T | null;
```

## Phone API usage

Preferred entry point — installed on the global phone object as `window.phone.LoadFromStorage`:

```typescript
const raw = window.phone.LoadFromStorage<string>("myKey");
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | string | The localStorage key. |

<b>Returns:</b>

T | null

The stored string cast to `T`, or `null` if the key is absent or reading throws.

## Remarks

The value is the raw string from `localStorage.getItem` cast to `T` — no parsing is performed. On error it logs `console.error` and returns `null`.
