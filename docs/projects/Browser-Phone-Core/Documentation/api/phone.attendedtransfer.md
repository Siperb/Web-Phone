[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.AttendedTransfer() function

Initiates a consultative (attended) transfer: places the current call on hold and dials the destination.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.AttendedTransfer(param: string | SessionObject | BuddyObject, destination: string | BuddyObject): Promise<{ session: SessionObject; childSessionId: string } | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | The session to transfer: a sessionId string, a session object, or a buddy object. |
|  destination | string \| [BuddyObject](./buddyobject.md) | The transfer target: a dial string, a buddyId, or a BuddyObject. |

<b>Returns:</b>

Promise&lt;{ session: SessionObject; childSessionId: string } \| undefined&gt;

The original session and the child (consultation) session ID, or undefined if no session could be resolved.

## Remarks

Resolves the source session and destination (the same way as `BlindTransfer`) and delegates to `phone.OnAttendedTransfer`. The child session ID is read from `session.AttendedTransferCall`. Call `phone.CompleteTransfer(childSessionId)` to finish the transfer or `phone.CancelTransfer(childSessionId)` to cancel and restore the original call.

## Example

```typescript
phone.AttendedTransfer(sessionId, "*200");   // consult *200 before transferring
const { childSessionId } = await phone.AttendedTransfer(sessionId, "*200");
await phone.CompleteTransfer(childSessionId); // complete the transfer
await phone.CancelTransfer(childSessionId);   // cancel and restore original call
```
