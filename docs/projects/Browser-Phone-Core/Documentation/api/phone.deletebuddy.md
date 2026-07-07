[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.DeleteBuddy() function

Deletes a buddy from the PhoneAPI buddy list and triggers related callbacks.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.DeleteBuddy(buddy: BuddyObject): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddy | [BuddyObject](./buddyobject.md) | The buddy to delete. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Removes the buddy from `phone.MyBuddies`, marks it deleted and deselected, clears the selection if it was selected, and stamps `LastActivity`. On the first delete it flags the buddy `AutoDelete` (a subsequent delete clears the selection and refreshes the UI). It then persists via `phone.SaveBuddy`, refreshes the buddy list, stage, and UI, and raises the `OnBuddyDeleted` event with a deep copy of the buddy.

## Example

```typescript
await phone.DeleteBuddy(buddy);
```
