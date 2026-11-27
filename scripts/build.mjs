// Bina index.html (satu fail, sedia untuk GitHub Pages) daripada src/. Tiada pakej luaran: node scripts/build.mjs
// Builds index.html (single file, ready for GitHub Pages) from src/. No dependencies: node scripts/build.mjs
//
// Jika vendor/three.r128.min.js dan src/fonts/baloo2.css ada, semuanya dibenam ke dalam fail dan
// polisi keselamatan kandungan (CSP) menyekat semua sambungan keluar, seperti Pulau Ilmu.
// Jika tiada, Three.js dimuat dari CDN dan fon dari Google Fonts.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const between = (s, a, b, rep) => {
  const i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < 0) throw new Error('Penanda tiada: ' + a);
  return s.slice(0, i) + rep + s.slice(j + b.length);
};

let out = readFileSync(join(src, 'index.html'), 'utf8');
const css = readFileSync(join(src, 'style.css'), 'utf8');
const files = readdirSync(join(src, 'js')).filter(f => f.endsWith('.js')).sort();
const js = files.map(f => `/* ===== src/js/${f} ===== */\n` + readFileSync(join(src, 'js', f), 'utf8')).join('\n');

const fontFile = join(src, 'fonts', 'baloo2.css'), threeFile = join(root, 'vendor', 'three.r128.min.js');
const fonts = existsSync(fontFile) ? readFileSync(fontFile, 'utf8').trim() : '';
const three = existsSync(threeFile) ? readFileSync(threeFile, 'utf8') : '';
const selfContained = !!(fonts && three);

out = out.replace('/*@CSS@*/', () => (fonts ? '/* Baloo 2, SIL Open Font License 1.1 (src/fonts/OFL-Baloo2.txt) */\n' + fonts + '\n' : '') + css.trimEnd());
out = out.replace('/*@JS@*/', () => js.trimEnd());
if (fonts) out = between(out, '<!--@FONTS-->', '<!--/@FONTS-->\n', '');
else out = out.replace('<!--@FONTS-->\n', '').replace('<!--/@FONTS-->\n', '');
if (three) {
  if (three.includes('</script')) throw new Error('three.r128.min.js mengandungi </script>');
  out = between(out, '<!--@LOADER-->', '<!--/@LOADER-->\n',
    '<script>\n/* Three.js r128, MIT License (c) 2010-2021 three.js authors, vendor/LICENSE-three.txt */\n' + three.trimEnd() + '\n</script>\n<script>window.kampungAtuk();</script>\n');
} else out = out.replace('<!--@LOADER-->\n', '').replace('<!--/@LOADER-->\n', '');
const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src data:; img-src data: blob:; media-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
out = out.replace('<!--@CSP-->', selfContained ? csp : '');

writeFileSync(join(root, 'index.html'), out);
console.log(`index.html: ${files.length} modul JS, ${(out.length / 1024).toFixed(0)} KB, ${selfContained ? 'serba lengkap (fon + Three.js dibenam, CSP ketat)' : 'Three.js/fon dari CDN'}`);
