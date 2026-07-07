[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.BlindTransfer() method

Immediately transfers a call to the given destination.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
BlindTransfer(param: string | SessionObject | BuddyObject, destination: string | BuddyObject): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | The session to transfer: a sessionId string, a session object, or a buddy object. |
|  destination | string \| [BuddyObject](./buddyobject.md) | The transfer target: a dial string, a buddyId, or a BuddyObject. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Resolves the source session and its buddy, then resolves the destination to a buddy and contact (by BuddyObject, buddyId, contact number, or a synthesized temporary buddy for a raw dial string). The destination contact inherits the source session's provider when none is set. Delegates the transfer to `phone.OnBlindTransfer`.

## Example

```typescript
phone.BlindTransfer(sessionId, "*200");        // transfer to extension *200
phone.BlindTransfer(sessionId, buddyObject);   // transfer to buddy
```
