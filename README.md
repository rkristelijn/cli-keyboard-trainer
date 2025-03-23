# CLI Keyboard Trainer 

This is a simple keyboard trainer

run `npm start` 

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

```sh
 Type this sequence (arrows included):
   K 9 N a U d 5 Y
K 9 N a U d 5 Y 
 Correct!


 Type this sequence (arrows included):
   x P I 4 f u D J
x P I 4 f u D J 
 Correct!
```