import { mockApi } from "./mockApi.js";
import { realApi } from "./realApi.js";

export const USE_MOCK = !import.meta.env.VITE_API_URL;
export const api = USE_MOCK ? mockApi : realApi;
