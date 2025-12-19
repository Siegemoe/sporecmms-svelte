import { fail } from '@sveltejs/kit';
import { getPrisma } from '$lib/server/prisma';
import type { Actions } from './$types';

export const actions: Actions = {
    joinWaitlist: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email') as string;

        if (!email || !email.includes('@')) {
            return fail(400, { email, error: 'Please enter a valid email address.' });
        }

        try {
            const prisma = await getPrisma();
            await prisma.waitlist.create({
                data: { email }
            });
            return { success: true };
        } catch (error: any) {
            // Unique constraint violation (P2002) means already subscribed
            if (error.code === 'P2002') {
                return { success: true }; // Silently succeed to prevent enumeration
            }
            console.error('Waitlist error:', error);
            return fail(500, { email, error: 'Something went wrong. Please try again.' });
        }
    }
};