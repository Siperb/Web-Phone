[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## BuddyObject interface

<b>Signature:</b>

```typescript
export interface BuddyObject
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  Id |  | <code>string</code> |  |
|  DisplayName |  | <code>string</code> |  |
|  Contacts |  | <code>ContactObject[]</code> |  |
|  DisplayNumber |  | <code>string</code> | <i>(Optional)</i> |
|  Sessions |  | <code>SessionObject[]</code> | <i>(Optional)</i> |
|  Status |  | <code>string</code> | <i>(Optional)</i> |
|  State |  | <code>string</code> | <i>(Optional)</i> |
|  Timer |  | <code>number</code> | <i>(Optional)</i> |
|  WithVideo |  | <code>boolean</code> | <i>(Optional)</i> |
|  AudioInputDevice |  | <code>string</code> | <i>(Optional)</i> |
|  AudioOutputDevice |  | <code>string</code> | <i>(Optional)</i> |
|  VideoInputDevice |  | <code>string</code> | <i>(Optional)</i> |
|  Missed |  | <code>number</code> | <i>(Optional)</i> |
|  Selected |  | <code>boolean</code> | <i>(Optional)</i> |
|  AutoDelete |  | <code>boolean</code> | <i>(Optional)</i> |
|  isDeleted |  | <code>boolean</code> | <i>(Optional)</i> |
|  LastActivity |  | <code>string</code> | <i>(Optional)</i> |
|  MessageStreamItems |  | <code>MessageStreamItem[]</code> | <i>(Optional)</i> |
|  ProfileUserId |  | <code>string</code> | <i>(Optional)</i> |
|  Email |  | <code>string</code> | <i>(Optional)</i> |
|  SubscribeState |  | <code>string</code> | <i>(Optional)</i> |

## Remarks

Open/extensible: carries an index signature `[key: string]: any`.
