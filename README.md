# typeof-jsonc [![npm version](https://badge.fury.io/js/typeof-jsonc.svg)](https://badge.fury.io/js/typeof-jsonc)

`typeof-jsonc` is a library for Convert json or jsonc string to typescript type (interface)

[Online Playgrounds](http://lanfeng.fun/#/typeofjsonc)

## Support

- Basic types
- Array types (support auto merge)
- Comments
- JsDocComments
- Custom naming
- Json
- Jsonc
- Not standard jsonc or json

## Usage

### install

```
npm install typeof-jsonc -S
```

or

```
yarn add typeof-jsonc -S
```

### Demo

`Jsonc string`

```jsonc
{
  "barr": [
    // aaa
    "aaa",
    "bbb"
  ],
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
  ],
  "a": "hello",
  "b": ["a", "b"]
}
```

`Convert script`

```typescript
import fs from 'fs';
import path from 'path';

import { typeofJsonc } from '../src/index';

const text = fs.readFileSync(path.resolve('./demo/test'), {
  encoding: 'utf-8',
});

console.log(
  typeofJsonc(text, 'Response', {
    prefix: 'I',
    rootFlags: 1,
    disallowComments: false,
    addExport: true,
    singleLineJsDocComments: true,
  }),
);
```

`Output`

```typescript
export interface IResponse {
  /**  aaa  */
  barr: string[];
  /**  this is name  */
  name: string;
  /**  this is demo  */
  demo: IDemo;
  /**  this is arr  */
  arr: (IArr | number)[];
  a: string;
  b: string[];
}

/**  this is arr  */
export interface IArr {
  age: number;
}

export interface IDemo {
  hello: string;
}
```

## API

- typeofJsonc(jsonc: string, name: string, options?: Options)

```typescript
interface Options {
  /** type name prefix */
  prefix?: string; // default ''
  /**  customer named */
  onName?: (name: string) => string;
  /** Add export keywords */
  addExport?: boolean; // default false
  /**
   * Identifiers are e.g. legal variable names. They may not be reserved words
   * None = 0,
   * Module = 1,
   * InAmbientNamespace = 2,
   */
  rootFlags?: number; // default 0
  disallowComments?: boolean; // defalut true
  singleLineJsDocComments?: boolean; // default false
}
```

| option                  | type                     | default                              | desc                                                                                                                 |
| ----------------------- | ------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| prefix                  | string                   | ""                                   | type name prefix                                                                                                     |
| onName                  | (name: string) => string | (name: string) => `${prefix}${name}` | Custom naming If this option set prefix will not work                                                                |
| addExport               | boolean                  | false                                | Add export keywords                                                                                                  |
| rootFlags               | number                   | 0                                    | Identifiers are e.g. legal variable names. They may not be reserved words None = 0 Module = 1 InAmbientNamespace = 2 |
| disallowComments        | boolean                  | true                                 | Whether to prohibit the generation of comments                                                                       |
| singleLineJsDocComments | boolean                  | false                                | Single-line display when single-line comment                                                                         |

## Version

### 1.1.6

- Support singleLineJsDocComments options

### 1.1.5

- Not standard jsonc or json

`Standard jsonc or json demo`

```jsonc
{
  "name": "test",
  "age": 13,
  "loves": ["A", "B"]
}
```

`Not standard jsonc or json demo`

```jsonc
{
  "name": "",
  "age": 13,
  "loves": ["A", "B"]
}
```

## License

MIT
