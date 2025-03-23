# CLI Keyboard Trainer 

This is a simple keyboard trainer

run `npm start` 

![](screenshot.jpg)

you can disable some characters commenting out stuff:

```js
const charset = [
  ...lowercase,
  ...uppercase,
  ...numbers,
  // ...curlies,
  // ...arrows,
  // ...math,
  // ...punctuation,
  // ...quotes,
  // ...pathChars,
  // ...symbols,
];
```