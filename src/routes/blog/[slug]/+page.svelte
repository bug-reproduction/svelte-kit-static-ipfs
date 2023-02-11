<script lang="ts">
	export let data: { title: string; date: string; content: ConstructorOfATypedSvelteComponent };
</script>

<article>
	<h1>{data.title}</h1>
	<p>Published: {data.date}</p>
	<svelte:component this={data.content} />
</article>
