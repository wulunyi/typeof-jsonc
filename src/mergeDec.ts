import * as dtsDom from 'dts-dom';
import { topItem } from './helper';
import MapSet from './mapSet';

export function mergeInterfaceDec(
  dtsList: dtsDom.InterfaceDeclaration[],
  name?: string,
) {
  if (dtsList.length === 0) {
    throw new Error('dtsList not allow empty');
  }

  if (dtsList.length === 1) {
    return topItem(dtsList);
  }

  const pMapSet = new MapSet<dtsDom.PropertyDeclaration>();
  const pNameSet = new Set();

  dtsList.forEach(dts =>
    dts.members.forEach(p => {
      // 只对属性做处理
      if (p.kind === 'property') {
        pNameSet.add(p.name);
        pMapSet.add(p.name, p);
      }
    }),
  );

  const iResult = dtsDom.create.interface(name || topItem(dtsList).name);

  [...pNameSet].forEach(pName => {
    const pArr = pMapSet.get(pName);
    const mergedP = mergePropertyDec(pArr, pName);

    if (pArr.length !== dtsList.length) {
      mergedP.flags = dtsDom.DeclarationFlags.Optional;
    }

    iResult.members.push(mergedP);
  });

  return iResult;
}

/**
 * merge same name PropertyDeclaration
 * @param dtsList PropertyDeclaration[]
 */
export function mergePropertyDec(
  dtsList: dtsDom.PropertyDeclaration[],
  name?: string,
): dtsDom.PropertyDeclaration {
  if (dtsList.length === 0) {
    throw new Error('dtsList not allow empty');
  }

  if (dtsList.length === 1) {
    return topItem(dtsList);
  }

  const typeSet = new Set();
  const jsDocSet = new Set();
  const flagsSet = new Set();

  dtsList.forEach(dts => {
    if (dts.flags) {
      flagsSet.add(dts.flags);
    }

    if (dts.jsDocComment) {
      jsDocSet.add(dts.jsDocComment);
    }
    typeSet.add(dts.type);
  });

  let ptype: dtsDom.Type = dtsDom.type.any;

  if (typeSet.size === 1) {
    ptype = topItem([...typeSet]);
  } else if (typeSet.size > 1) {
    ptype = dtsDom.create.union([...typeSet]);
  }

  const pResult = dtsDom.create.property(name || topItem(dtsList).name, ptype);

  if (jsDocSet.size > 0) {
    pResult.jsDocComment = [...jsDocSet].join('\n');
  }

  if (flagsSet.size > 0) {
    pResult.flags = [...flagsSet].pop();
  }

  return pResult;
}
