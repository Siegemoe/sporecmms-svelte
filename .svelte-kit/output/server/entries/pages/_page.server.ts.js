import { f as fail } from "../../chunks/index.js";
import { g as getPrisma } from "../../chunks/prisma.js";
const actions = {
  joinWaitlist: async ({ request }) => {
    const data = await request.formData();
    const email = data.get("email");
    const name = data.get("name");
    const company = data.get("company");
    const role = data.get("role");
    const phone = data.get("phone");
    if (!email || !email.includes("@")) {
      return fail(400, { email, name, company, role, phone, error: "Please enter a valid email address." });
    }
    if (!name) {
      return fail(400, { email, name, company, role, phone, error: "Name is required." });
    }
    try {
      const prisma = await getPrisma();
      await prisma.waitlist.create({
        data: {
          email,
          name: name?.trim() || null,
          company: company?.trim() || null,
          role: role?.trim() || null,
          phone: phone?.trim() || null
        }
      });
      return { success: true };
    } catch (error) {
      if (error.code === "P2002") {
        return { success: true };
      }
      console.error("Waitlist error:", error);
      return fail(500, { email, name, company, role, phone, error: "Something went wrong. Please try again." });
    }
  }
};
export {
  actions
};
