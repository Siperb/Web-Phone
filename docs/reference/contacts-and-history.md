[Docs](../README.md) › Reference › Contacts, calls and history

# Contacts, calls and history

The SDK keeps the contact list and the calls in memory, and saves the contact list and history in
the browser between visits (separately for each `ProfileUserId`). The SDK calls a contact a
**buddy**.

## Contacts (buddies)

`phone.MyBuddies` is the contact list: an array of buddy objects, loaded when `phone.Init()` runs.
Read it to draw your list, and repaint on the `BuddyListChanged` event.

A buddy looks like this (the fields you are likely to draw):

```js
{
    Id: "8c1f...",              // generated
    DisplayName: "Alice",
    DisplayNumber: "2001",
    Contacts: [                 // the addresses this person can be reached on
        { Number: "2001", Provider: "sip" },
        { Number: "+15551234567", Provider: "sip" },
    ],
    Avatar: "https://.../default.0.webp",
    Missed: 2,                  // unread messages and missed calls
    Sessions: [ /* this person's calls in progress */ ],
    LastActivity: "2026-10-27T09:14:02.000Z",
}
```

| Member | Returns | What it does |
| --- | --- | --- |
| `phone.MyBuddies` | `Buddy[]` | The contact list. |
| `phone.GetBuddyByContact(value)` | `Buddy \| null` | The buddy who owns a number, or whose id or name is `value`. A search of the list in memory, so it is instant. |
| `phone.AddBuddy(buddy)` | `Promise<Buddy \| null>` | Add a contact and save it. **Use the buddy it returns**: it is the copy that is in the list, with the defaults filled in. |
| `phone.UpdateBuddy(buddy)` | `Promise<boolean>` | Replace a contact with the object you pass, and save it. Pass the whole buddy, not just the fields that changed. |
| `phone.DeleteBuddy(buddy)` | `Promise<boolean>` | Delete a contact. |
| `phone.GetTotalMissed()` | `number` | The unread total across every contact, for a badge. |

```js
const alice = await phone.AddBuddy({
    DisplayName: "Alice",
    Contacts: [{ Number: "2001", Provider: "sip" }],
});
await phone.Dial(alice);
```

### The selected conversation

When the user opens a contact, tell the SDK. It then loads that contact's messages, clears their
unread count and keeps the conversation up to date while it is open:

```js
phone.SelectedBuddyId = buddy.Id;   // set this first
phone.OnBuddySelected(buddy);
// buddy.MessageStreamItems is now the conversation; repaint on MessageStreamChanged
```

When the user closes the conversation, call `phone.OnBuddyDeSelected()`. The SDK remembers the open
conversation across a reload.

## Calls in progress (sessions)

Each call is a **session**. Sessions live on the buddy they belong to (`buddy.Sessions`), and you
reach them with:

| Member | Returns | What it does |
| --- | --- | --- |
| `phone.GetSession(id)` | `Session \| null` | One call, by its session id. Returns the live object. |
| `phone.GetSessions()` | `Session[]` | Every call in progress. |
| `phone.GetBuddyWithSession(id)` | `Buddy \| null` | Who a call is with. |
| `phone.GetCallCount(id)` | `number` | How many calls are in progress other than this one. |

The fields of a session you are likely to draw:

| Field | Meaning |
| --- | --- |
| `Id` | The session id every command takes. |
| `BuddyId` | Who the call is with. |
| `Direction` | `"inbound"` or `"outbound"`. |
| `State` | Where the call is in its life: `Initial`, `Establishing`, `Established`, `Terminated`. |
| `Status` | What it is doing: `Ringing`, `InProgress`, `OnHold`, and so on. See [Types](./types.md#sessionstatus). |
| `DisplayName` / `DisplayNumber` | Who the far end is: name and number, always separate. |
| `isOnHold` / `isOnMute` | Hold and microphone mute. |
| `WithVideo` / `IsVideoMuted` | The call has video / your camera is currently off. |
| `Timer` | Seconds since the call was answered (seconds of ringing before that). |
| `AllowCallTransfer`, `AllowCallConference`, `AllowCallRecording`, `AllowPresentScreen` | What the UI may offer for this call. See [Calls](./calls.md#what-a-call-can-do). |

Read sessions; do not write to them. Change a call through the [call commands](./calls.md).

## Call history

### `phone.GetRecentCalls(filter?)` → `Promise<Call[]>`

Recent calls, newest first, as a plain array:

```js
{ BuddyId, Name, Number, Direction, Timestamp, Duration, Provider, WithVideo }
```

`Duration` is the talk time in milliseconds, and `0` for a call that was never answered, which is
how you tell a missed call apart. `filter` is optional text matched against the name, the number
and the direction. The list is capped at the `MaxRecentCalls` setting (default 50).

Each call is also recorded in the conversation with that contact, next to their messages. See
[Messaging](./messaging.md).
