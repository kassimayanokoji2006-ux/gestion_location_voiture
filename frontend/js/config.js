
const apiConfiguree = document
  .querySelector('meta[name="autoloc-api-url"]')
  ?.content.trim();
const hoteLocal = ["", "localhost", "127.0.0.1"].includes(location.hostname);

export const API_URL = (
  apiConfiguree ||
  (hoteLocal ? "http://127.0.0.1:8000/api" : `${location.origin}/api`)
).replace(/\/+$/, "");