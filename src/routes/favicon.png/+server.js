import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const GET = async () => {
	try {
		const file = fs.readFileSync(path.join(process.cwd(), 'static/favicon.png'));
		return new Response(file, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=31536000'
			}
		});
	} catch (e) {
		throw error(404, 'Not found');
	}
};