[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.LoadBuddies() function

Load the buddies from the storage.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.LoadBuddies(): Promise<BuddyObject[]>;
```

<b>Returns:</b>

Promise&lt;BuddyObject[]&gt;

A promise resolving to the hydrated list of buddies.

## Remarks

Ensures `phone.MyBuddies` is initialized, loads all buddies from the `MyBuddies` store, and filters out any flagged `isDeleted`. Each remaining buddy is hydrated with its message stream (`phone.LoadBuddyMessages`); when `phone.Settings.EnableLastInteraction` is true, a `LastInteraction` preview is computed from the last message (only when the preview builder returns a non-null value).

After building the list, a deferred buddy-maintenance pass is scheduled fire-and-forget: it waits 3 seconds and then calls `BuddyMaintenance.scheduleBuddyMaintenance()`, with any rejection guarded and logged so it cannot surface as an unhandled promise rejection.
