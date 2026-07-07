[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.Mute() method

Mutes a call.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
Mute(param: string | SessionObject | BuddyObject): Promise<SessionObject | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | A sessionId string, a session object, or a buddy object whose active session should be muted. |

<b>Returns:</b>

Promise&lt;SessionObject \| undefined&gt;

The session when awaited, or undefined if no session could be resolved.

## Remarks

Resolves the target session (for a buddy, the first `Established` session or the last one), looks up the owning buddy via `phone.GetBuddyWithSession`, and delegates to `phone.OnMute`.

## Example

```typescript
phone.Mute(sessionId);        // mute call by session ID
phone.Mute(sessionObject);    // mute call by session object
phone.Mute(buddyObject);      // mute active call for buddy
```
