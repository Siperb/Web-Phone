[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.LoadAddressBook() function

Retrieves the address book entries, lazy-loading them from local storage on first use.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.LoadAddressBook(): Promise<any[]>;
```

<b>Returns:</b>

Promise&lt;any[]&gt;

The address book entries (the cached `phone.AddressBook` array).

## Remarks

When `phone.AddressBook` is unset or empty, the entries are loaded from the `AddressBook` IndexStorage store (via `phone.IndexStorage.GetFromStore`) and cached on `phone.AddressBook`; subsequent calls return the in-memory cache. A read error falls back to an empty array.

## Example

```typescript
const entries = await phone.LoadAddressBook();
```
