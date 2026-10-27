[Docs](../README.md) › Scenarios › A call screen

# A call screen: dial, show progress, hang up

This builds the screen most phones need: a number box, a Call button, and a card for each call
showing who it is with, what it is doing, a timer, and Hold / Mute / Hang up buttons.

The whole screen is driven by three events:

- **`OnSessionChange`** fires whenever anything about a call changes. Redraw the card from the
  session it carries.
- **`OnSessionTimer`** fires once a second, for the timer label.
- **`OnCallEnded`** and **`OnCallFailed`** say why a call finished.

## The page

```html
<input id="number" placeholder="Number">
<button id="call">Call</button>
<div id="calls"></div>
```

## Placing the call

```js
document.getElementById("call").onclick = async () => {
    const number = document.getElementById("number").value;
    const id = await phone.Dial(number);
    if (!id) alert("That call could not be placed.");
};
```

`phone.Dial` resolves to the new session id as soon as the call exists, before it rings. You do not
need to keep the id: the events below carry it.

## Drawing the card

```js
const cards = new Map();   // session id -> card element

function cardFor(session) {
    let card = cards.get(session.Id);
    if (!card) {
        card = document.createElement("div");
        card.className = "call";
        card.innerHTML = `
            <strong class="who"></strong> <span class="number"></span>
            <div><span class="status"></span> <span class="timer"></span></div>
            <button data-do="hold">Hold</button>
            <button data-do="mute">Mute</button>
            <button data-do="hangup">Hang up</button>`;
        card.onclick = (e) => act(session.Id, e.target.dataset.do);
        document.getElementById("calls").append(card);
        cards.set(session.Id, card);
    }
    return card;
}

phone.On("OnSessionChange", (session) => {
    const card = cardFor(session);
    card.querySelector(".who").textContent = session.DisplayName;
    card.querySelector(".number").textContent = session.DisplayNumber;
    card.querySelector(".status").textContent = statusText(session.Status);
    card.querySelector("[data-do=hold]").textContent = session.isOnHold ? "Resume" : "Hold";
    card.querySelector("[data-do=mute]").textContent = session.isOnMute ? "Unmute" : "Mute";

    if (session.State === "Terminated") {
        setTimeout(() => { card.remove(); cards.delete(session.Id); }, 2000);
    }
});
```

`State === "Terminated"` is the one test for "this call is over". It is true however the call
ended: you hung up, the far end hung up, it was never answered, or it could not be placed.

## The status line

`session.Status` is a key, not a sentence. Map it to your own words:

```js
function statusText(status) {
    return {
        WaitingForNetwork: "Waiting for network…",
        WaitingForRegister: "Connecting…",
        WaitingForPermission: "Allow the microphone…",
        Trying: "Calling…",
        Ringing: "Ringing…",
        InProgress: "Connected",
        OnHold: "On hold",
        Reconnecting: "Reconnecting…",
        Ended: "Call ended",
        Cancelled: "Cancelled",
        Failed: "Call failed",
    }[status] || status;
}
```

The first three are the checks the SDK runs before it sends the call (see
[Calls](../reference/calls.md#what-happens-before-the-far-end-rings)). Showing them tells the user
why nothing is ringing yet. The ringback tone starts on its own when the status reaches `Ringing`.

## The timer

```js
phone.On("OnSessionTimer", ({ SessionId, Timer }) => {
    const card = cards.get(SessionId);
    if (!card) return;
    const m = Math.floor(Timer / 60), s = Timer % 60;
    card.querySelector(".timer").textContent = `${m}:${String(s).padStart(2, "0")}`;
});
```

`Timer` counts seconds and goes back to `0` when the call is answered, so the label shows ringing
time first and then talk time.

## The buttons

```js
async function act(id, what) {
    const session = phone.GetSession(id);
    if (!session) return;
    if (what === "hold")   await (session.isOnHold ? phone.Unhold(id) : phone.Hold(id));
    if (what === "mute")   await (session.isOnMute ? phone.Unmute(id) : phone.Mute(id));
    if (what === "hangup") await phone.EndCall(id);
}
```

You do not update the card after a command. Each one changes the session, and the change arrives on
`OnSessionChange` like any other. `phone.EndCall` covers every hang-up case: it ends a connected
call and cancels one that is still ringing.

## Saying why it ended

```js
phone.On("OnCallEnded", (ended) => {
    const card = cards.get(ended.SessionId);
    if (!card) return;
    const why = ended.TerminatedBy === "them" ? "They hung up" : "You hung up";
    card.querySelector(".status").textContent =
        ended.TalkTime > 0 ? `${why} after ${ended.TalkTime}s` : ended.ReasonText || "Not answered";
});

phone.On("OnCallFailed", (failed) => {
    const card = cards.get(failed.SessionId);
    if (card) card.querySelector(".status").textContent = "Failed: " + failed.ReasonText;
});
```

A call that never got onto the wire (offline, not registered, microphone refused) ends with
`OnCallFailed`, not `OnCallEnded`. Listen to both.

## Showing the connection

Put the registration state somewhere the user can see it, and disable the Call button when the
account is not ready:

```js
phone.On("SipProviderStatus", (status) => {
    document.getElementById("call").disabled = status === "Failed";
    document.title = status === "Registered" ? "Phone" : "Phone (" + status + ")";
});
```

Only `"Failed"` (the server refused the account) needs the user to act. While the status is
`"Registering"` or `"Unregistered"`, a call can still be dialled: it waits for the connection and
goes out once the phone is registered.

## See also

- [Incoming calls](./incoming-calls.md), to add the ringing screen.
- [Calls](../reference/calls.md) and [Events](../reference/events.md) for every command and payload.
