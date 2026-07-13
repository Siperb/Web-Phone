[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## ReceivedMessage interface

Payload delivered by the SipProvider to phone.OnMessageReceived for an incoming SIP MESSAGE. The first six fields are always present (may be empty strings); the enrichment fields are optional and only populated when the matching SIP header is on the wire, so this consumer degrades gracefully when one is absent.

<b>Signature:</b>

```typescript
export interface ReceivedMessage
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  messageId |  | <code>string</code> |  |
|  from |  | <code>string</code> |  |
|  to |  | <code>string</code> |  |
|  text |  | <code>string</code> |  |
|  timestamp |  | <code>string</code> |  |
|  contentType |  | <code>string</code> |  |
|  displayName |  | <code>string</code> | <i>(Optional)</i> |
|  contactNumber |  | <code>string</code> | <i>(Optional)</i> |
|  contactEmail |  | <code>string</code> | <i>(Optional)</i> |
|  uuid |  | <code>string</code> | <i>(Optional)</i> |
