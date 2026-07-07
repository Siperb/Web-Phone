[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetBuddySessions() method

Returns the sessions belonging to a buddy.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
GetBuddySessions(buddyId: string | BuddyObject): [] | any[];
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddyId | string \| [BuddyObject](./buddyobject.md) | The id of the buddy, or the buddy object itself. |

<b>Returns:</b>

[] \| any[]

The buddy's `Sessions`, or an empty array when the buddy (or its sessions) cannot be resolved.

## Remarks

When passed a string, it looks up the buddy in `phone.MyBuddies` by `Id` and returns its `Sessions` (or `[]`). When passed a buddy object, it returns that object's `Sessions` directly (or `[]`).

## Example

```typescript
phone.GetBuddySessions("123");  // return the sessions of the buddy with id "123"
phone.GetBuddySessions(buddy);  // return the sessions of the buddy object
```
