[Docs](../README.md) › Scenarios › Chat

# Chat: a contact list and a conversation

This builds a two-pane messaging screen: contacts on the left with an unread count, the open
conversation on the right, and a box to send from. The SDK stores the messages, keeps the open
conversation up to date, and plays a tone for a message to anyone else.

## The contact list

`phone.MyBuddies` is the list. Draw it once after `phone.Init()`, and again whenever
`BuddyListChanged` fires:

```js
function drawContacts() {
    const list = document.getElementById("contacts");
    list.replaceChildren(...phone.MyBuddies.map((b) => {
        const row = document.createElement("li");
        row.textContent = b.DisplayName + (b.Missed > 0 ? ` (${b.Missed})` : "");
        row.onclick = () => openConversation(b);
        return row;
    }));
    document.title = phone.GetTotalMissed() > 0 ? `(${phone.GetTotalMissed()}) Chat` : "Chat";
}

phone.On("BuddyListChanged", drawContacts);
await phone.Init({ /* account */ });
drawContacts();
```

`buddy.Missed` counts that contact's unread messages and missed calls. You never reset it yourself:
opening the conversation does.

## Opening a conversation

```js
let open = null;

function openConversation(buddy) {
    open = buddy;
    phone.SelectedBuddyId = buddy.Id;   // set this first
    phone.OnBuddySelected(buddy);       // loads the messages and clears the unread count
}

function closeConversation() {
    open = null;
    phone.OnBuddyDeSelected();
}
```

The SDK loads the conversation into `buddy.MessageStreamItems` and announces it on
`MessageStreamChanged`. It keeps that array up to date while the conversation is open: new
messages, your own, and delivery status changes. The open conversation is also remembered across a
reload.

## Drawing the conversation

```js
phone.On("MessageStreamChanged", (buddyId) => {
    if (!open || buddyId !== open.Id) return;
    const pane = document.getElementById("messages");
    pane.replaceChildren(...(open.MessageStreamItems || []).map(drawItem));
    pane.scrollTop = pane.scrollHeight;
});

function drawItem(item) {
    const row = document.createElement("div");
    row.className = item.Direction;   // "inbound" or "outbound"
    if (item.Type === "CDR") {
        row.textContent = item.Metadata.Duration > 0
            ? `Call, ${item.Metadata.Duration}s`
            : (item.Direction === "inbound" ? "Missed call" : "Call, not answered");
    } else {
        row.textContent = item.Body + (item.Direction === "outbound" ? " " + tick(item) : "");
    }
    return row;
}
```

A conversation mixes messages (`Type: "MSG"`) and calls (`Type: "CDR"`). A call carries no body:
draw it from `Metadata`, where `Duration` is the talk time in seconds.

## Sending

```js
document.getElementById("send").onclick = async () => {
    const box = document.getElementById("text");
    if (!open || !box.value.trim()) return;
    await phone.OnSendTextMessage({ Buddy: open, Contact: open.Contacts[0], Message: box.value });
    box.value = "";
};
```

The message appears in the conversation straight away, through `MessageStreamChanged`, before it
has been sent. It does not need the network at the moment the user presses Send: if the phone is not
registered, the SDK gets the connection back first and then sends.

## Delivery ticks

```js
function tick(item) {
    return {
        QUEUED: "🕓",
        SENT_PENDING: "🕓",
        SENT_CONFIRMED: "✓",
        FAILED: "⚠ Not sent. Tap to retry",
    }[item.Metadata.Status] || "";
}
```

Each status change redraws the conversation through `MessageStreamChanged`, so the tick moves on
its own. A message that could not be sent stays `FAILED`; nothing is resent automatically. Offer a
retry, in `drawItem`:

```js
if (item.Metadata.Status === "FAILED") row.onclick = () => phone.OnResendMessage(item.Id);
```

## A message for someone else

A message from a contact who is not the open one does not touch the open conversation. It plays the
notification tone, adds one to that contact's `Missed`, and fires `BuddyListChanged`, so the contact
list shows the count. To add a desktop notification too:

```js
phone.On("OnMessageAdded", (m) => {
    if (m.Direction !== "inbound" || m.Type !== "MSG") return;   // not a call record, not our own
    if (open && open.Id === m.BuddyId && !document.hidden) return;
    if (Notification.permission === "granted") new Notification(m.DisplayName, { body: m.Body });
});
```

Check both `Direction` and `Type`. A missed call is also an inbound item, with `Type: "CDR"`.

## See also

- [Messaging](../reference/messaging.md): sending, statuses and the item shape.
- [Contacts, calls and history](../reference/contacts-and-history.md#the-selected-conversation).
