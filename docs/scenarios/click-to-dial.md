[Docs](../README.md) › Scenarios › Click-to-dial

# Click-to-dial: call the numbers on your page

Turn every `tel:` link on a page into a call through the phone, instead of handing it to the
operating system.

```html
<a href="tel:+15551234567">+1 (555) 123-4567</a>
<a href="tel:2001">Reception, ext. 2001</a>
```

```js
document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="tel:"]');
    if (!link) return;
    e.preventDefault();

    // "tel:+1-555-123-4567;ext=12" -> "+1-555-123-4567"
    const number = decodeURIComponent(link.getAttribute("href").slice(4)).split(";")[0];
    phone.Dial(number);
});
```

One listener on the document covers every link, including ones added to the page later.

You do not need to clean the number up. The SDK strips the formatting a written number carries
(spaces, brackets, dashes, dots) and keeps the digits, `+`, `*` and `#`. A number with letters in
it is a different case; see [`EnableAlphanumericDial`](../reference/settings.md#calls).

## With the embedded phone

When the phone is the [embedded Browser Phone](../getting-started/iframe-phone.md), the SDK lives
inside the iframe. Reach it through the frame:

```js
const phone = document.getElementById("phoneFrame").contentWindow.phone;
```

The rest of the listener is the same, and the call appears in the embedded phone's own call screen.

## Before the phone is ready

A click that arrives before `phone.Init()` has run finds no `phone.Dial`. Guard it, and tell the
user rather than doing nothing:

```js
if (typeof phone.Dial !== "function") return alert("The phone is still starting.");
```

Once `phone.Init()` has run, a click works even while the phone is still registering: the call
waits for the connection and goes out as soon as it is ready.

## See also

- [Calls: placing a call](../reference/calls.md#placing-a-call).
