const { readFile, writeFile } = require('fs/promises');
const { stripTypeScriptTypes } = require('module');

async function build(input: string, output: string): Promise<void> {
  const code = await readFile(input, 'utf8');
  const stripped = stripTypeScriptTypes(code);
  await writeFile(output, stripped);
  console.log(`Built ${output}`);
}

(async () => {
  await build('game.ts', 'game.js');
})();
