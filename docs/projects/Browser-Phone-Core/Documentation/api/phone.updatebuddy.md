[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.UpdateBuddy() function

Updates an existing buddy and refreshes the UI after a short delay.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.UpdateBuddy(buddy: BuddyObject): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddy | [BuddyObject](./buddyobject.md) | The buddy to update. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

When `buddy.Subscribe` is set, applies presence subscription state through `phone.SipProvider`: `Subscribe(buddy)` when true, `Unsubscribe(buddy)` when false. It then deselects the buddy, stamps `LastActivity`, persists via `phone.SaveBuddy`, refreshes the buddy list, and raises the `OnBuddyUpdated` event. Errors are logged and re-thrown.

## Example

```typescript
buddy.Subscribe = true;
await phone.UpdateBuddy(buddy);
```
