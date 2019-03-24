import * as fs from 'fs';
import * as path from 'path';

import { typeofJsonc } from '../src/index';

const text = fs.readFileSync(path.resolve('./demo/test.jsonc'), {
  encoding: 'utf-8',
});

/* tslint:disable */
console.log(
  typeofJsonc(text, 'IResponse', {
    prefix: 'I',
    rootFlags: 1,
    disallowComments: false,
    addExport: true,
  }),
);
