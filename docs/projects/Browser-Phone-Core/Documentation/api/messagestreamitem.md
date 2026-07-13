[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## MessageStreamItem interface

<b>Signature:</b>

```typescript
export interface MessageStreamItem
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  Id |  | <code>string</code> |  |
|  BuddyId |  | <code>string</code> |  |
|  Type |  | <code>"MSG" \| "CDR" \| "SYSTEM"</code> |  |
|  Direction |  | <code>string</code> |  |
|  Date |  | <code>string</code> |  |
|  Body |  | <code>string</code> |  |
|  Tags |  | <code>string[]</code> |  |
|  Reactions |  | <code>any[]</code> |  |
|  Recordings |  | <code>any[]</code> |  |
|  Comments |  | <code>any[]</code> |  |
|  Flagged |  | <code>boolean</code> |  |
|  Status |  | <code>MessageDeliveryStatus</code> | <i>(Optional)</i> |

## Remarks

Open/extensible: carries an index signature `[key: string]: any`.
