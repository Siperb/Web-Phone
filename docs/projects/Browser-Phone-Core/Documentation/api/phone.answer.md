[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.Answer() function

Answers an incoming call. Works with or without await.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.Answer(param: string | SessionObject | BuddyObject): Promise<SessionObject | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [SessionObject](./sessionobject.md) \| [BuddyObject](./buddyobject.md) | A sessionId string, a session object, or a buddy object whose incoming session should be answered. |

<b>Returns:</b>

Promise&lt;SessionObject \| undefined&gt;

The answered session when awaited, or undefined if no session could be resolved.

## Remarks

Resolves the incoming/ringing session and its owning buddy, stops any ringback, sets the session state to `Establishing`, refreshes the stage, and calls `Answer` on the session's provider (`phone.GetProvider`).

## Example

```typescript
phone.Answer(sessionId);                     // answer call by session ID
phone.Answer(sessionObject);                 // answer call by session object
phone.Answer(buddyObject);                   // answer incoming call for buddy
const session = await phone.Answer(sessionId);
```
