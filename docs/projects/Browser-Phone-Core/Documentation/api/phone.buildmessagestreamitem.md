[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.BuildMessageStreamItem() function

Build a MessageStreamItem from a message.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.BuildMessageStreamItem(message: any): MessageStreamItem;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  message | <code>any</code> | The raw message object to normalize. |

<b>Returns:</b>

MessageStreamItem

The normalized message stream item.

## Remarks

When `message.Type == "CDR"`, a call-detail record is built: a synthesized `Body` (inbound/outbound call text with duration and disposition), plus normalized Id/Date/Direction/Duration/Reactions/Recordings/Tags/Comments/Flagged/Disposition/BuddyId/WithVideo fields, and `ReasonCode`/`ReasonText` sourced from `ProviderData` or the message. When `BlindTransferDestination` is `true`, `BlindTransferDestination` and `TransferFromDisplayName` are also carried through.

For non-CDR messages (chat, SMS, etc.), the message is returned as-is (spread) with required fields defaulted: an Id (falling back to `id`, `MessageId`, then `phone.UID()`), `Type` defaulting to `"unknown"`, `Direction` defaulting to `"inbound"`, empty `Reactions`/`Tags`/`Comments`, `Flagged` false, and `Status` defaulting to `SENT_PENDING`.
