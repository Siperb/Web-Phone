[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.UpdateCallDetailRecord() function

Update an existing call-detail record, or construct and save a new one.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.UpdateCallDetailRecord(buddyId: string, message: Partial<CDRMessageItem>): Promise<MessageStreamItem>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddyId | <code>string</code> | The buddy id used as a fallback `BuddyId` when constructing a new record. |
|  message | <code>Partial&lt;CDRMessageItem&gt;</code> | The partial CDR fields to apply, keyed by `message.Id`. |

<b>Returns:</b>

Promise&lt;MessageStreamItem&gt;

The fully-merged CDR record, in sync with storage.

## Remarks

Loads the stored CDR by `message.Id` via `phone.LoadMessage`. When found, only changed, defined fields are patched onto the stored record; the old entry is deleted from the `MessageStream` store (delete-then-insert to guarantee index consistency) and the merged record re-saved via `phone.SaveMessage`, then returned. When no stored CDR exists, a new `CDRMessageItem` is constructed from the provided fields (with `BuddyId` falling back to `buddyId`), saved via `phone.SaveMessage`, and returned.
