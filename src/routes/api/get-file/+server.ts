// src\routes\api\get-file\+server.ts
import { FTPError, Client } from 'basic-ftp';
import type { RequestHandler } from './$types';
import { Writable } from 'stream';

export const POST: RequestHandler = async ({ request }) => {
	const client = new Client(1500);
	client.ftp.verbose = true;
	let filePath: string;
	try {
		const body = await request.json();
		filePath = body.filePath;
		if (typeof filePath !== 'string') {
			throw new Error('Invalid file path');
		}
	} catch (error) {
		console.error('Error parsing request body:', error);
		return new Response('Invalid JSON in request body', { status: 400 });
	}

	if (!filePath) {
		return new Response('File path is required', { status: 400 });
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

		console.log(`Retrieving file: ${filePath}`);
		let fileContent = '';
		const writable = new Writable({
			write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
				fileContent += chunk.toString();
				callback();
			}
		});

		await client.downloadTo(writable, filePath);
		console.log('Successfully retrieved file');

		return new Response(fileContent, {
			status: 200,
			headers: { 'Content-Type': 'text/plain' }
		});
	} catch (err) {
		try {
			console.log('Attempting to connect to FTP server...');
			await client.access({
				host: import.meta.env.VITE_FTP_HOST_2,
				port: parseInt(import.meta.env.VITE_FTP_PORT),
				user: import.meta.env.VITE_FTP_USER,
				password: import.meta.env.VITE_FTP_PASSWORD
			});
			console.log('Successfully connected to FTP server');
	
			console.log(`Retrieving file: ${filePath}`);
			let fileContent = '';
			const writable = new Writable({
				write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
					fileContent += chunk.toString();
					callback();
				}
			});
	
			await client.downloadTo(writable, filePath);
			console.log('Successfully retrieved file');
	
			return new Response(fileContent, {
				status: 200,
				headers: { 'Content-Type': 'text/plain' }
			});
		} catch (err) {
			console.error('Error in FTP operation:', err);
			if (err instanceof FTPError) {
				return new Response(`FTP Error: ${err.message}`, { status: 500 });
			}
			const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
			return new Response(`Failed to retrieve file: ${errorMessage}`, { status: 500 });
		} finally {
			client.close();
		}
	} finally {
		client.close();
	}
};
