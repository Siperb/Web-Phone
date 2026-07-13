[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.UpdateSession() function

Merges a session's fields into the matching stored session and re-renders.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.UpdateSession(session: SessionObject): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  session | [SessionObject](./sessionobject.md) | The session carrying the updated field values, matched to the stored session by `Id`. |

<b>Returns:</b>

void

## Remarks

Walks `phone.MyBuddies[].Sessions` to find the stored session with the same `Id`. It first snapshots the stored values (excluding `Timer`), because callers often mutate and pass back the same reference, then copies every key of the incoming session (except `Timer`) onto the stored one, and logs each field whose value actually changed via `phone.Log.debug`. Finally it calls `phone.UpdateBuddyList()` and `phone.UpdateStage()`.
