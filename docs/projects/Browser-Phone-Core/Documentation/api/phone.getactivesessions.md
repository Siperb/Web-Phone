[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.GetActiveSessions() method

Returns all active sessions across every buddy.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
GetActiveSessions(): SessionObject[];
```

<b>Returns:</b>

SessionObject[]

Every session found on `phone.MyBuddies[].Sessions`, collected into a flat array.

## Example

```typescript
phone.GetActiveSessions();               // return all active sessions
const sessions = phone.GetActiveSessions(); // get all active sessions
```
