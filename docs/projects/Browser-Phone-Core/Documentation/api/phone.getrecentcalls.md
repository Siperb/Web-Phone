[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetRecentCalls() function

Retrieves recent call records (CDRs) from the `MessageStream` collection, optionally filtered by a search string.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.GetRecentCalls(filter: string): Promise<Array<{ Name: string; Number: string; Direction: string; Timestamp: string }>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | string | Filter string matched against the record's number, name, or direction. If it contains <code>@</code> it is treated as an email and MD5-hashed (via <code>phone.MD5Hash</code>) before comparison. |

<b>Returns:</b>

Promise&lt;Array&lt;{ Name: string; Number: string; Direction: string; Timestamp: string }&gt;&gt;

Up to 50 recent call records, newest first. Each record carries `Name`, `Number`, `Direction`, and `Timestamp` (the record's `Date`).

## Remarks

Reads the `MessageStream` store via `phone.IndexStorage.GetFromStore` and keeps only items whose `Type` is `"CDR"`. When a `filter` is supplied, records are matched case-insensitively against the direction-appropriate number/name (`ToNumber`/`ToName` for outbound, `FromNumber`/`FromName` for inbound) plus `Direction`. Results are sorted by `Date` descending (ISO 8601 strings compare lexicographically) and capped at 50. Outbound records are mapped from `ToName`/`ToNumber`; inbound records from `FromName`/`FromNumber`.

## Example

```typescript
// All recent calls (most recent first).
const recent = await phone.GetRecentCalls("");

// Filtered by name, number, or direction.
const missed = await phone.GetRecentCalls("inbound");
```
