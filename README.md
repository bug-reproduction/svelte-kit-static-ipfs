# Step to reproduce

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
