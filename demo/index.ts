import fs from 'fs';
import path from 'path';

import { typeofJsonc } from '../src/index';

const text = fs.readFileSync(path.resolve('./demo/test'), {
    encoding: 'utf-8',
});

/* tslint:disable */
console.log(
    typeofJsonc(text, 'Response', {
        prefix: 'I',
        rootFlags: 0,
        disallowComments: false,
        addExport: true,
        singleLineJsDocComments: true,
    }),
);
