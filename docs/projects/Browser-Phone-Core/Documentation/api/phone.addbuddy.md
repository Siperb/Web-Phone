[Home](../../../../README.md) &gt; [Browser-Phone-Core](../../../../README.md#browser-phone-core)

## phone.AddBuddy() function

Adds a new buddy to the PhoneAPI buddy list and persists it.

Part of the Phone API (tagged `@PhoneAPI`); listed in [PHONE_API.md](../PHONE_API.md).

<b>Signature:</b>

```typescript
phone.AddBuddy(buddy: BuddyObject): Promise<BuddyObject | void | null>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  buddy | [BuddyObject](./buddyobject.md) | The buddy to add. |

<b>Returns:</b>

Promise&lt;BuddyObject \| void \| null&gt;

The normalized buddy that was added; `null` if a matching buddy already exists (by Id, or by DisplayName with the same contacts); or `undefined` if an error was caught.

## Remarks

Normalizes the input via `phone.CreateValidBuddy` and rejects duplicates. Otherwise it pushes the buddy onto `phone.MyBuddies`, refreshes the buddy list, stage, and UI, persists via `phone.SaveBuddy`, runs temporary-buddy maintenance (`BuddyMaintenance.handleMaxTempBuddies`), and raises the `OnBuddyAdded` event.

## Example

```typescript
const added = await phone.AddBuddy(buddy);
if (added) {
  // buddy was added
}
```
