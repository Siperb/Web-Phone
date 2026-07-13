[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.OnMessageReceived() function

Handles an inbound message: resolves (or creates) the sender buddy, builds and persists an inbound message stream item, and raises the received-message event.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.OnMessageReceived(message: ReceivedMessage): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  message | <code>ReceivedMessage</code> | The received message, including `from`, `text`, `messageId`, `displayName`, and optional `contactEmail`. |

<b>Returns:</b>

void

## Remarks

The sender is resolved by the routable SIP From identity (`message.from`) first via `phone.GetBuddyByContact`, then falls back to the readable email (`message.contactEmail`, lowercased/trimmed) as an enrichment key — the email is never allowed to replace the wire From. When neither identity matches a buddy, a temporary auto-delete buddy is created via `phone.CreateValidBuddy`/`phone.AddBuddy`, keyed by the readable email when present (so replies detect `@` and hash at send time) otherwise by the SIP identity; no `buddy.Email` is persisted.

An inbound `MessageStreamItem` is built (Id from `messageId` or a generated `phone.UID()`, `FromNumber` set to the SIP From, `Status` `READ`), persisted via `phone.AddMessage`, and the buddy's last activity, buddy list, and stage are refreshed. When the sender is not the currently selected buddy (`phone.SelectedBuddyId`), the buddy's `Missed` count is incremented and the buddy saved. Finally an `OnMessageReceived` event is raised via `phone.RaiseEvent` with the message stream item as its data. The async body's errors are caught and logged via `phone.Log.error`.
