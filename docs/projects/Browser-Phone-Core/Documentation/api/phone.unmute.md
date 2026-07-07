[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.Unmute() function

Unmutes a call.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.Unmute(param: string | SessionObject | BuddyObject): Promise<SessionObject | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | A sessionId string, a session object, or a buddy object whose muted session should be unmuted. |

<b>Returns:</b>

Promise&lt;SessionObject \| undefined&gt;

The session when awaited, or undefined if no session could be resolved.

## Remarks

Resolves the target session (for a buddy, the first session flagged `isOnMute` or the last one), looks up the owning buddy via `phone.GetBuddyWithSession`, and delegates to `phone.OnUnmute`.

## Example

```typescript
phone.Unmute(sessionId);       // unmute call by session ID
phone.Unmute(sessionObject);   // unmute call by session object
phone.Unmute(buddyObject);     // unmute active call for buddy
```
