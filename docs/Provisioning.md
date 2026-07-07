[Home](./README.md) &gt; [Provisioning](./README.md#provisioning)

# Siperb Phone — Provisioning Settings

Reference for every runtime `phone.Settings.*` value applied during phone provisioning.

Settings are assigned in each platform's `ProvisionPhone` sequence:

- Web — [`siperb-web.js`](../siperb-web.js) (canonical / most complete; **this document tracks it**)
- Electron — [`siperb-electron.js`](../siperb-electron.js)
- Mobile — [`siperb-mobile.js`](../siperb-mobile.js)

All three share the same setting names and `ProvisionSetting()` mechanism; **defaults differ per
platform** (mobile is audio-only focused, electron is more conservative). Where a default below is
platform-specific it is called out. The full editable provisioning schema (labels, min/max/step,
select options, lang keys) lives in [`PROVISIONING_SETTINGS.md`](../PROVISIONING_SETTINGS.md).

---

## How provisioning resolves a value

Provisioned settings are read through `ProvisionSetting(key, defaultValue, type)`
([`siperb-web.js:771`](../siperb-web.js:771)):

```javascript
phone.Settings.EnableText = ProvisionSetting("EnableText", false, "boolean");
```

Resolution order (last wins):

1. **Hard-coded default** — the `defaultValue` argument.
2. **Domain-level** — `Siperb.Integrations.Provisioning[key]`, if defined, replaces the default.
   Applied only with a custom domain. Think of this as "provisioning the defaults".
3. **Device / user-level** — `Siperb.SIPERB_PROVISIONING[key]`, if defined **and** its JS type
   matches the requested `type`, is returned. A `null`/`undefined` value, or a type mismatch,
   falls back to the resolved default.

> **Provision key vs. runtime property.** A few settings store under a `phone.Settings` property
> whose name differs from the provision key. These are flagged in the tables (e.g. the property
> `EnableDialPad` is provisioned from the key `EnableFreeDial`). When provisioning a device, use
> the **Provision key**.

---

## UI

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `UiMaxWidth` | `UiMaxWidth` | number | `999999` | Also overridable directly via `SIPERB_PROVISIONING.UiMaxWidth`. |
| `UiThemeStyle` | `UiThemeStyle` | string | `"system"` | Personalization default set before provisioning; synced to `Siperb.SIPERB_THEME`. |
| `UiThemeColor` | `UiThemeColor` | string | `"#3b82f6"` | |
| `EnabledSettings` | `EnableSettings` | boolean | `true` | Property name differs from key. Shows the settings UI. |
| `EnableDeviceSelector` | `EnableDeviceSelector` | boolean | `true` | |
| `EnableAvatar` | `EnableAvatar` | boolean | `true` | |
| `EnableMessageStreamSearch` | `EnableMessageStreamSearch` | boolean | `true` | |
| `EnableDisplayCallDetailRecords` | `EnableDisplayCallDetailRecords` | boolean | `true` | |
| `EnableCDRTimelineEvents` | `EnableCDRTimelineEvents` | boolean | `true` | |
| `ExpandTimelineEvents` | `EnableExpandTimelineEvents` | boolean | `false` | Property name differs from key. |
| `EnableSimpleDeclineResponse` | `EnableSimpleDeclineResponse` | boolean | `false` | |
| `EnableAnimation` | `EnableAnimation` | boolean | `true` | |
| `EnableLastInteraction` | `EnableLastInteraction` | boolean | `false` | |
| `MaxDidLength` | `MaxDidLength` | number | `16` | Max dialled-number length. |
| `EnableAlphanumericDial` | `EnableAlphanumericDial` | boolean | `true` | |

## Call handling

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `EnableDialPad` | `EnableFreeDial` | boolean | `true` | Property name differs from key. Free-dial pad. |
| `NoAnswerTimeout` | `NoAnswerTimeout` | number | `120` | Seconds. |
| `EnableAutoAnswer` | `EnableAutoAnswer` | boolean | `true` | |
| `AutoAnswerDelay` | `AutoAnswerDelay` | number | `500` | Milliseconds before auto-answer. |
| `EnableDoNotDisturb` | `EnableDoNotDisturb` | boolean | `true` | |
| `EnableCallWaiting` | `EnableCallWaiting` | boolean | `true` | |
| `EnableCallTransfer` | `EnableCallTransfer` | boolean | `true` | |
| `EnableCallHold` | `EnableCallHold` | boolean | `true` | |
| `EnableCallMute` | `EnableCallMute` | boolean | `true` | |
| `EnableVideoCalling` | `EnableVideoCalling` | boolean | `true` | Platform-dependent default (disabled on mobile). |
| `EnableEmailDialing` | `EnableEmailDialing` | boolean | `true` | When `true`, `UserEmail` is set from `Siperb.SIPERB_EMAIL`. |
| `EnableMinTransferButton` | `EnableMinTransferButton` | boolean | `true` | |
| `EnableMinConferenceButton` | `EnableMinConferenceButton` | boolean | `true` | |
| `EnableCallConferenceCall` | `EnableCallConferenceCall` | boolean | `true` | |
| `AutoHoldOnInvite` | `AutoHoldOnInvite` | boolean | `true` | |
| `SelectRingingLine` | `SelectRingingLine` | boolean | `true` | |
| `EnableDtmfActivityHiding` | `EnableDtmfActivityHiding` | boolean | `false` | |
| `EnableAudioLevels` | `EnableAudioLevels` | boolean | `true` | |

## Call sounds

| `phone.Settings` property | Provision key | Type | Default |
| --- | --- | --- | --- |
| `EnableRingtone` | `EnableRingtone` | boolean | `true` |
| `EnableHangupSound` | `EnableHangupSound` | boolean | `true` |
| `EnableTryingSound` | `EnableTryingSound` | boolean | `false` |
| `EnableDtmfSound` | `EnableDtmfSound` | boolean | `true` |
| `EnableNotifySound` | `EnableNotifySound` | boolean | `true` |
| `HangupSoundFile` | `HangupSoundFile` | string | `"Hangup_1.mp3"` |
| `TryingSoundFile` | `TryingSoundFile` | string | `"Trying_1.mp3"` |
| `NotifySoundFile` | `NotifySoundFile` | string | `"Notify_8.mp3"` |

## Messaging

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `EnableText` | `EnableText` | boolean | `false` | Enables in-app text messaging. |

## Presentation / screen sharing

| `phone.Settings` property | Provision key | Type | Default |
| --- | --- | --- | --- |
| `EnableVideoPresentation` | `EnableVideoPresentation` | boolean | `true` |
| `EnablePresentBlank` | `EnablePresentBlank` | boolean | `true` |
| `EnablePresentWebcam` | `EnablePresentWebcam` | boolean | `true` |
| `EnablePresentScreen` | `EnablePresentScreen` | boolean | `true` |
| `EnablePresentVideo` | `EnablePresentVideo` | boolean | `true` |
| `EnablePresentWhiteboard` | `EnablePresentWhiteboard` | boolean | `true` |
| `EnablePresentPicture` | `EnablePresentPicture` | boolean | `false` |

## Buddy management

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `MaxTempBuddies` | `MaxTempBuddies` | number | `500` | |
| `MaxBuddyAge` | `MaxBuddyAge` | number | `180` | Days. |
| `MaxBuddyDeleteAge` | `MaxBuddyDeleteAge` | number | `30` | Days. |
| `AutoDeleteDefault` | `AutoDeleteDefault` | boolean | `true` | |

## Audio

| `phone.Settings` property | Provision key | Type | Default |
| --- | --- | --- | --- |
| `NoiseSuppression` | `NoiseSuppression` | boolean | `true` |
| `AutoGainControl` | `AutoGainControl` | boolean | `true` |

## Video

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `MaxVideoBandwidth` | `MaxVideoBandwidth` | number | `2048` | Kbps. |
| `MirrorVideo` | `MirrorVideo` | string | `"rotateY(180deg)"` | CSS transform; `"rotateY(0deg)"` = normal. |
| `CaptureVideoAspectRatio` | `CaptureVideoAspectRatio` | string | `"16:9"` | |
| `CaptureVideoFps` | `CaptureVideoFps` | number | `25` | |
| `CaptureVideoHeight` | `CaptureVideoHeight` | string | `"HD"` | `SD` \| `HD` \| `FHD`. |
| `VideoResampleSize` | `VideoResampleSize` | string | `"1280x720"` | Also overridable via `SIPERB_PROVISIONING.VideoResampleSize`. |
| `StartVideoFullScreen` | `StartVideoFullScreen` | boolean | `true` | |

## SIP transport

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `SipTransportConnectionTimeout` | `SipTransportConnectionTimeout` | number | `15` | Seconds. |
| `SipTransportReconnectionAttempts` | `SipTransportReconnectionAttempts` | number | `100` | |
| `SipTransportReconnectionTimeout` | `SipTransportReconnectionTimeout` | number | `3` | Seconds. |
| `SipBundlePolicy` | `SipBundlePolicy` | string | `"balanced"` | `balanced` \| `max-compat` \| `max-recent`. |

## Presence / subscription

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `EnablePresence` | `EnablePresence` | boolean | `false` | |
| `EnableSubscribe` | `EnableSubscribe` | boolean | `false` | Forced `true` when `RegistrationMode === "WebSocket"`. |
| `EnableBuddySubscribe` | `EnableBuddySubscribe` | boolean | `false` | Forced `true` when `RegistrationMode === "WebSocket"`. |
| `EnableSelfSubscribe` | `EnableSelfSubscribe` | boolean | `false` | |
| `EnableVoiceMailSubscribe` | `EnableVoiceMailSubscribe` | boolean | `false` | |
| `SubscribeBuddyAccept` | `SubscribeBuddyAccept` | string | `"application/pidf+xml"` | Or `application/dialog-info+xml`. |
| `SubscribeBuddyEvent` | `SubscribeBuddyEvent` | string | `"dialog"` | `presence` \| `dialog`. |
| `SubscribeBuddyExpires` | `SubscribeBuddyExpires` | number | `1800` | Seconds. |

## Recording

| `phone.Settings` property | Provision key | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `EnableCallRecording` | `EnableCallRecording` | boolean | `true` | |
| `RecordAllCalls` | `RecordAllCalls` | boolean | `false` | |
| `RecordingLayout` | `RecordingLayout` | string | `"them-pnp"` | `side-by-side` \| `them-pnp` \| `us-only` \| `them-only` \| `talker-only` \| `talker-them` \| `talker-grid`. |
| `RecordingVideoFps` | `RecordingVideoFps` | number | `12` | |
| `RecordingVideoSize` | `RecordingVideoSize` | string | `"HD"` | `SD` \| `HD` \| `FHD`. |
| `RecordOnlyAudioInVideoCall` | `RecordOnlyAudioInVideoCall` | boolean | `true` | |
| `AlwaysShowVideoGrid` | `AlwaysShowVideoGrid` | boolean | `false` | |
| `RecordPresenting` | `RecordPresenting` | boolean | `true` | |

---

## Non-provisioned settings

These are set directly (not through `ProvisionSetting()`), so they cannot be overridden by device
provisioning.

### Personalization defaults

Applied only if not already set (`typeof … === "undefined"`), so a user's stored preference wins:

| `phone.Settings` property | Default | Notes |
| --- | --- | --- |
| `DisplayDateFormat` | `"YYYY-MM-DD"` | |
| `DisplayTimeFormat` | `"h:mm:ss A"` | |
| `UiThemeStyle` | `"system"` | Then provisioned (see UI table). |
| `Language` | `"auto"` | Synced to `Siperb.SIPERB_LANGUAGE`. |
| `BuddyAutoDeleteAtEnd` | `false` | |
| `HideAutoDeleteBuddies` | `false` | |
| `BuddySortBy` | `"activity"` | `alphabetical` \| `activity`. |

### Platform / asset paths (hard-coded)

| `phone.Settings` property | Value | Notes |
| --- | --- | --- |
| `Platform` | `"web"` | Per platform file. |
| `MediaLocation` | `"https://cdn.siperb.com/media/"` | |
| `AvatarLocation` | `"https://cdn.siperb.com/avatars/"` | |
| `WallpaperLocation` | `"https://cdn.siperb.com/wallpaper/"` | |
| `WallpaperLight` | `"wallpaper.0.light.webp"` | |
| `WallpaperDark` | `"wallpaper.0.dark.webp"` | |
| `AvailableWallpaper` | array | Hard-coded list. |
| `AvailableAvatar` | array | Provisioned from key `AvailableAvatar` (type `object`) with a default list. |
| `Avatar` | — | Set from `localStorage["SIPERB_AVATAR-<userId>"]` if present. |
| `UserEmail` | `Siperb.SIPERB_EMAIL` | Only when `EnableEmailDialing` is `true`. |
| `ProfileUserName` | `SIPERB_PROVISIONING.profileName` | Only when provided. |
| `PROFILE_USER_ID` | device ID | Storage key. |

---

_Source of truth: the `ProvisionPhone` sequence in [`siperb-web.js`](../siperb-web.js) (settings
block ~lines 320–596) and `ProvisionSetting()` at [`siperb-web.js:771`](../siperb-web.js:771).
Regenerate this file when settings are added, removed, or their defaults change._
