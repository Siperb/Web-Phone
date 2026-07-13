[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.AddSession() function

Adds a session to a buddy's session list and re-renders.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.AddSession(buddy: BuddyObject, session: SessionObject): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddy | [BuddyObject](./buddyobject.md) | The buddy to attach the session to. |
|  session | [SessionObject](./sessionobject.md) | The session to append. |

<b>Returns:</b>

void

## Remarks

Initializes `buddy.Sessions` to an empty array if absent, pushes `session` onto it, then calls `phone.UpdateBuddyList()` and `phone.UpdateStage()`.
