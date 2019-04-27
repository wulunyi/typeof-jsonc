import { tokenize } from 'esprima';

export function format(content: string): string {
  try {
    const tokens = tokenize(content, { range: true });
    let result = content;

    // 在原来的基础上偏移量
    let offset = 0;

    tokens.forEach(item => {
      if (item.type === 'String' || item.type === 'Identifier') {
        let [start, end] = item.range;
        start += offset;
        end += offset;

        const value = item.value;

        const singleQReg = /^'(.+)'$/;
        const doubleQReg = /^"(.+)"$/;

        if (singleQReg.test(value)) {
          result = `${result.slice(0, start)}"${value.slice(
            1,
            -1,
          )}"${result.slice(end)}`;
        } else if (!singleQReg.test(value) && !doubleQReg.test(value)) {
          result = `${result.slice(0, start)}"${value}"${result.slice(end)}`;

          offset += 2;
        }
      }
    });

    return result;
  } catch (error) {
    return content;
  }
}
