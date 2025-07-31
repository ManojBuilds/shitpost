import { setTimeout } from 'node:timers/promises';
import * as p from '@clack/prompts';
import color from 'picocolors';
import simpleGit from 'simple-git';

async function authorizeWithX() {
    const s = p.spinner();
    s.start('Open the link in your browser to authorize https:localhost:3000');
    // await setTimeout(2500);
    s.stop('You are now authorized');
}
export async function getGitDiffSummary(): Promise<string> {
  const git = simpleGit({ baseDir: process.cwd() });

  try {
    const status = await git.status();
    const stagedDiff = await git.diff(['--cached']); // Staged changes
    const unstagedDiff = await git.diff(); // Unstaged changes

    const changedFiles = status.files.map(f => `- ${f.path} (${f.working_dir})`).join('\n') || 'No file changes detected';

    const summary = `\n📦 Git Status:\n${changedFiles}` +
      `\n\n🧾 Staged Diff:\n${stagedDiff || 'No staged changes'}` +
      `\n\n🧾 Unstaged Diff:\n${unstagedDiff || 'No unstaged changes'}`;

    return summary;
  } catch (err) {
    console.error('❌ Git error:', err);
    return 'Git data not available. Are you in a Git repository?';
  }
}



async function main() {
    // 1. Authorize with x
    // 2. Get the git diff and status
    // 3. Pass it to gemini and generate tweets
    // 4. Update in main app 
    console.clear();


    // await setTimeout(1000);

    p.updateSettings({
        aliases: {
            k: 'up',
            j: 'down',
            h: 'left',
            l: 'right',
        },
    });

    p.intro(`${color.bgYellow(color.black(' 💩shitpost '))} ${color.dim('- Built something cool? Shitpost it!')}`);
    await authorizeWithX()
    const summary = await getGitDiffSummary()
    console.log(summary)
    return;

    const project = await p.group(
        {
            path: () =>
                p.text({
                    message: 'Where should we create your project?',
                    placeholder: './sparkling-solid',
                    validate: (value) => {
                        if (!value) return 'Please enter a path.';
                        if (value[0] !== '.') return 'Please enter a relative path.';
                    },
                }),
            password: () =>
                p.password({
                    message: 'Provide a password',
                    validate: (value) => {
                        if (!value) return 'Please enter a password.';
                        if (value.length < 5) return 'Password should have at least 5 characters.';
                    },
                }),
            type: ({ results }) =>
                p.select({
                    message: `Pick a project type within "${results.path}"`,
                    initialValue: 'ts',
                    maxItems: 5,
                    options: [
                        { value: 'ts', label: 'TypeScript' },
                        { value: 'js', label: 'JavaScript' },
                        { value: 'rust', label: 'Rust' },
                        { value: 'go', label: 'Go' },
                        { value: 'python', label: 'Python' },
                        { value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
                    ],
                }),
            tools: () =>
                p.multiselect({
                    message: 'Select additional tools.',
                    initialValues: ['prettier', 'eslint'],
                    options: [
                        { value: 'prettier', label: 'Prettier', hint: 'recommended' },
                        { value: 'eslint', label: 'ESLint', hint: 'recommended' },
                        { value: 'stylelint', label: 'Stylelint' },
                        { value: 'gh-action', label: 'GitHub Action' },
                    ],
                }),
            install: () =>
                p.confirm({
                    message: 'Install dependencies?',
                    initialValue: false,
                }),
        },
        {
            onCancel: () => {
                p.cancel('Operation cancelled.');
                process.exit(0);
            },
        }
    );

    if (project.install) {
        const s = p.spinner();
        s.start('Installing via pnpm');
        await setTimeout(2500);
        s.stop('Installed via pnpm');
    }

    const nextSteps = `cd ${project.path}        \n${project.install ? '' : 'pnpm install\n'}pnpm dev`;

    p.note(nextSteps, 'Next steps.');

    p.outro(`Problems? ${color.underline(color.cyan('https://example.com/issues'))}`);
}

main().catch(console.error);
