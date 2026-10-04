const fs = require('fs');

let indexHtml = fs.readFileSync('brag-output/composition/index.html', 'utf8');
indexHtml = indexHtml.replace(/<div id="scene-1"/g, '<div data-composition-id="scene-1"');
indexHtml = indexHtml.replace(/<div id="scene-2"/g, '<div data-composition-id="scene-2"');
indexHtml = indexHtml.replace(/<div id="scene-3"/g, '<div data-composition-id="scene-3"');
indexHtml = indexHtml.replace(/<div id="scene-4"/g, '<div data-composition-id="scene-4"');
fs.writeFileSync('brag-output/composition/index.html', indexHtml);

for (let i = 1; i <= 4; i++) {
  let file = `brag-output/composition/compositions/scene${i}.html`;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<div id="scene-[1-4]-content"/g, `<div id="scene-${i}-content" data-composition-id="scene-${i}" data-width="1920" data-height="1080"`);
  fs.writeFileSync(file, content);
}
console.log('Fixed');
