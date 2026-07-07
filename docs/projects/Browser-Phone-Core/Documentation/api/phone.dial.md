[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.Dial() method

Dials a call to the given param. Works with or without await.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
Dial(param: string | BuddyObject, withVideo?: boolean, provider?: string): Promise<string | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  param | string \| [BuddyObject](./buddyobject.md) | The dial target: a dial string (e.g. <code>"*65"</code>), a <code>BuddyObject</code>, or a buddyId. |
|  withVideo | boolean | <i>(Optional)</i> If true, the call is placed as a video call. Defaults to <code>false</code>. |
|  provider | string | <i>(Optional)</i> The provider to use, only applied when no buddy is found. Defaults to <code>"sip"</code>. |

<b>Returns:</b>

Promise&lt;string \| undefined&gt;

The sessionId when awaited, or undefined if dialing failed or the param was invalid.

## Remarks

Resolves the param in order: first as a buddyId (via `phone.GetBuddyById`), then as a contact number of an existing buddy (via `phone.GetBuddyByContact`), and otherwise creates a temporary buddy (via `phone.CreateValidBuddy`) that is pushed onto `phone.MyBuddies`. It then delegates to `phone.OnVideoCall` or `phone.OnAudioCall` depending on `withVideo`, and returns the resulting session's Id.

## Example

```typescript
phone.Dial("*65");                       // fire and forget
const sessionId = await phone.Dial("*65"); // dial and get sessionId
phone.Dial("*65", true);                 // video call
phone.Dial("*65", false, "teams");       // dial using Teams provider
phone.Dial(buddyObject);                 // dial using a buddy object
```
