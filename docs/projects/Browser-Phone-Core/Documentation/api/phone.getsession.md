[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetSession() function

Gets a session by id.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.GetSession(sessionId: string): SessionObject | null;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  sessionId | string | The id of the session. |

<b>Returns:</b>

SessionObject \| null

The matching session from `phone.MyBuddies[].Sessions`, or `null` if none is found.
