import type { Data } from './interfaces';

export function mapToObject<V>(
  map?: Map<string | number, V>
): { [key: string]: V } | undefined {
  const obj: { [key: string]: V } = {};
  if (!map) {
    return undefined;
  }
  map.forEach((value, key) => {
    obj[key.toString()] = value;
  });
  return obj;
}

export function convertObject(obj?: {
  [key: string]: Data;
}): { [key: string]: DataView } | undefined {
  if (obj === undefined) {
    return undefined;
  }
  const result: { [key: string]: DataView } = {};
  for (const key of Object.keys(obj)) {
    result[key] = convertValue(obj[key]);
  }
  return result;
}

export function convertValue(value?: Data): DataView {
  if (typeof value === 'string') {
    return hexStringToDataView(value);
  } else if (value === undefined) {
    return new DataView(new ArrayBuffer(0));
  }
  return value;
}

export function hexStringToDataView(value: string): DataView {
  const numbers: number[] = value
    .trim()
    .split(' ')
    .filter((e) => e !== '')
    .map((s) => parseInt(s, 16));
  return numbersToDataView(numbers);
}

export function numbersToDataView(value: number[]): DataView {
  return new DataView(Uint8Array.from(value).buffer);
}

export function dataViewToNumbers(value: DataView): number[] {
  return Array.from(new Uint8Array(value.buffer));
}

export function dataViewToHexString(value: DataView): string {
  return dataViewToNumbers(value)
    .map((n) => {
      let s = n.toString(16);
      if (s.length === 1) {
        s = '0' + s;
      }
      return s;
    })
    .join(' ');
}
