[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetBuddyByContact() function

Get a buddy by a contact number.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.GetBuddyByContact(contact: string): BuddyObject | null;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  contact | <code>string</code> | The contact number to match against each buddy's `Contacts`. |

<b>Returns:</b>

BuddyObject &#124; null

The first non-deleted buddy whose `Contacts` include a `Number` equal to `contact`, or null if none match.

## Remarks

Buddies flagged `isDeleted` are skipped. The first matching buddy wins. When the matched buddy has `AutoDelete` set, the flag is cleared and the buddy is persisted (fire-and-forget) via `phone.SaveBuddy`.
