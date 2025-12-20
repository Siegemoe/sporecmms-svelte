import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';
import { verifyPassword } from '$lib/server/auth';
import { getPrisma } from '$lib/server/prisma';
import { z } from 'zod';

export const load: PageServerLoad = async () => {
	// Just render the page
	return {};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		const clientIP = getClientAddress();

		try {
			// For now, skip rate limiting to isolate the issue
			// const security = SecurityManager.getInstance();
			// const isBlocked = await security.isIPBlocked(clientIP);
			// if (isBlocked.blocked) {
			// 	await security.logEvent('PASSWORD_RESET_BLOCKED', clientIP, {
			// 		reason: isBlocked.reason
			// 	});
			// 	return fail(429, { error: 'Too many requests. Please try again later.' });
			// }
			//
			// // Apply rate limiting
			// await security.checkRateLimit(clientIP, SECURITY_RATE_LIMITS.PASSWORD_RESET);

			// Parse form data
			const formData = await request.formData();
			const email = formData.get('email') as string;
			const passphrase = formData.get('passphrase') as string;

			// Validate input inline
			const requestSchema = z.object({
				email: z.string().email('Please enter a valid email address'),
				passphrase: z.string().min(1, 'Passphrase is required')
			});

			const validationResult = requestSchema.safeParse({
				email,
				passphrase
			});

			if (!validationResult.success) {
				// await security.logEvent('PASSWORD_RESET_FAILED', clientIP, {
				// 	reason: 'Invalid input',
				// 	errors: validationResult.error.errors
				// });
				return fail(400, {
					errors: validationResult.error.errors.reduce((acc, error) => {
						const key = error.path[0] as string;
						acc[key] = error.message;
						return acc;
					}, {} as Record<string, string>)
				});
			}

			// Get database client
			const prisma = await getPrisma();

			// Find user and check if they have a recovery passphrase
			const user = await prisma.user.findUnique({
				where: { email },
				select: {
					id: true,
					email: true,
					recoveryPassphrase: true
				}
			});

			// Don't reveal if user exists or has passphrase
			if (!user || !user.recoveryPassphrase) {
				// await security.logEvent('PASSWORD_RESET_FAILED', clientIP, {
				// 	email,
				// 	reason: 'Invalid email or no passphrase set'
				// });
				return {
					success: false,
					message: 'If the email exists and has a recovery passphrase, a reset link has been sent.'
				};
			}

			// Verify the passphrase
			const isValidPassphrase = await verifyPassword(passphrase, user.recoveryPassphrase);

			if (!isValidPassphrase) {
				// await security.logEvent('PASSWORD_RESET_FAILED', clientIP, {
				// 	userId: user.id,
				// 	email,
				// 	reason: 'Invalid passphrase'
				// });
				return {
					success: false,
					message: 'If the email exists and has a recovery passphrase, a reset link has been sent.'
				};
			}

			// Generate secure reset token
			const resetToken = crypto.randomUUID();
			const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

			// Update user with reset token
			await prisma.user.update({
				where: { id: user.id },
				data: {
					passwordResetToken: resetToken,
					passwordResetExpiresAt: expiresAt
				}
			});

			// Log successful reset initiation
			// await security.logEvent('PASSWORD_RESET_INITIATED', clientIP, {
			// 	userId: user.id,
			// 	email
			// });

			// In production, this would typically be sent via email
			// For now, redirect to the reset page with the token
			const resetUrl = `/auth/reset-password/${resetToken}`;

			return {
				success: true,
				resetToken,
				resetUrl,
				message: 'Password reset token generated successfully'
			};

		} catch (error) {
			console.error('Emergency password reset error:', error);

			// Log the error
			// await security.logEvent('PASSWORD_RESET_ERROR', clientIP, {
			// 	error: error instanceof Error ? error.message : 'Unknown error'
			// });

			return fail(500, {
				error: 'An internal error occurred. Please try again later.'
			});
		}
	}
};