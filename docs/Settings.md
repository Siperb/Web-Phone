# User Settings

This project stores user-configurable settings on `window.phone.Settings` and persists them via `window.phone.SaveSettings()`. Settings are saved under the storage key `Settings-<PROFILE_USER_ID>`.

Note: `BrowserPhoneCore.LoadDefaultSettings()` defines defaults, but `Init()` does not call it by default. If you want defaults, call `LoadDefaultSettings()` yourself before saving.

## Defaults (LoadDefaultSettings)

| Setting | Default | Description |
| --- | --- | --- |
| `MaxDidLength` | `16` | Maximum length allowed for a DID/number in the UI. |
| `EnableAlphanumericDial` | `false` | Allow alphanumeric dialing in the UI. |
| `UiMaxWidth` | `9999999` | Maximum UI width. |
| `DisplayDateFormat` | `"YYYY-MM-DD"` | Date format string for display. |
| `DisplayTimeFormat` | `"h:mm:ss A"` | Time format string for display. |
| `BuddyAutoDeleteAtEnd` | `false` | Whether to auto-delete buddies at the end of a session. |
| `HideAutoDeleteBuddies` | `true` | Hide auto-deleted buddies in UI lists. |
| `BuddySortBy` | `"activity"` | Buddy sorting mode (`"alphabetical"` or `"activity"`). |
| `VideoResampleSize` | `"SD"` | Target size for video resampling. |
| `AvatarLocation` | `"https://d22gi2hj55ngoj.cloudfront.net/avatars/"` | Base URL for avatar assets. |
| `AvailableAvatar` | `[...]` | List of available avatar filenames. |
| `Avatar` | `"./avatars/default.2.webp"` | Avatar URL; when saved, the value is stored as base64. |
| `WallpaperLocation` | `"https://d22gi2hj55ngoj.cloudfront.net/wallpaper/"` | Base URL for wallpaper assets. |
| `AvailableWallpaper` | `[{"Dark":"wallpaper.0.dark.webp","Light":"wallpaper.0.light.webp"}, ...]` | List of available wallpaper pairs. |
| `WallpaperLight` | `"./wallpaper/wallpaper.0.light.webp"` | Light wallpaper URL; when saved, the value is stored as base64. |
| `WallpaperDark` | `"./wallpaper/wallpaper.0.dark.webp"` | Dark wallpaper URL; when saved, the value is stored as base64. |
| `LanguageLocation` | `"https://d22gi2hj55ngoj.cloudfront.net/lang/"` | Base URL for language assets. |
| `AvailableLang` | `[...]` | Available language codes (`fr`, `ja`, `zh-hans`, `zh`, `ru`, `tr`, `nl`, `es`, `de`, `pl`, `pt-br`). |
| `LoadAlternateLang` | `true` | Enable loading of alternate language assets. |
| `Language` | `"auto"` | Language code to load or `"auto"`. |
| `Providers` | `[]` | Provider list; populated at runtime and cleared before saving. |
| `MediaLocation` | `"https://d22gi2hj55ngoj.cloudfront.net/media/"` | Base URL for media assets. |

## Additional settings read by the runtime

These are referenced in the code but do not have defaults in `LoadDefaultSettings()`.

| Setting | Default behavior | Description |
| --- | --- | --- |
| `RecordAllCalls` | If `true`, start recording on call connect. | When enabled, `OnCallConnected` triggers `OnStartRecording` automatically. |
| `MaxBuddyAge` | Falls back to 30 days (ms) when unset. | Buddy retention threshold in milliseconds for auto-deletion. |
| `AudioSrcId` | Uses `"default"` when unset. | Selected audio input device ID for calls/sessions. |
| `AudioOutputId` | Uses `"default"` when unset. | Selected audio output device ID for calls/sessions. |
| `VideoSrcId` | Uses `"default"` when unset. | Selected video input device ID for calls/sessions. |

## Recording layout and video size

```ts
// Layout knob (optional)
phone.Settings.RecordingLayout = "them-pnp"; // default "them-pnp"
```

### Layout options

`phone.Settings.RecordingLayout` affects how the Web core draws remote/local video into the recording canvas.

| Layout value | What you get in the recording |
| --- | --- |
| `them-pnp` (default) | **Remote video** is full-frame (main). **Local video** is a small picture-in-picture at **top-left** (10px margin). |
| `side-by-side` | Canvas is **double-width** with a **5px gap**: **local** fills the **left half**, **remote** fills the **right half**. |
| `them-only` | **Remote-only** (no local picture-in-picture drawn). |
| `us-only` | **Not implemented in current Web core**; currently behaves like remote-only. |
| anything else | Treated like **remote-only** (no local picture-in-picture drawn). |

### Video size presets

`phone.Settings.RecordingVideoSize` controls the canvas size (and the PiP size for `them-pnp`):

| RecordingVideoSize | Canvas resolution (WxH) | PiP size (approx) |
| --- | --- | --- |
| `SD` | `640x360` | `100px` |
| `HD` (default) | `1280x720` | `144px` |
| `FHD` | `1920x1080` | `240px` |


