[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.OnIncomingCall callback slot

Assignable callback slot the host app sets to receive incoming-call details.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
OnIncomingCall: ((calldetails: { SessionId: string; Time: string; BuddyId: string; CallerId: string; DID: string; Direction: string; WithVideo: boolean }) => void) | null;
```

## Parameters

The assigned handler is invoked with a single `calldetails` object:

|  Field | Description |
|  --- | --- |
|  SessionId | The id of the incoming session. |
|  Time | When the call arrived. |
|  BuddyId | The id of the resolved buddy, if any. |
|  CallerId | The caller's identity. |
|  DID | The dialed number the call came in on. |
|  Direction | The call direction. |
|  WithVideo | Whether the incoming call offers video. |

<b>Returns:</b>

void

## Remarks

`InitSessionCallbacks` initializes the slot to `null` (only when it is not already a function), leaving it for the host app to assign. It is a plain assignable property, not a function the library calls on you: the host sets its own handler and the phone invokes it when a call arrives.

## Example

```typescript
phone.OnIncomingCall = (calldetails) => {
    console.log("Incoming call", calldetails.SessionId, "from", calldetails.CallerId);
};
```
