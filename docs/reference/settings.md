[Docs](../README.md) › Reference › Settings

# Settings

`phone.Settings` is a plain object of preferences. Set values before `phone.Init()` by passing them
in `Settings`, or change them at any time afterwards:

```js
await phone.Init({ /* account */, Settings: { DoNotDisturb: false, EnableQos: true } });

phone.Settings.DoNotDisturb = true;   // takes effect on the next call
phone.SaveSettings();                 // keep it for the next visit
```

Settings are read when they are needed, so a change applies from then on without restarting the
phone. `phone.SaveSettings()` stores them in the browser for this `ProfileUserId`, and
`phone.Init()` loads them back on the next visit. A value you pass to `phone.Init()` takes
precedence over the stored one.

**Most switches need the exact boolean.** A setting marked *on when `true`* is off unless it is
the value `true`; the string `"true"` counts as off. A setting marked *on unless `false`* is on
unless it is the value `false`.

## Where the files are

| Setting | Default | What it does |
| --- | --- | --- |
| `MediaLocation` | `"./media/"` | Where the ringtone, ringback and other tones are. The Siperb CDN hosts a set at `https://cdn.siperb.com/media/`. |

The trailing slash matters.

## Incoming calls

| Setting | Rule | Default | What it does |
| --- | --- | --- | --- |
| `DoNotDisturb` | on when `true` | off | Refuse incoming calls with a `486`. |
| `CallWaiting` | on unless `false` | on | Let a second call ring while one is up. When off, a second call is refused with `486`. |
| `AutoAnswer` | on when `true` | off | Answer incoming calls automatically after `AutoAnswerDelay`. |
| `AutoAnswerDelay` | | `1000` | Milliseconds to ring before answering, from `0` to `30000`. |
| `SelectRingingLine` | on unless `false` | on | Let a call that arrives during another call take the screen (fires `OnSelectLine`). |

When more than one applies, Do Not Disturb wins, then Call Waiting, then Auto Answer, so a call is
never both refused and answered.

## Calls

| Setting | Rule | Default | What it does |
| --- | --- | --- | --- |
| `DialSetupTimeoutSeconds` | | `10` | How long a call waits to be online, registered and allowed the microphone before it fails. See [Calls](./calls.md#what-happens-before-the-far-end-rings). |
| `EnableDialWithoutRegister` | on when `true` | off | Send a call even when the account is not registered, for a server that does not require registration. |
| `EnableDialOffline` | on when `true` | off | Send a call even when the device reports it is offline. |
| `EnableEarlyMedia` | on when `true` | off | Play the far end's audio before it answers (announcements, network ringback). Off is safer with servers that ring several devices at once. |
| `DtmfType` | | `"inband"` | `"inband"` sends keypad tones in the audio (RFC 4733), `"info"` as SIP INFO, `"none"` not at all. |
| `EnableDtmfActivityHiding` | on when `true` | off | Record the tones a user types (a PIN, a card number) as `•` in the call's history and the console, instead of the digits. The tones themselves are sent as normal. |
| `EnableCallTransfer` | on when `true` | off | Allow transfers. Sets `session.AllowCallTransfer`. |
| `EnableCallConferenceCall` | on when `true` | off | Allow conference calls. Sets `session.AllowCallConference`. |
| `EnablePresentScreen` | on when `true` | off | Allow screen sharing, where the browser can do it. Sets `session.AllowPresentScreen`. |

## Devices

By default every call uses the system's default microphone, camera and speaker, which is the
choice least likely to leave a user with no audio when a headset is unplugged.

| Setting | Rule | What it does |
| --- | --- | --- |
| `EnableRememberedSettingsDevice` | on when `true` | Use the three devices below instead of the defaults. |
| `AudioSrcId` | | The microphone, by its label. |
| `AudioOutputId` | | The speaker, by its label. |
| `VideoSrcId` | | The camera, by its label. |

The microphone options `EchoCancellation`, `NoiseSuppression` and `AutoGainControl` (each default
`true`) are listed with the [start-up options](./init.md#media-and-network).

## Recording

| Setting | Rule | Default | What it does |
| --- | --- | --- | --- |
| `EnableCallRecording` | on when `true` | off | This phone may record. Sets `session.AllowCallRecording`. |
| `RecordAllCalls` | on when `true` | off | Record every call automatically when it connects. Needs `EnableCallRecording` too. |
| `RecordOnlyAudioInVideoCall` | on when `true` | off | Record a video call as audio only. |
| `RecordingLayout` | | `"them-pnp"` | How a video recording arranges the two pictures, below. |
| `RecordingVideoSize` | | `"HD"` | `"SD"` (640×360), `"HD"` (1280×720) or `"FHD"` (1920×1080). |
| `RecordingVideoFps` | | `12` | Frames per second, from `1` to `60`. |

| `RecordingLayout` | The recording shows |
| --- | --- |
| `"them-pnp"` | The far end full-frame, with your picture small in the corner. |
| `"side-by-side"` | You on the left, the far end on the right. |
| `"them-only"` | The far end only. |
| `"us-only"` | You only. |

A presentation (a shared screen) is recorded in place of your camera while it runs.

## Call quality

| Setting | Rule | Default | What it does |
| --- | --- | --- | --- |
| `EnableQos` | on when `true` | off | Sample each call once a second for quality (round-trip time, jitter, loss and a MOS score), stored on `session.CallQuality` and the call record. Also runs the checks behind `OnNetworkQuality` and the `NoInboundAudio` / `NoOutboundAudio` media errors. |
| `EnableAudioLevels` | on when `true` | off | Sample audio levels ten times a second for a level meter (`OnSenderAudioLevels` / `OnReceiverAudioLevels`). |

## Messaging and history

| Setting | Rule | Default | What it does |
| --- | --- | --- | --- |
| `EnableNotifySound` | on unless `false` | on | Play a tone when a message arrives for a contact who is not the selected one. |
| `MaxRecentCalls` | | `50` | How many calls `phone.GetRecentCalls()` returns. |

## Settings not listed here

`phone.Settings` holds more keys than these: the SDK's own phone UI keeps its preferences there,
and some keys exist for one deployment only. Anything not on this page is internal and may change
without notice.
