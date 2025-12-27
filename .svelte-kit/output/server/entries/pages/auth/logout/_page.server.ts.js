import { i as initEnvFromEvent, g as getPrisma } from "../../../../chunks/prisma.js";
const actions = {
  default: async (event) => {
    initEnvFromEvent(event);
    const sessionId = event.cookies.get("spore_session");
    if (sessionId) {
      const client = await getPrisma();
      await client.session.delete({ where: { id: sessionId } }).catch(() => {
      });
    }
    event.cookies.delete("spore_session", { path: "/" });
    return new Response(null, {
      status: 303,
      headers: { Location: "/auth/login" }
    });
  }
};
export {
  actions
};
