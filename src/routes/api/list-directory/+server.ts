// src\routes\api\list-directory\+server.ts
import { FTPError, Client } from 'basic-ftp';

export async function POST({ request }) {
	const client = new Client();
	client.ftp.verbose = true;

	let directory;
	try {
		({ directory } = await request.json());
	} catch (error) {
		console.error('Error parsing request body:', error);
		return new Response('Invalid JSON in request body', { status: 400 });
	}

	if (!directory) {
		return new Response('Directory is required', { status: 400 });
	}

	try {
		console.log('Attempting to connect to FTP server...');
		await client.access({
			host: import.meta.env.VITE_FTP_HOST,
			port: parseInt(import.meta.env.VITE_FTP_PORT),
			user: import.meta.env.VITE_FTP_USER,
			password: import.meta.env.VITE_FTP_PASSWORD
		});
		console.log('Successfully connected to FTP server');

		console.log(`Listing directory: ${directory}`);
		const fileList = await client.list(directory);
		console.log('Successfully listed directory');

		return new Response(JSON.stringify(fileList), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Error in FTP operation:', err);
		if (err instanceof FTPError) {
			return new Response(`FTP Error: ${err.message}`, { status: 500 });
		}
		return new Response(`Failed to list files: ${err}`, { status: 500 });
	} finally {
		client.close();
	}
}
// good
