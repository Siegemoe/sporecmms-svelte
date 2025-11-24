import { r as redirect } from "../../../../chunks/index.js";
import { d as destroySession } from "../../../../chunks/auth.js";
const actions = {
  default: async ({ cookies }) => {
    await destroySession(cookies);
    throw redirect(303, "/auth/login");
  }
};
export {
  actions
};
