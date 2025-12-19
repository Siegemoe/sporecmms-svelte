import { fail } from '@sveltejs/kit';
import { getPrisma } from '$lib/server/prisma';
import type { Actions } from './$types';

export const actions: Actions = {
    joinWaitlist: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const name = data.get('name') as string;
        const company = data.get('company') as string;
        const role = data.get('role') as string;
        const phone = data.get('phone') as string;

        if (!email || !email.includes('@')) {
            return fail(400, { email, name, company, role, phone, error: 'Please enter a valid email address.' });
        }

        if (!name) {
            return fail(400, { email, name, company, role, phone, error: 'Name is required.' });
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
        } catch (error: any) {
            // Unique constraint violation (P2002) means already subscribed
            if (error.code === 'P2002') {
                return { success: true }; // Silently succeed
            }
            console.error('Waitlist error:', error);
            return fail(500, { email, name, company, role, phone, error: 'Something went wrong. Please try again.' });
        }
    }
};
