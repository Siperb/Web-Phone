[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.EndCall() function

Ends a call. Works with or without await.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.EndCall(param: string | SessionObject | BuddyObject): Promise<SessionObject | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | A sessionId string, a session object, or a buddy object whose active session should be ended. |

<b>Returns:</b>

Promise&lt;SessionObject \| undefined&gt;

The ended session when awaited, or undefined if no session could be resolved.

## Remarks

Resolves the target session, stops any ringback via `phone.StopRingback`, and then acts on the session's provider (`phone.GetProvider`): an established call is hung up, an unanswered inbound call is declined/rejected/cancelled, and an unanswered outbound call is cancelled. After a short delay it removes the session and refreshes the stage and buddy list.

## Example

```typescript
phone.EndCall(sessionId);                    // end call by session ID
phone.EndCall(sessionObject);                // end call by session object
phone.EndCall(buddyObject);                  // end active call for buddy
const session = await phone.EndCall(sessionId);
```
