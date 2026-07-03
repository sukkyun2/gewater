#!/usr/bin/env node
// Static site generator for the gewater.co.kr clone.
// Reads build/partials + build/content + build/pages.json and writes flat
// .html files into the project root. Not part of the shipped deliverable.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARTIALS = path.join(__dirname, 'partials');
const CONTENT = path.join(__dirname, 'content');

const read = (p) => fs.readFileSync(p, 'utf8');

const pages = JSON.parse(read(path.join(__dirname, 'pages.json')));

// Original PHP route -> flat output filename
const ROUTE_MAP = {
  '/default/index.php': 'index.html',
  '/default/m01/p01.php?sub=01': 'company-greeting.html',
  '/default/m01/p02.php?sub=02': 'company-location.html',
  '/default/m02/p01.php?sub=01': 'water-mgmt-wastewater.html',
  '/default/m02/p02.php?sub=02': 'water-mgmt-sewage.html',
  '/default/m02/p03.php?sub=03': 'water-mgmt-septic.html',
  '/default/m03/p01.php?sub=01': 'construction-wastewater.html',
  '/default/m03/p02.php?sub=02': 'construction-sewage.html',
  '/default/m03/p03.php?sub=03': 'construction-livestock.html',
  '/default/m04/p01.php?sub=01': 'consulting-permit.html',
  '/default/m04/p02.php?sub=02': 'consulting-technical.html',
  '/default/m05/p01.php?sub=01': 'contact.html',
  '/default/m05/p02.php?sub=02': 'notice.html',
  '/default/m05/p03.php?sub=03': 'gallery.html',
  '/default/m06/p01.php?sub=01': 'privacy-policy.html',
  '/default/m06/p02.php?sub=02': 'privacy-collection.html',
};

// Which of the 5 top-level nav groups each page belongs to (null = none, e.g. index/privacy pages)
const NAV_GROUP = {
  'company-greeting.html': 1, 'company-location.html': 1,
  'water-mgmt-wastewater.html': 2, 'water-mgmt-sewage.html': 2, 'water-mgmt-septic.html': 2,
  'construction-wastewater.html': 3, 'construction-sewage.html': 3, 'construction-livestock.html': 3,
  'consulting-permit.html': 4, 'consulting-technical.html': 4,
  'contact.html': 5, 'notice.html': 5, 'gallery.html': 5,
};

function rewriteUrls(html) {
  let out = html;
  // Asset path prefixes
  out = out.replace(/\/default\/img\/gewater\/css\//g, 'assets/css/');
  out = out.replace(/\/default\/img\/gewater\/js\//g, 'assets/js/');
  out = out.replace(/\/default\/img\/gewater\/img\//g, 'assets/img/');
  out = out.replace(/\/default\/img\/gewater\/font\//g, 'assets/font/');
  // Internal page routes (longest keys first so query-string variants match before bare paths)
  for (const [from, to] of Object.entries(ROUTE_MAP)) {
    out = out.split(from).join(to);
  }
  // Drop the admin login link target (kept as inert anchor)
  out = out.replace(/href="\/default\/m06\/p03\.php\?sub=03"/g, 'href="#"');
  return out;
}

// The flat href each top-level nav group's own link points to (its first sub-item).
const GROUP_START_HREF = [
  'company-greeting.html',      // group 1: 회사소개
  'water-mgmt-wastewater.html', // group 2: 수질관리대행
  'construction-wastewater.html', // group 3: 수처리시설공사
  'consulting-permit.html',     // group 4: 환경컨설팅
  'contact.html',               // group 5: 문의하기
];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Resets every "on" class, then re-applies it correctly: the top-level link of the
// current page's own group, plus the specific sub-item link matching currentFile.
// (The original site's own logic highlights by matching ?sub= number across ALL
// groups regardless of module, e.g. visiting any "sub=02" page lights up the 2nd
// item in every group -- a template quirk, not intentional. We fix it here.)
function setActiveNavHeader(navHtml, currentFile, currentGroup) {
  let out = navHtml.replace(/<li class="on">/g, '<li class="">');
  if (!currentGroup) return out;

  const startMarkers = GROUP_START_HREF.map((href) => `<li class=""><a href="${href}">`);
  const splitRe = new RegExp(`(?=${startMarkers.map(escapeRe).join('|')})`);
  const segments = out.split(splitRe);

  const groupIdx = segments.findIndex((seg) => seg.startsWith(startMarkers[currentGroup - 1]));
  if (groupIdx === -1) return out;

  let segment = segments[groupIdx];
  // Mark the top-level link "on"
  segment = segment.replace(startMarkers[currentGroup - 1], `<li class="on"><a href="${GROUP_START_HREF[currentGroup - 1]}">`);
  // Mark the matching sub-item "on"
  const subRe = new RegExp(`<li class="">(<a href="${escapeRe(currentFile)}">)`);
  segment = segment.replace(subRe, `<li class="on">$1`);
  segments[groupIdx] = segment;

  return segments.join('');
}

// The sitemap overlay has no top-level link (group headers are plain <h2>), so it
// only needs the one matching sub-item marked "on".
function setActiveSitemap(sitemapHtml, currentFile) {
  let out = sitemapHtml.replace(/<li class="on">/g, '<li class="">');
  const subRe = new RegExp(`<li class="">(<a href="${escapeRe(currentFile)}">)`);
  out = out.replace(subRe, `<li class="on">$1`);
  return out;
}

const headerRaw = read(path.join(PARTIALS, 'header.html'));
const sitemapRaw = read(path.join(PARTIALS, 'sitemap.html'));
const footerRaw = read(path.join(PARTIALS, 'footer.html'));

const SCRIPTS = `    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>
    <script src="assets/js/jquery-ui.js"></script>
    <script src="assets/js/common.js"></script>
`;

let count = 0;
for (const page of pages) {
  const contentPath = path.join(CONTENT, page.slug + '.html');
  if (!fs.existsSync(contentPath)) {
    throw new Error(`Missing content fragment for slug "${page.slug}" at ${contentPath}`);
  }
  const rawContent = read(contentPath);

  let header = rewriteUrls(headerRaw);
  let sitemap = rewriteUrls(sitemapRaw);
  let footer = rewriteUrls(footerRaw);
  let content = rewriteUrls(rawContent);

  const currentGroup = NAV_GROUP[page.file] || null;
  header = setActiveNavHeader(header, page.file, currentGroup);
  sitemap = setActiveSitemap(sitemap, page.file);

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${page.title}</title>

    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel/slick/slick.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel/slick/slick-theme.css">
    <link rel="stylesheet" href="assets/css/common.css">
    <link rel="stylesheet" href="assets/css/formmail.css">
    <link rel="stylesheet" href="assets/css/board-widgets.css">

    <meta name="description" content="${page.description}">
    <meta name="keywords" content="${page.keywords}">
</head>
<body>
${header}
${sitemap}
<main id="main">
${content}
</main>
${footer}
${SCRIPTS}</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, page.file), html, 'utf8');
  count++;
}

console.log(`Built ${count} pages into ${ROOT}`);
