[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.PlayRecording() method

Plays a saved recording by object or ID, handling DOM and cleanup.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
PlayRecording(recording: RecordingObject | string): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  recording | [RecordingObject](./recordingobject.md) \| string | The recording object, or a recordingId to load via `GetRecording`. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Resolves the recording (loading it by ID when a string is passed), validates that `recording.Blob` is a `Blob`, creates an object URL and an `Audio` element appended to `document.body`, and plays it. On playback end or error the object URL is revoked and the audio element removed. Failures surface a toast via `phone.Toast`.

## Example

```typescript
phone.PlayRecording(recordingId);   // play by ID
phone.PlayRecording(recording);     // play by object
```
