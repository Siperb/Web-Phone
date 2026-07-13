[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.AddAddressBookEntry() function

Adds a new entry to the address book and persists it to indexed storage.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.AddAddressBookEntry(entry: any): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  entry | any | The address book entry to add. If it has no `Id`, one is generated via `phone.UID()`. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Appends `entry` to the in-memory `phone.AddressBook` array (initializing it if absent), assigns `entry.Id` via `phone.UID()` when it is `undefined`/`null`, and persists the entry to the `AddressBook` IndexStorage store keyed by `entry.Id` (via `phone.IndexStorage.SaveToStore`). Persist errors are swallowed.

## Example

```typescript
await phone.AddAddressBookEntry({ Name: "Alice", Number: "1001" });
```
