[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.DeleteAddressBookEntry() function

Deletes an entry from the address book and removes it from indexed storage.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.DeleteAddressBookEntry(entryId: string): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  entryId | string | The `Id` of the entry to remove. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Filters out the entry whose `Id` matches `entryId` from the in-memory `phone.AddressBook` array (initializing it if absent) and deletes it from the `AddressBook` IndexStorage store (via `phone.IndexStorage.DeleteFromStore`). Delete errors are swallowed.

## Example

```typescript
await phone.DeleteAddressBookEntry(entryId);
```
