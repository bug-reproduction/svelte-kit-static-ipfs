export const load = async ({ fetch }: WindowOrWorkerGlobalScope) => {
	const response = await fetch(`/api/posts`);
	const posts = await response.json();

	return {
		posts
	};
};
