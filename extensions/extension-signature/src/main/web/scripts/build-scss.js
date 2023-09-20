import { promises as fs } from 'node:fs';
import { basename, dirname } from 'node:path';
import fg from 'fast-glob';
import { compileString } from 'sass';

const files = await fg('./src/**/*.scss');

const shared = process.argv.at(3) || '',
  sharedFile = basename(shared),
  sharedDir = dirname(shared);

await Promise.allSettled(
  files.map(async (file) => {
    try {
      // Step 1: compile SCSS to CSS
      const { css } = compileString(
        `
          ${shared ? `@import '${sharedFile}';` : ''}

          ${await fs.readFile(file, 'utf8')}
        `,
        { loadPaths: shared ? [sharedDir] : undefined }
      );

      const output = css
        .toString()
        .split('\n')
        .map((string_) => `  ${string_}`.trimEnd())
        .join('\n');

      // Step 3: write CSS to TS template
      await fs.writeFile(
        `${file}.ts`,
        `import { css } from 'lit';\nexport default css\`\n${output}\`;\n`
      );
    } catch (error) {
      console.log(error);
    }
  })
);
