[Docs](../README.md) › Reference › Messaging

# Messaging

Text messages go to and from a contact as SIP MESSAGE requests (RFC 3428, `text/plain`), over the
same connection as the calls. Each contact's messages and calls form one conversation.

## Sending

### `phone.OnSendTextMessage({ Buddy, Contact, Message })` → `Promise<void>`

| Key | What it is |
| --- | --- |
| `Buddy` | The contact to send to (a buddy from `phone.MyBuddies`). Required. |
| `Contact` | Which of their addresses, usually `buddy.Contacts[0]`. Required. |
| `Message` | The text. |

```js
await phone.OnSendTextMessage({
    Buddy: alice,
    Contact: alice.Contacts[0],
    Message: "Running five minutes late",
});
```

It takes one object only. The message is saved to the conversation first and then sent, so a send
that fails leaves a visible failed message rather than nothing. The new message arrives on
`OnMessageAdded` like any other.

### Delivery status

A sent message's `Metadata.Status` moves through these values, and each change is announced on
`OnMessageUpdated`:

| Status | Meaning |
| --- | --- |
| `QUEUED` | Saved, not yet sent. |
| `SENT_PENDING` | Handed to the network. |
| `SENT_CONFIRMED` | The server accepted it (a `200 OK`). |
| `FAILED` | It could not be sent, or was refused. |

If the phone is not registered when you press Send, the SDK first tries to get the connection back
(it checks the connection, and rebuilds it if it has to), and sends once it is registered. If it
cannot get ready in time, or the server does not answer within about 35 seconds, the message is
marked `FAILED`. Nothing is resent automatically: show the failure and let the user retry.

### `phone.OnResendMessage(message)` → `Promise<void>`

Sends a `FAILED` message again. Pass the message or its id. It reuses the same message rather than
adding a second one: the failed message goes through the same steps as a new send, and its status
moves on from `FAILED`.

`DELIVERED` and `READ` exist as values but are not written yet: they need read receipts, which are
not supported.

## Receiving

An incoming message is saved to the sender's conversation and announced on `OnMessageAdded`. If
nobody in your contacts has that number, a contact is created for them.

```js
phone.On("OnMessageAdded", (m) => {
    if (m.Direction === "inbound" && m.Type === "MSG") {
        notify(m.DisplayName, m.Body);
    }
});
```

Check both `Direction` and `Type`: `OnMessageAdded` also fires for messages you sent, and for call
records, and a missed call is `"inbound"` too.

The SDK plays a short tone for a message to a contact who is not the selected one (turn it off
with the [`EnableNotifySound`](./settings.md#messaging-and-history) setting), and counts it in that contact's
`Missed`.

## Reading a conversation

| Member | Returns | What it does |
| --- | --- | --- |
| `buddy.MessageStreamItems` | `Item[]` | The open conversation, after `phone.OnBuddySelected(buddy)`. Kept up to date for you; repaint on `MessageStreamChanged`. |
| `phone.LoadBuddyMessages(buddyId)` | `Promise<Item[]>` | Any contact's saved conversation, oldest first. |
| `phone.LoadMessage(id)` | `Promise<Item \| null>` | One message or call record in full. |
| `phone.FlagMessage(id)` | `Promise` | Flag a message. |

Each item in a conversation looks like this:

```js
{
    Id: "...",
    Type: "MSG",            // "MSG" a text message, "CDR" a call
    BuddyId: "...",
    Direction: "inbound",   // or "outbound"
    Date: "2026-10-27T09:14:02.000Z",
    Body: "Running five minutes late",   // empty for a call
    Metadata: {
        Status: "SENT_CONFIRMED",        // outbound messages
        Duration: 42,                    // calls: the talk time, in seconds
        FromName: "Alice", FromNumber: "2001",
    },
}
```

The conversation list carries the summary. The full record of a call (its timeline and quality
data) comes from `phone.LoadMessage(id)`.
