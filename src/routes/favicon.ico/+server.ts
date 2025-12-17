import { redirect } from '@sveltejs/kit';

export const GET = async () => {
	// Redirect to the PNG favicon
	throw redirect(302, '/favicon.png');
};