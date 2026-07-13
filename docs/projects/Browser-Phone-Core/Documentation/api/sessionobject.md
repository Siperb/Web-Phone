[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## SessionObject interface

<b>Signature:</b>

```typescript
export interface SessionObject
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  Id |  | <code>string</code> |  |
|  State |  | <code>string</code> |  |
|  Direction |  | <code>string</code> |  |
|  DisplayName |  | <code>string</code> | <i>(Optional)</i> |
|  DisplayNumber |  | <code>string</code> | <i>(Optional)</i> |
|  Status |  | <code>string</code> | <i>(Optional)</i> |
|  Timer |  | <code>number</code> | <i>(Optional)</i> |
|  TimerInterval |  | <code>ReturnType&lt;typeof setInterval&gt; \| null</code> | <i>(Optional)</i> |
|  StartTime |  | <code>string</code> | <i>(Optional)</i> |
|  AudioInputDevice |  | <code>string</code> | <i>(Optional)</i> |
|  AudioOutputDevice |  | <code>string</code> | <i>(Optional)</i> |
|  VideoInputDevice |  | <code>string</code> | <i>(Optional)</i> |
|  Provider |  | <code>string \| { Type: string; [key: string]: any }</code> | <i>(Optional)</i> |
|  BuddyId |  | <code>string</code> | <i>(Optional)</i> |
|  Flagged |  | <code>boolean</code> | <i>(Optional)</i> |
|  Comments |  | <code>string[]</code> | <i>(Optional)</i> |
|  Recording |  | <code>any[]</code> | <i>(Optional)</i> |
|  Reactions |  | <code>any[]</code> | <i>(Optional)</i> |
|  isOnHold |  | <code>boolean</code> | <i>(Optional)</i> |
|  isOnMute |  | <code>boolean</code> | <i>(Optional)</i> |
|  isRecording |  | <code>boolean</code> | <i>(Optional)</i> |
|  RtpSenderVideoMediaStream |  | <code>MediaStream</code> | <i>(Optional)</i> |
|  RecordingMediaStream |  | <code>MediaStream</code> | <i>(Optional)</i> |
|  WithVideo |  | <code>boolean</code> | <i>(Optional)</i> |
|  IsVideoMuted |  | <code>boolean</code> | <i>(Optional)</i> |
|  Presenting |  | <code>"Blank" \| "Picture" \| "Webcam" \| "Screen" \| "Video" \| "Whiteboard" \| null</code> | <i>(Optional)</i> |
|  PresentVideoMediaStream |  | <code>MediaStream</code> | <i>(Optional)</i> |
|  PresentVideoFileName |  | <code>string</code> | <i>(Optional)</i> |
|  PresentScreenMediaStream |  | <code>MediaStream</code> | <i>(Optional)</i> |
|  PresentCanvasMediaStream |  | <code>MediaStream</code> | <i>(Optional)</i> |
|  PresentWebcamMediaStream |  | <code>MediaStream</code> | <i>(Optional)</i> |
|  PresentCanvas |  | <code>any</code> | <i>(Optional)</i> |
|  ProfileUserId |  | <code>string</code> | <i>(Optional)</i> |
|  View |  | <code>string</code> | <i>(Optional)</i> |
|  Events |  | <code>SessionEvent[]</code> | <i>(Optional)</i> |
|  Data |  | <code>{ RtpSenderStats?: any[]; RtpReceiverStats?: any[]; [key: string]: any }</code> | <i>(Optional)</i> |
|  AttendedTransferCall |  | <code>string \| null</code> | <i>(Optional)</i> |
|  ParentSessionId |  | <code>string</code> | <i>(Optional)</i> |
|  ConferenceChildren |  | <code>string[]</code> | <i>(Optional)</i> host session's authoritative conference member list (child session ids) |
|  Error |  | <code>string \| any</code> | <i>(Optional)</i> |
|  RtpSenderStats |  | <code>any[]</code> | <i>(Optional)</i> |
|  RtpReceiverStats |  | <code>any[]</code> | <i>(Optional)</i> |
|  RtpRemoteInboundStats |  | <code>any[]</code> | <i>(Optional)</i> |
|  RtpSenderLevel |  | <code>number</code> | <i>(Optional)</i> |
|  RtpReceiverLevel |  | <code>number</code> | <i>(Optional)</i> |
|  QualityToastLastShown |  | <code>number</code> | <i>(Optional)</i> |
|  NoAnswerTimer |  | <code>ReturnType&lt;typeof setTimeout&gt;</code> | <i>(Optional)</i> |
|  ExtraInviteHeaders |  | <code>{ [key: string]: string }</code> | <i>(Optional)</i> |
|  AllowCallTransfer |  | <code>boolean</code> | <i>(Optional)</i> |
|  AllowCallConference |  | <code>boolean</code> | <i>(Optional)</i> |

## Remarks

Open/extensible: carries an index signature `[key: string]: any`.
