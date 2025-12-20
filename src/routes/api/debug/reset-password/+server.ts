import { json } from '@sveltejs/kit';
import { createNodePrismaClient } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';

export const GET = async () => {
    try {
        const prisma = await createNodePrismaClient();
        const email = 'zack@sporecmms.com';
        const newPassword = 'admin123456';

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        return json({ 
            success: true, 
            message: `Password for ${email} reset to ${newPassword}` 
        });
    } catch (error) {
        console.error('Reset error:', error);
        return json({ error: error.message }, { status: 500 });
    }
};
