# typeof-jsonc

Convert jsonc to type of typescript

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
