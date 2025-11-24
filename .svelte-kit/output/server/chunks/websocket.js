import { w as writable } from "./index2.js";
const initialState = {
  isConnected: false,
  messages: [],
  error: null,
  orgId: null
};
const wsStore = writable(initialState);
export {
  wsStore as w
};
