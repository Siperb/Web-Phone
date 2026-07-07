[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.Unhold() function

Takes a call off hold.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.Unhold(param: string | SessionObject | BuddyObject): Promise<SessionObject | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | A sessionId string, a session object, or a buddy object whose held session should be resumed. |

<b>Returns:</b>

Promise&lt;SessionObject \| undefined&gt;

The session when awaited, or undefined if no session could be resolved.

## Remarks

Resolves the target session (for a buddy, the first session flagged `isOnHold` or the last one), looks up the owning buddy via `phone.GetBuddyWithSession`, and delegates to `phone.OnUnhold`.

## Example

```typescript
phone.Unhold(sessionId);       // take call off hold by session ID
phone.Unhold(sessionObject);   // take call off hold by session object
phone.Unhold(buddyObject);     // take held call for buddy off hold
```
