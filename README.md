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

### API

typeofJsonc(jsonc, name, options)

```
import { typeofJsonc } from 'typeof-jsonc';

typeofJsonc('{"name": 1}', 'IRootType', { rootFlags: 1, disallowComments: false })
```
