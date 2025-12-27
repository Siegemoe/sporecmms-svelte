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
    const headers = new Headers();
    headers.set("Location", "/auth/login");
    const secure = "";
    headers.append(
      "Set-Cookie",
      `spore_session=; Path=/; HttpOnly; SameSite=Strict;${secure} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
    return new Response(null, {
      status: 303,
      headers
    });
  }
};
export {
  actions
};
