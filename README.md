# typeof-jsonc

Convert jsonc to type of typescript

[online convert](http://47.94.138.91/#/typeofjsonc)

## use

### install

```
npm install typeof-jsonc -S
```

or

```
yarn add typeof-jsonc -S
```

### demo

```
import * as fs from 'fs';
import * as path from 'path';

import { typeofJsonc } from '../src/index';

const text = fs.readFileSync(path.resolve('./demo/test.jsonc'), {
  encoding: 'utf-8',
});

console.log(
  typeofJsonc(text, 'IResponse', { rootFlags: 1, disallowComments: false }),
);

```

test.jsonc

```jsonc
{
  "name": "lanfeng", // this is name
  // this is demo
  "demo": {
    "hello": "world"
  },
  /** this is arr */
  "arr": [
    {
      "age": 1
    },
    2
  ]
}
```

the result

```
interface Demo {
    hello: string;
}


/**
 * this is arr
 */
interface Arr {
    age: number;
}


interface IResponse {
    /**
     * this is name
     */
    name: string;
    /**
     * this is demo
     */
    demo: Demo;
    /**
     * this is arr
     */
    arr: (Arr | number)[];
}
```

## API

### typeofJsonc(jsCode: string, name: string, options?: Options)

```typescript
interface Options {
  /** type name prefix */
  prefix?: string;
  /**  customer named */
  onName?: (name: string) => string;
  /** Add export keywords */
  addExport?: boolean;
}
```
