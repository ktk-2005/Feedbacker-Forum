
# Metaprogramming

The client code supports metaprograms that are run at build time. This allows reading
the build environment and pre-running initialization code from the bundled script.
Webpack is configured to load `.meta.js` files using the [val-loader][gh/val-loader].
`meta/meta-util.js` makes metaprogramming a little more clean.

**Note:** The metaprograms are run with plain Node without Babel, so some features
(most notably ES6 `import`/`export`) are not available in `.meta.js` files.

### Example metaprogram

```js
// example.meta.js

// We can't use ES6 modules in the metaprograms
const meta = require('./meta/meta-util')

// This addition is run at build-time
const value = 5 + 5

// Use meta.json() to create a module with one default JSON export
module.exports = meta.json({ value })
```
This metaprogram is compiled into something like:

```js
module.exports = { value: 10 }
```

The metaprogram result can be included into a runtime client JS file
like any other module.

```js
// example.js

import { value } from './example.meta'
console.log(value)
```

### Metaprogram-to-metaprogram dependencies

If you want to include the result of a metaprogram inside an
another metaprogram a normal `require()` won't work as the output of the
metaprogram is in a Webpack loader intermediate representation. You can
unwrap the result using `meta.eval()`.

```js
// another.meta.js

const meta = require('./meta/meta-util')
const exampleMeta = meta.eval(require('./example.meta'))

// This is logged at build time
console.log('The value is:', exampleMeta.value)
```

[gh/val-loader]: https://github.com/webpack-contrib/val-loader
