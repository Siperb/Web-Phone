[Docs](../README.md) › Getting started › Embedded Browser Phone

# The embedded Browser Phone: a finished phone in an iframe

If you want a complete phone rather than building your own UI, the loader can drop the Siperb
Browser Phone into an iframe on your page and provision it from your Siperb account. It is the same
SDK underneath, with a full UI on top.

A complete, working page is in this repo: [`test-Browser-Phone.html`](../../test-Browser-Phone.html),
and there is a live [CodePen](https://codepen.io/siperb/pen/myrOdap).

## 1. Give the phone its own iframe

```html
<iframe id="phoneFrame" src="about:blank" style="width:400px; height:640px;"></iframe>
```

The phone ships its own HTML, CSS and scripts and must have an iframe to itself; never inject it
into a `div` on your page. The smallest supported size is 320×320; 400×640 or larger is
recommended, and full screen works.

## 2. Load and provision it

You need a session and provisioning from [Siperb provisioning](./siperb-provisioning.md).

```js
const frame = document.getElementById("phoneFrame");

await Siperb.LoadBrowserPhone(frame);          // loads the phone's HTML, CSS and JS from the CDN

await Siperb.ProvisionPhone({
    Provisioning: provisioning,
    PhoneFrame: frame,
    ProfileUserId: deviceToken,
    SessionId: session.SessionToken,
    UserId: session.UserId,
    // Optional: callback once the phone UI is ready.
    OnLoad: () => frame.contentWindow.phone.Toast("Phone ready"),
});
```

`ProvisionPhone` configures the phone and connects it. It rejects if it cannot.

### Options you can pass to `ProvisionPhone`

Every feature switch is off unless you turn it on.

| Option | Default | What it does |
| --- | --- | --- |
| `EnableAvatar` | `false` | Show the user's picture |
| `EnabledSettings` | `false` | Show the settings button |
| `EnableDialPad` | `false` | Show the dial pad button |
| `EnableDisplayCallDetailRecords` | `false` | Show the call history button |
| `EnableCallTransfer`, `EnableCallHold`, `EnableCallMute`, `EnableCallRecording` | `false` | Call features |
| `EnableDeviceSelector` | `false` | Let the user pick microphone, speaker and camera |
| `EnableAutoAnswer`, `EnableDoNotDisturb`, `EnableCallWaiting` | `false` | Call handling |
| `EnableAlphanumericDial` | `false` | Allow letters in a dialled number |
| `Language` | `"auto"` | e.g. `"en-US"`, `"fr-FR"` |
| `DisplayDateFormat` | `"YYYY-MM-DD"` | Moment.js date format |
| `DisplayTimeFormat` | `"h:mm:ss A"` | Moment.js time format |
| `UiThemeStyle` | `"system"` | `"light"`, `"dark"` or `"system"` |
| `OnLoad` | | Called when the phone UI has loaded |

## 3. Control it from your page (click-to-dial)

The phone's API is the SDK's `phone` object **inside the iframe**:

```js
const phone = frame.contentWindow.phone;

const sessionId = await phone.Dial("*65");
await phone.SendDtmf(sessionId, "1");
```

Everything in the [headless guide](./headless.md) works here too, through
`frame.contentWindow.phone`, including `phone.On(...)` to listen for calls.

## Requirements

- Internet access to the Siperb CDN (`cdn.siperb.com`). Allow it if you are behind a strict
  firewall. The embedded phone does not work offline.
- A secure origin (`https://` or `localhost`) for microphone access.
