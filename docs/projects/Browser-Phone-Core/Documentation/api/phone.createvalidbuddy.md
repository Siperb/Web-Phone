[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.CreateValidBuddy() function

Normalize a partial buddy into a complete, valid `BuddyObject`.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.CreateValidBuddy(buddy: BuddyObject): BuddyObject | null;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddy | <code>BuddyObject</code> | The partial buddy to normalize. |

<b>Returns:</b>

BuddyObject &#124; null

A fully-populated `BuddyObject`, or null when no valid `DisplayName` is provided.

## Remarks

Assigns a generated `Id` (`phone.UID()`) when missing. Returns null (logging a warning) if `DisplayName` is absent, not a string, or empty. Otherwise it returns a new object spread from the input with defaults filled in for `Contacts`, `MessageStreamItems`, `Sessions`, `LastActivity`, `DateCreated`, `Avatar` (`phone.RandomAvatar()`), `Description`, `EnableDuringDnd`, and `Missed`.
