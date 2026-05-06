const STANDARD_VALUES = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const PREMIUM_VALUES = [3, 3, 3, 3, 3, 4, 4, 4, 4, 4];

function createCardSet(type, values, options = {}) {
  const moonIndexes = new Set(options.moonIndexes || []);
  const chiefIndexes = new Set(options.chiefIndexes || []);
  const allChiefs = Boolean(options.allChiefs);

  return values.map((value, index) => ({
    id: `${type}-${index}`,
    type,
    value,
    moon: moonIndexes.has(index),
    chief: allChiefs || chiefIndexes.has(index),
  }));
}

export const cards = [
  ...createCardSet("sorciere", STANDARD_VALUES, {
    moonIndexes: [2],
    chiefIndexes: [9],
  }),
  ...createCardSet("vampire", PREMIUM_VALUES, {
    moonIndexes: [5],
  }),
  ...createCardSet("squelette", STANDARD_VALUES, {
    moonIndexes: [9],
    chiefIndexes: [0],
  }),
  ...createCardSet("loup", STANDARD_VALUES, {
    moonIndexes: [8],
    chiefIndexes: [2],
  }),
  ...createCardSet("zombie", STANDARD_VALUES, {
    chiefIndexes: [0, 2, 4, 6, 8],
  }),
  ...createCardSet("reflet", PREMIUM_VALUES, {
    moonIndexes: [5],
    chiefIndexes: [7],
  }),
  ...createCardSet("banshee", STANDARD_VALUES, {
    chiefIndexes: [6],
  }),
  ...createCardSet("blob", STANDARD_VALUES, {
    moonIndexes: [6],
    chiefIndexes: [9],
  }),
  ...createCardSet("diable", PREMIUM_VALUES),
  ...createCardSet("momie", STANDARD_VALUES, {
    moonIndexes: [7],
    chiefIndexes: [9],
  }),
  ...createCardSet("idole", PREMIUM_VALUES, {
    chiefIndexes: [1, 3, 5, 7, 9],
  }),
];
