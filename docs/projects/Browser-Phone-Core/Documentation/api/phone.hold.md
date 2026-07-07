[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.Hold() function

Places a call on hold.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.Hold(param: string | SessionObject | BuddyObject): Promise<SessionObject | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | A sessionId string, a session object, or a buddy object whose active session should be held. |

<b>Returns:</b>

Promise&lt;SessionObject \| undefined&gt;

The session when awaited, or undefined if no session could be resolved.

## Remarks

Resolves the target session (for a buddy, the first `Established` session or the last one), looks up the owning buddy via `phone.GetBuddyWithSession`, and delegates to `phone.OnHold`.

## Example

```typescript
phone.Hold(sessionId);        // place call on hold by session ID
phone.Hold(sessionObject);    // place call on hold by session object
phone.Hold(buddyObject);      // place active call for buddy on hold
```
