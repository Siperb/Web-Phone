[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetRecording() method

Retrieves a previously saved recording by its ID.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
GetRecording(recordingId: string): Promise<RecordingObject | null>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  recordingId | string | The ID of the recording. |

<b>Returns:</b>

Promise&lt;RecordingObject \| null&gt;

The recording, or `null` if not found or on error.

## Remarks

Reads from the `CallRecordings` store via `phone.IndexStorage.GetFromStore`. Errors are caught, logged, and result in `null`.

## Example

```typescript
const recording = await phone.GetRecording(recordingId);
```
