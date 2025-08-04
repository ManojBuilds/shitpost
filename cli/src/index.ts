#!/usr/bin/env node

import * as p from '@clack/prompts';
import color from 'picocolors';
import { generateDiffSummary, generateTweets, getGitDiff, updateInDb } from './lib';
import { authorizeWithX } from './auth';
import { LOGO } from './constants';

async function main() {
    try {
        console.clear();

        p.updateSettings({
            aliases: {
                k: 'up',
                j: 'down',
                h: 'left',
                l: 'right',
            },
        });

        p.intro(LOGO)

        p.log.message('✨  Built something cool? Let\'s turn it into a post.');
        await authorizeWithX();

        const diff = await getGitDiff();
        const diffSummary = await generateDiffSummary(diff);
        const tweets = await generateTweets(diffSummary);
        await updateInDb(tweets);

        // Outro
        p.outro(`
🚀  Done! Open your dashboard: ${color.cyan(`https://shitpost.heysheet.in/dashboard`)}

💬  Type ${color.bold('shitpost')} again tomorrow to stay consistent.
`);
    } catch (err) {
        p.log.error('An unexpected error occurred. Please try again.');
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}

main();


