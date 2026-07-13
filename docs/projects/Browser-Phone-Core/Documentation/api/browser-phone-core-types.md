[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## Browser-Phone-Core-Types

The shared TypeScript type surface for Browser-Phone-Core, declared in `src/Browser-Phone-Core-Types.ts`. These interfaces, enumerations, and type aliases describe the objects an integrator receives from and passes into the `window.phone` API — buddies, contacts, call sessions, message-stream items, settings, and event payloads.

Every symbol below except [Direction](./direction.md) is tagged `@PhoneAPI` and is therefore part of the exported Phone API type surface; this consolidated page is listed in [PHONE_API.md](../PHONE_API.md). Each type also has its own per-symbol page (linked in the Contents table) with a field-by-field breakdown; the signature blocks here are copied verbatim from source.

## Contents

|  Symbol | Kind | Phone API | Description |
|  --- | --- | --- | --- |
|  [ContactObject](./contactobject.md) | Interface | Yes | A single addressable contact method (number/email + metadata). |
|  [ReceivedMessage](./receivedmessage.md) | Interface | Yes | Incoming SIP MESSAGE payload delivered to `OnMessageReceived`. |
|  [SessionEvent](./sessionevent.md) | Interface | Yes | A timestamped entry in a session's activity log. |
|  [PhoneSettings](./phonesettings.md) | Interface | Yes | Global phone configuration. |
|  [PhoneEvent](./phoneevent.md) | Interface | Yes | Payload dispatched through `RaiseEvent`. |
|  [SessionObject](./sessionobject.md) | Interface | Yes | A live call session and its full runtime state. |
|  [BuddyObject](./buddyobject.md) | Interface | Yes | A contact/buddy with its contacts, sessions, and message stream. |
|  [MessageType](./messagetype.md) | Enumeration | Yes | Message-stream item kind: `MSG` / `CDR` / `SYSTEM`. |
|  [Direction](./direction.md) | Enumeration | No | Call/message direction: `inbound` / `outbound`. |
|  [MessageDeliveryStatus](./messagedeliverystatus.md) | Type Alias | Yes | Delivery-status states for an outbound message. |
|  [MessageStreamItem](./messagestreamitem.md) | Interface | Yes | One item (MSG/CDR/SYSTEM) in a buddy's message stream. |
|  [RecordingObject](./recordingobject.md) | Interface | Yes | A call recording record. |

## ContactObject interface

A single addressable contact method for a buddy. See [ContactObject](./contactobject.md).

<b>Signature:</b>

```typescript
export interface ContactObject {
    Number: string;
    Provider: string;
    Type?: string;
    Name?: string;
    [key: string]: any;
}
```

Open/extensible: carries an index signature `[key: string]: any`. `Number` and `Provider` are required.

## ReceivedMessage interface

Payload delivered by the SipProvider to `phone.OnMessageReceived` for an incoming SIP MESSAGE. See [ReceivedMessage](./receivedmessage.md).

<b>Signature:</b>

```typescript
export interface ReceivedMessage {
    messageId: string;
    from: string;
    to: string;
    text: string;
    timestamp: string;
    contentType: string;
    displayName?: string;
    contactNumber?: string;
    contactEmail?: string;
    uuid?: string;
}
```

The first six fields are always present (may be empty strings); the enrichment fields (`displayName`, `contactNumber`, `contactEmail`, `uuid`) are optional and only populated when the matching SIP header is on the wire, so the consumer degrades gracefully when one is absent.

## SessionEvent interface

A timestamped entry in a session's activity log (`session.Events`). See [SessionEvent](./sessionevent.md).

<b>Signature:</b>

```typescript
export interface SessionEvent {
    Timestamp: string;
    Activity: string;
    Data?: any;
}
```

## PhoneSettings interface

Global phone configuration. See [PhoneSettings](./phonesettings.md).

<b>Signature:</b>

```typescript
export interface PhoneSettings {
    Providers?: any[];
    AudioSrcId?: string;
    AudioOutputId?: string;
    VideoSrcId?: string;
    RecordAllCalls?: boolean;
    RecordPresenting?: boolean;
    RenderVideoThumbnail?: boolean;
    BuddyAutoDeleteAtEnd?: boolean;
    MaxBuddyAge?: number;
    BuddySortBy?: string;
    Language?: string;
    AvailableAvatar?: string[];
    [key: string]: any;
}
```

Open/extensible: carries an index signature `[key: string]: any`.

## PhoneEvent interface

Payload dispatched through `phone.RaiseEvent`. See [PhoneEvent](./phoneevent.md).

<b>Signature:</b>

```typescript
export interface PhoneEvent {
    Event: string;
    Data?: any;
    Timestamp?: string;
    [key: string]: any;
}
```

Open/extensible: carries an index signature `[key: string]: any`.

## SessionObject interface

A live call session and its full runtime state. See [SessionObject](./sessionobject.md) for the per-field table.

<b>Signature:</b>

```typescript
export interface SessionObject {
    Id: string;
    State: string;
    Direction: string;
    DisplayName?: string;
    DisplayNumber?: string;
    Status?: string;
    Timer?: number;
    TimerInterval?: ReturnType<typeof setInterval> | null;
    StartTime?: string;
    AudioInputDevice?: string;
    AudioOutputDevice?: string;
    VideoInputDevice?: string;
    Provider?: string | { Type: string; [key: string]: any };
    BuddyId?: string;
    Flagged?: boolean;
    Comments?: string[];
    Recording?: any[];
    Reactions?: any[];
    isOnHold?: boolean;
    isOnMute?: boolean;
    isRecording?: boolean;
    RtpSenderVideoMediaStream?: MediaStream;
    RecordingMediaStream?: MediaStream;
    WithVideo?: boolean;
    IsVideoMuted?: boolean;
    Presenting?: "Blank" | "Picture" | "Webcam" | "Screen" | "Video" | "Whiteboard" | null;
    PresentVideoMediaStream?: MediaStream;
    PresentVideoFileName?: string;
    PresentScreenMediaStream?: MediaStream;
    PresentCanvasMediaStream?: MediaStream;
    PresentWebcamMediaStream?: MediaStream;
    PresentCanvas?: any;
    ProfileUserId?: string;
    View?: string;
    Events?: SessionEvent[];
    Data?: { RtpSenderStats?: any[]; RtpReceiverStats?: any[]; [key: string]: any };
    AttendedTransferCall?: string | null;
    ParentSessionId?: string;
    ConferenceChildren?: string[];   // host session's authoritative conference member list (child session ids)
    Error?: string | any;
    RtpSenderStats?: any[];
    RtpReceiverStats?: any[];
    RtpRemoteInboundStats?: any[];
    RtpSenderLevel?: number;
    RtpReceiverLevel?: number;
    QualityToastLastShown?: number;
    NoAnswerTimer?: ReturnType<typeof setTimeout>;
    ExtraInviteHeaders?: { [key: string]: string };
    AllowCallTransfer?: boolean;
    AllowCallConference?: boolean;
    [key: string]: any;
}
```

Open/extensible: carries an index signature `[key: string]: any`. `Events` is the single source of truth for the session activity log.

## BuddyObject interface

A contact/buddy with its contacts, sessions, and message stream. See [BuddyObject](./buddyobject.md) for the per-field table.

<b>Signature:</b>

```typescript
export interface BuddyObject {
    Id: string;
    DisplayName: string;
    Contacts: ContactObject[];
    DisplayNumber?: string;
    Sessions?: SessionObject[];
    Status?: string;
    State?: string;
    Timer?: number;
    WithVideo?: boolean;
    AudioInputDevice?: string;
    AudioOutputDevice?: string;
    VideoInputDevice?: string;
    Missed?: number;
    Selected?: boolean;
    AutoDelete?: boolean;
    isDeleted?: boolean;
    LastActivity?: string;
    MessageStreamItems?: MessageStreamItem[];
    ProfileUserId?: string;
    Email?: string;
    SubscribeState?: string;
    [key: string]: any;
}
```

Open/extensible: carries an index signature `[key: string]: any`.

## MessageType enum

Message-stream item kind. See [MessageType](./messagetype.md).

<b>Signature:</b>

```typescript
export enum MessageType {
    MSG = "MSG",
    CDR = "CDR",
    SYSTEM = "SYSTEM",
}
```

## Direction enum

Call/message direction. See [Direction](./direction.md). (Not tagged `@PhoneAPI`.)

<b>Signature:</b>

```typescript
export enum Direction {
    Inbound = "inbound",
    Outbound = "outbound",
}
```

## MessageDeliveryStatus type

Delivery-status states for an outbound message. See [MessageDeliveryStatus](./messagedeliverystatus.md).

<b>Signature:</b>

```typescript
export type MessageDeliveryStatus =
    | "QUEUED"          // Message is queued locally, not yet sent to the provider
    | "SENT_PENDING"    // Sent to the provider; awaiting provider acknowledgement
    | "SENT_CONFIRMED"  // Provider has acknowledged receipt (new intermediate state)
    | "DELIVERED"       // Delivered to the recipient's device
    | "READ"            // Read by the recipient
    | "FAILED";         // Delivery failed
```

## MessageStreamItem interface

One item (MSG/CDR/SYSTEM) in a buddy's message stream. See [MessageStreamItem](./messagestreamitem.md).

<b>Signature:</b>

```typescript
export interface MessageStreamItem {
    Id: string;
    BuddyId: string;
    Type: "MSG" | "CDR" | "SYSTEM";
    Direction: string;
    Date: string;
    Body: string;
    Tags: string[];
    Reactions: any[];
    Recordings: any[];
    Comments: any[];
    Flagged: boolean;
    Status?: MessageDeliveryStatus;
    [key: string]: any;
}
```

Open/extensible: carries an index signature `[key: string]: any`.

## RecordingObject interface

A call recording record. See [RecordingObject](./recordingobject.md).

<b>Signature:</b>

```typescript
export interface RecordingObject {
    Id: string;
    SessionId: string;
    [key: string]: any;
}
```

Open/extensible: carries an index signature `[key: string]: any`.
