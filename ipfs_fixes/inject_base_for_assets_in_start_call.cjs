const fs = require('fs');
const path = require('path');
const { traverse, slash } = require('./lib.cjs');

function inject_base_for_assets_in_start_call(pages) {
	// get all page's index.html
	const pageIndexes = traverse(pages).filter((file) => file.name === 'index.html');

	for (const page of pageIndexes) {
		const indexHTMLPath = path.join(pages, page.relativePath);
		const indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

		const pageIndexHTMLURLPath = slash(page.relativePath);
		const pageURLPath = path.dirname(pageIndexHTMLURLPath);
		let numSegment = 0;
		let baseHref = '.';
		if (pageURLPath != '' && pageURLPath != '.' && pageURLPath != './') {
			const numSlashes = pageURLPath.split('/').length - 1;
			numSegment++;
			baseHref = '..';
			for (let i = 0; i < numSlashes; i++) {
				baseHref += '/..';
				numSegment++;
			}
		}

		const newIndexHTMLContent = indexHTMLContent.replace(
			'assets: "",',
			// `assets: location.pathname + "${baseHref}",`
			`assets: location.pathname.split('/').slice(0, -"${baseHref}".split('..').length).join('/'),`
		);

		fs.writeFileSync(indexHTMLPath, newIndexHTMLContent);
	}
}

module.exports = {
	inject_base_for_assets_in_start_call
};

if (require.main === module) {
	// TODO: argument
	inject_base_for_assets_in_start_call('build');
}
