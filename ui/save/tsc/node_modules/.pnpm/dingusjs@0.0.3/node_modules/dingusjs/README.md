# dingus js

Dingus-js is a record-then-assert test double library for JavaScript and
TypeScript.

It is similar to the Python library [dingus](https://github.com/garybernhardt/dingus).

```node
> const {dingus} = require('dingusjs');
> const d = dingus('root');
> ''+d;
'<Dink(root)>'
> ''+d.foo.bar().baz('Hello', 'world');
'<Dink(root.foo.bar().baz())>'
> d.foo.bar().baz.calls.map(([name, args, result]) => args);
[ [ 'Hello', 'world' ] ]
```

This is not an officially supported Google product.
