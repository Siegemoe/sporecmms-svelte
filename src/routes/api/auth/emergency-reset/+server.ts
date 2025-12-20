import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';
import { verifyPassword, hashPassword } from '$lib/server/auth';
import { emergencyResetRequestSchema } from '$lib/validation';
import { getPrisma } from '$lib/server/prisma';

export async function POST({ request, getClientAddress }: RequestEvent) {
	const security = SecurityManager.getInstance();
	const clientIP = getClientAddress();

	try {
		// Check if IP is blocked
		const isBlocked = await security.isIPBlocked(clientIP);
		if (isBlocked.blocked) {
			await security.logEvent('PASSWORD_RESET_BLOCKED', clientIP, {
				reason: isBlocked.reason
			});
			return json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
		}

		// Apply rate limiting
		await security.checkRateLimit(clientIP, SECURITY_RATE_LIMITS.PASSWORD_RESET);

		// Parse and validate request body
		const body = await request.json();
		const validationResult = emergencyResetRequestSchema.safeParse(body);

		if (!validationResult.success) {
			await security.logEvent('PASSWORD_RESET_FAILED', clientIP, {
				reason: 'Invalid input',
				errors: validationResult.error.errors
			});
			return json({
				error: 'Invalid input',
				details: validationResult.error.errors.map(e => e.message)
			}, { status: 400 });
		}

		const { email, passphrase } = validationResult.data;

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
			await security.logEvent('PASSWORD_RESET_FAILED', clientIP, {
				email,
				reason: 'Invalid email or no passphrase set'
			});
			return json({
				error: 'If the email exists and has a recovery passphrase, a reset link has been generated.',
				success: false
			}, { status: 200 });
		}

		// Verify the passphrase
		const isValidPassphrase = await verifyPassword(passphrase, user.recoveryPassphrase);

		if (!isValidPassphrase) {
			await security.logEvent('PASSWORD_RESET_FAILED', clientIP, {
				userId: user.id,
				email,
				reason: 'Invalid passphrase'
			});
			return json({
				error: 'If the email exists and has a recovery passphrase, a reset link has been generated.',
				success: false
			}, { status: 200 });
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
		await security.logEvent('PASSWORD_RESET_INITIATED', clientIP, {
			userId: user.id,
			email
		});

		// In production, this would typically be sent via email
		// For now, return the token directly for emergency access
		const isDevelopment = process.env.NODE_ENV !== 'production';

		return json({
			success: true,
			message: 'Password reset token generated successfully',
			// Only include token in development for direct access
			...(isDevelopment && { resetToken, resetUrl: `/auth/reset-password/${resetToken}` })
		});

	} catch (error) {
		console.error('Emergency password reset error:', error);

		// Log the error
		await security.logEvent('PASSWORD_RESET_ERROR', clientIP, {
			error: error instanceof Error ? error.message : 'Unknown error'
		});

		return json({
			error: 'An internal error occurred. Please try again later.'
		}, { status: 500 });
	}
}