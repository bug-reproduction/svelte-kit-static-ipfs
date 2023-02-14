import { base } from '$app/paths';

export function pathname(p: string) {
	let path = `${base}${p}`;
	if (!path.endsWith('/')) {
		path += '/';
	}
	return path;
}

export function isSameURL(a: string, b: string): boolean {
	if (typeof window !== 'undefined' && a.startsWith((window as any).BASE)) {
		return a.replace((window as any).BASE, '') === b;
	} else {
		return a === b;
	}
}

export function isParentURL(a: string, b: string): boolean {
	if (typeof window !== 'undefined' && a.startsWith((window as any).BASE)) {
		return a.replace((window as any).BASE, '').startsWith(b);
	} else {
		return a.startsWith(b);
	}
}
