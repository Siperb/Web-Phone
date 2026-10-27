[Docs](../README.md) › Scenarios › Incoming calls

# Incoming calls: a ringing screen, Answer and Decline

The SDK plays the ringtone and stops it when the call is answered, declined or hung up. Your job is
to show the call and offer two buttons.

## Show the call on `OnSelectLine`

```js
phone.On("OnSelectLine", ({ SessionId, Direction }) => {
    if (Direction !== "inbound") return;          // OnSelectLine fires for calls you place too
    const session = phone.GetSession(SessionId);
    if (session) showRinging(session);
});

function showRinging(session) {
    const box = document.getElementById("ringing");
    box.querySelector(".who").textContent = session.DisplayName;
    box.querySelector(".number").textContent = session.DisplayNumber;
    box.querySelector(".kind").textContent = session.WithVideo ? "Video call" : "Call";
    box.querySelector(".answer").onclick = () => phone.Answer(session.Id);
    box.querySelector(".decline").onclick = () => phone.Decline(session.Id);
    box.dataset.session = session.Id;
    box.hidden = false;
}
```

Why `OnSelectLine` and not `OnIncomingCall`? Every incoming call fires `OnIncomingCall`, including
one that Do Not Disturb or Call Waiting refuses straight away. `OnSelectLine` fires only for a
call that is going to ring, so the screen never flashes up for a call the user will not get.

## Hide it when the call stops ringing

The ringing screen goes away when the call is answered or when it ends:

```js
phone.On("OnSessionChange", (session) => {
    const box = document.getElementById("ringing");
    if (box.dataset.session !== session.Id) return;
    if (session.State === "Established" || session.State === "Terminated") box.hidden = true;
});
```

A caller who gives up, another of your devices answering, or the user pressing Decline all end the
call, so this one handler covers them. If the call was answered, your call card (see
[A call screen](./call-screen.md)) takes over from here, from the same `OnSessionChange` event.

## Decline is a real "no"

`phone.Decline` sends **603 Declined**. The server stops ringing the account's other devices and
sends the caller on, to voicemail or the next number. Use it only for the user's own button. If you
want to let a call ring out instead, do nothing and the server will time it out.

## A second call while one is up

With Call Waiting on (the default), a second call rings while the first is connected. The SDK
plays a short call-waiting beep instead of the ringtone, and fires `OnSelectLine` with
`Reason: "RingingLine"`. Show it the same way. A common pattern is to hold the first call when the
user answers the second:

```js
async function answerWaiting(waitingId) {
    for (const s of phone.GetSessions()) {
        if (s.Id !== waitingId && s.State === "Established" && !s.isOnHold) await phone.Hold(s.Id);
    }
    await phone.Answer(waitingId);
}
```

If you set [`SelectRingingLine`](../reference/settings.md#incoming-calls) to `false`, a call that
arrives during another one rings without firing `OnSelectLine`. In that case list it from
`OnIncomingCall` instead.

## Do Not Disturb and Auto Answer

These are settings, read at the moment a call arrives, so a toggle in your UI only has to write the
value:

```js
dnd.onchange = () => {
    phone.Settings.DoNotDisturb = dnd.checked;
    phone.SaveSettings();   // keep it after a reload
};
```

| Setting | Effect |
| --- | --- |
| `DoNotDisturb: true` | Every incoming call is refused with a `486`. |
| `CallWaiting: false` | A call that arrives while another is up is refused with a `486`. |
| `AutoAnswer: true` | Calls are answered after `AutoAnswerDelay` milliseconds (default `1000`). |

A refused call never reaches your ringing screen, and it is recorded in the conversation with that
contact so the user can see who called.

## A notification when the page is in the background

```js
phone.On("OnSelectLine", ({ SessionId, Direction }) => {
    if (Direction !== "inbound" || !document.hidden) return;
    const s = phone.GetSession(SessionId);
    if (s && Notification.permission === "granted") {
        const n = new Notification("Incoming call", { body: s.DisplayName + " " + s.DisplayNumber });
        n.onclick = () => { window.focus(); n.close(); };
    }
});
```

Ask for notification permission from a user action (a button) beforehand, as browsers require.

## See also

- [Settings: incoming calls](../reference/settings.md#incoming-calls).
- [Events: calls](../reference/events.md#calls).
