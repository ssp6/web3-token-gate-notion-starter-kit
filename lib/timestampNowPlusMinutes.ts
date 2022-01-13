export const timestampNowPlusMinutes = (minutes: number) =>
  new Date(new Date().getTime() + 1000 * 60 * minutes).toUTCString()
