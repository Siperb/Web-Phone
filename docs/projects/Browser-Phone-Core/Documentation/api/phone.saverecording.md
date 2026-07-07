[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.SaveRecording() function

Saves a call recording to persistent storage.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.SaveRecording(recording: RecordingObject): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  recording | [RecordingObject](./recordingobject.md) | The recording to save. |

<b>Returns:</b>

Promise&lt;void&gt;

## Remarks

Writes the recording to the `CallRecordings` store via `phone.IndexStorage.SaveToStore`, keyed by `recording.Id`. Errors are caught and logged.

## Example

```typescript
await phone.SaveRecording(recording);
```
