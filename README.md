# Step to reproduce

===> Note with the fixes below, the issues listed here disapear

1. `pnpm i` (install dependencies)
2. `pnpm build` (build a static, pre-rendered website using adapter-static into the "build" folder)
3. `pnpm serve` (serve the "build" folder using an emulator of an ipfs node)

Navigate to http://localhost:8080 and you ll have a perfectly working website

Now navigate to http://localhost:8080/ipfs/whatever/ and you ll notice some issues:

- Home page is not higligthed
- Clicking on "Home" will redirect you to http://localhost:8080/ instead http://localhost:8080/ipfs/whatever/
- Clicking on "About" will redirect you to http://localhost:8080/about/ instead http://localhost:8080/ipfs/whatever/about/
- In the console there are three 404 due to the app trying to fetch images from the root instead of `ipfs/whatever/`
- And if you disable javascript, image do not load

if you navigate http://localhost:8080/ipfs/whatever/about/ directly (hit reload to ensure that) you get these issues :

- Clicking on "Home" will redirect you to http://localhost:8080/ instead http://localhost:8080/ipfs/whatever/
- Clicking on "About" will redirect you to http://localhost:8080/about/ instead http://localhost:8080/ipfs/whatever/about/
- In the console there are two 404 due to the app trying to fetch images from the root instead of `ipfs/whatever/` and this result in both the svelte and github logo to fails to render
- And if you disable javascript, image do not load

There are also issues related to load function (`+server.ts`/`+page.ts`):

if you navigate to http://localhost:8080/ipfs/whatever/blog/2/

- it fails to load the data with a `500`. (note that if you disable javascript, you see the content fine, though images in the header are broken, like mentioned above)

# FIXES

First, every prerender pages need to have paths be relative. sveltekit already know each page's base via `%sveltekit.assets%` (when assets = pages), so it should be able to replace absolute path with their respective relative path. let's call these values RELBASE and RELASSETS respectively from mow on.

And to be clear, here are the expected values:

- for the root index.html, the value would be `.`
- for the blog/index.html, the value would be `..`
- for the blog/1/index.html, the value would be `../..`

this is done via [ipfs_fixes/relativize_pages.cjs](ipfs_fixes/relativize_pages.cjs)

We also need to also relativize call to server function, this is done by [ipfs_fixes/relativize_js.cjs](ipfs_fixes/relativize_js.cjs) but is probably nto full proof right now

At runtime (after hydration), we are in a different context though and we want the base path (from `$app/paths`) to be absolute so it works past navigation.
This applies to both `base` and `assets`. The way to achieve that is to simply set them at runtime, (the most early possible)

For that we use the following: `window.BASE = location.pathname.split('/').slice(0, -"${RELBASE}".split('..').length).join('/');`

This is done via [ipfs_fixes/inject_base.cjs](ipfs_fixes/inject_base.cjs)

This also inject the assets value via

```ts
  start({
    assets: window.BASE,
    env: {},
    ...
  });
```

We also then need to make use of window.BASE in the runtime for the base, which is hardocded in chunks/paths-....js or sometime chunks/singletons-....js

this is done via [ipfs_fixes/inject_base_in_paths_file.cjs](ipfs_fixes/inject_base_in_paths_file.cjs) and [ipfs_fixes/inject_base_in_singletons_file.cjs](ipfs_fixes/inject_base_in_singletons_file.cjs)

But for sveltekit to fix it, best is probably to let `base` be set via the `start` call, like `assets` is currently handled and to ensure that each generated index.html call `start` with the proper value like the following:

```ts
  start({
    assets:location.pathname.split('/').slice(0, -RELASSETS.split('..').length).join('/'),
    base: location.pathname.split('/').slice(0, -RELBASE.split('..').length).join('/'), // this does not exist currently and base is a const in `$app/paths` which causes other issues (it is hardcoded in the generate js files)
    env: {},
    ...
  });
```

## link issues

now it would be great if we could still reference page link using absolute links like `href="/about/"`
but if we have to do the following instead, that is ok : `` href={`${base}/about/`} ``

Unfortunately the latter is not sufficient as vite/sveltekit will hardcode the result at build time to `/about/` because it detect that `base` is a constant.

To avoid that best is to use a function that trick the compiler that it might not always be the same and so we can get aroudn with

```svelte
<a href={`pathname(/about/)`}>About></a>
```

see [src/lib/utils/url.ts](src/lib/utils/url.ts)
