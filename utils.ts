export function shuffle<T>(array: Array<T>) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
}

export function isString(s: any): s is string {
  return typeof s === "string";
}

export function isNumber(n: any): n is number {
  return typeof n === "number";
}

export function isUndefined(v: any): v is undefined {
  return typeof v === "undefined";
}

export function isNull(n: any): n is null {
  return typeof n === null;
}

export const emojis = [
    '🍏', 
    '🍎',
    '🍐',
    '🍊',
    '🍋',
    '🍌',
    '🍉',
    '🍇',
    '🍓',
    '🍈',
    '🍒',
    '🍑',
    '🍍',
    '🍅',
    '🍆',
    '🌶',
    '🌽',
    '🥕',
    '🥝',
    '🥑',
    '🥒',
]