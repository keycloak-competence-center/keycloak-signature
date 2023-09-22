import { promises as fs } from 'node:fs';
import { basename, dirname } from 'node:path';
import fg from 'fast-glob';
import { compileString } from 'sass';
import stylelint from 'stylelint';
import * as prettier from 'prettier';

const files = await fg('./src/**/*.scss');

const shared = process.argv.at(3) || '',
  sharedFile = basename(shared),
  sharedDir = dirname(shared);

// Resolve prettier config
const prettierOptions = await prettier.resolveConfig(process.cwd());

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

      // Step 2: lint CSS
      let { output } = await stylelint.lint({ code: css, fix: true });

      output = output
        .toString()
        .split('\n')
        .map((string_) => `  ${string_}`.trimEnd())
        .join('\n');

      // Step 3: Format with Prettier
      output = `import { css } from 'lit';\nexport default css\`\n${output}\`;\n`;
      output = await prettier.format(output, {
        ...prettierOptions,
        parser: 'typescript',
      });

      // Step 4: write CSS to TS template
      await fs.writeFile(`${file}.ts`, output);
    } catch (error) {
      console.log(error);
    }
  })
);
