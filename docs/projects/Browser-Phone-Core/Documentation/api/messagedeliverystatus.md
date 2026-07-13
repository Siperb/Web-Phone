[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## MessageDeliveryStatus type

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

## Remarks

- <code>"QUEUED"</code> — Message is queued locally, not yet sent to the provider.
- <code>"SENT_PENDING"</code> — Sent to the provider; awaiting provider acknowledgement.
- <code>"SENT_CONFIRMED"</code> — Provider has acknowledged receipt (new intermediate state).
- <code>"DELIVERED"</code> — Delivered to the recipient's device.
- <code>"READ"</code> — Read by the recipient.
- <code>"FAILED"</code> — Delivery failed.
