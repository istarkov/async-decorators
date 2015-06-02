export function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

export function getDataAsync(ms = 0, data = null) {
  return new Promise(r => setTimeout(() => r(data), ms));
}

export function getSecondsFromStart(timeStart) {
  return Math.round(((new Date()).getTime() - timeStart) / 1000);
}
