import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateResetToken, resetPassword } from '$lib/server/auth';
import { SecurityManager } from '$lib/server/security';
import { passwordResetSchema } from '$lib/validation';

export const load: PageServerLoad = async ({ params }) => {
	const { token } = params;

	// Validate the token
	const user = await validateResetToken(token);

	if (!user) {
		return {
			token: null,
			error: 'This reset link is invalid or has expired. Please request a new one.'
		};
	}

	return {
		token,
		email: user.email
	};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		const security = SecurityManager.getInstance();
		const clientIP = getClientAddress();

		try {
			const formData = await request.formData();
			const token = formData.get('token') as string;
			const password = formData.get('password') as string;
			const confirmPassword = formData.get('confirmPassword') as string;

			// Validate input
			const validationResult = passwordResetSchema.safeParse({
				token,
				password,
				confirmPassword
			});

			if (!validationResult.success) {
				const errors: Record<string, string> = {};
				validationResult.error.issues.forEach((issue) => {
					const key = issue.path[0] as string;
					errors[key] = issue.message;
				});

				return fail(400, {
					errors,
					token
				});
			}

			// Reset the password
			const user = await resetPassword(token, password);

			// Log successful password reset
			await security.logEvent('PASSWORD_RESET_COMPLETED', clientIP, {
				userId: user.id,
				email: user.email
			});

			return {
				success: true,
				message: 'Password reset successfully'
			};

		} catch (error) {
			console.error('Password reset error:', error);

			// Log the error
			await security.logEvent('PASSWORD_RESET_ERROR', clientIP, {
				error: error instanceof Error ? error.message : 'Unknown error'
			});

			return fail(500, {
				errors: {
					general: 'An error occurred while resetting your password. Please try again.'
				}
			});
		}
	}
};