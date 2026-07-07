[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetSessions() function

Returns all sessions across every buddy.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.GetSessions(): SessionObject[];
```

<b>Returns:</b>

SessionObject[]

Every session found on `phone.MyBuddies[].Sessions`, collected into a flat array.

## Example

```typescript
phone.GetSessions();               // return all sessions
const sessions = phone.GetSessions(); // get all sessions
```
