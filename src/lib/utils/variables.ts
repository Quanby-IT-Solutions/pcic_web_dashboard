// src/routes/utils/variables.ts
export const imgDir =
	'https://th.bing.com/th/id/OIP.U1JkFCmFWMcKtiB8yPdWRAHaEE?rs=1&pid=ImgDetMain';

/** @type {(x:string) => string} */
export const avatarPath = (src: string) => imgDir + '/users/' + src;

/** @type {(x:string, ...y:string[]) => string} */
export const imagesPath = (src: string, ...subdirs: string[]) =>
	[imgDir, ...subdirs, src].filter(Boolean).join('/');
