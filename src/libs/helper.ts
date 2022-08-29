import _ from 'lodash';

export const wait = (ms: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export function nowInMilliseconds(): number {
  return Date.now();
}

// Alias for nowInMillisecond
export function now(): number {
  return nowInMilliseconds();
}

export function nowInSeconds(): number {
  return Math.floor((nowInMilliseconds() / 1000)) | 0;
}

export function secondsToHms(d) {
  d = Number(d);
  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);
  let s = Math.floor((d % 3600) % 60);

  let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
  let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
  let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
  return hDisplay + mDisplay + sDisplay;
}

export function formatLocalDate(timestamp: number, locales = 'VN') {
  return new Date(timestamp * 1000).toLocaleString(locales);
}

export function convertUnixTimestampToDate(timestamp: number){
  if (Number.isNaN(timestamp) || isNaN(timestamp) || timestamp === 0) {
    return new Date();
  }
  return new Date(timestamp * 1000);
}

export function theBeginOfToday() {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getCurrentISODateWithoutTime() {
  return new Date().toISOString().substring(0, 10);
}

/**
  * Convert an array to an hashmap to lookup `key` quickly
  * @param collections The collection to parse hashmap
  * @param key The field will be the key for hashmap lookup
  * @returns an object will be used similar to a hashmap
*/
export function toMap<T>(collections: T[], key: string): {[k: string]: T} {
  return collections.reduce((memo, item) => {
    memo[item[key]] = item;
    return memo;
  }, {});
}
