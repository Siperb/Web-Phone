[Docs](../README.md) › Scenarios › Video calls

# Video calls

Add two `<video>` elements to the [call card](./call-screen.md): the far end, and a small one for
your own camera.

```html
<video id="remote" autoplay playsinline></video>
<video id="self" autoplay playsinline muted></video>
```

Mute the self-view (`muted`), or the user hears their own microphone. The far end's audio is
played by the SDK, so the remote element does not need sound either.

## Placing and answering

```js
await phone.Dial("2001", true);   // a video call
```

An incoming call is a video call when the caller offers video (`session.WithVideo`), and
`phone.Answer` answers it with the camera on. If the camera is refused or missing, the call is not
lost: it goes ahead as an audio call and `OnMediaError` reports `CameraDenied`.

## Showing the pictures

Both streams are on the session, and both changes arrive on `OnSessionChange`:

```js
phone.On("OnSessionChange", (session) => {
    show(document.getElementById("remote"), session.RtpReceiverVideoMediaStream);
    show(document.getElementById("self"), session.RtpSenderVideoMediaStream);
});

function show(el, stream) {
    if (el.srcObject !== (stream || null)) el.srcObject = stream || null;
}
```

| Field | Is |
| --- | --- |
| `session.RtpReceiverVideoMediaStream` | The far end's video, once it arrives. |
| `session.RtpSenderVideoMediaStream` | Your own camera while it is sending, `null` while it is off. |

Only set `srcObject` when the stream actually changed, as above: setting the same stream again
restarts the element.

## The camera buttons

```js
await phone.MuteVideo(id);     // camera off, and its light goes out
await phone.UnmuteVideo(id);   // camera on again
await phone.SwitchCamera(id);  // front / back, on a device with two
```

`phone.UnmuteVideo` on an audio-only call adds video to it, so the same button turns any call into
a video call. `session.IsVideoMuted` says which label to show.

## Sharing the screen

```js
if (session.AllowPresentScreen) {
    await phone.PresentScreen(id);    // the browser asks what to share
    // ...
    await phone.StopPresenting(id);   // back to the camera
}
```

`AllowPresentScreen` is `true` when the [`EnablePresentScreen`](../reference/settings.md#calls)
setting is on and the browser can share its screen. While you share, the far end sees the screen
instead of your camera. If the user stops sharing from the browser's own bar, the call goes back to
the camera by itself.

## See also

- [Calls: video](../reference/calls.md#video).
- [Events: media](../reference/events.md#media).
