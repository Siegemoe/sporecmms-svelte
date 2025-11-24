import { r as redirect } from "../../chunks/index.js";
import { b as building } from "../../chunks/environment.js";
const load = async ({ locals }) => {
  if (building) {
    return {};
  }
  if (locals.user) {
    throw redirect(302, "/dashboard");
  }
  throw redirect(302, "/auth/login");
};
export {
  load
};
