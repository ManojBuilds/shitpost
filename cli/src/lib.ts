import * as p from '@clack/prompts';
import simpleGit from 'simple-git';
import { Tweets } from './types';
import { getSavedTokens } from './authStore';
import color from 'picocolors';
import axios from 'axios';


export async function getGitDiff(): Promise<string> {
    const git = simpleGit({ baseDir: process.cwd() });

    const s = p.spinner();
    s.start(`🧐  ${color.cyan("Inspecting your latest masterpiece...")}`);

    try {
        const status = await git.status();
        const stagedDiff = await git.diff(['--cached']);
        const unstagedDiff = await git.diff();

        const changedFiles = status.files.length
            ? status.files.map(f => `- ${f.path} (${f.working_dir})`).join('\n')
            : 'No file changes detected';

        const summary = `📦 Git Status:\n${changedFiles}\n\n🧾 Staged Diff:\n${stagedDiff || 'No staged changes'}\n\n🧾 Unstaged Diff:\n${unstagedDiff || 'No unstaged changes'}`;
        s.stop(`✅  ${color.green("Found your latest commits. Let's see what we've got.")}`);
        return summary;
    } catch (err) {
        s.stop("❌  Git error");
        p.log.error('An error occurred while getting the git diff. Are you in a git repository?');
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}

export async function generateDiffSummary(gitDiff: string): Promise<string> {
    const s = p.spinner();
    s.start(`🤖  ${color.cyan("Asking our AI overlords to make sense of your code...")}`);
    try {
        const res = await axios.post('https://shitpost-ujla.onrender.com/api/diffSummary', {
            gitDiff,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        s.stop(`✅  ${color.green("Your code, but readable. You're welcome.")}`);
        return res.data.text;
    } catch (err) {
        console.error(err)
        s.stop("❌  AI error");
        p.log.error('An error occurred while generating the diff summary.');
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}

export async function generateTweets(diffSummary: string) {
    const s = p.spinner();
    s.start(`🐦  ${color.cyan("Turning your code into clout...")}`);

    try {
        const res = await axios.post('https://shitpost-ujla.onrender.com/api/generateTweets', {
            diffSummary,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        s.stop(`✅  ${color.green("Here are some spicy takes, fresh from the AI kitchen.")}`);
        return res.data;
    } catch (err) {
        console.error(err)
        s.stop("❌  AI error");
        p.log.error('An error occurred while generating tweets.');
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}

export async function updateInDb(tweets: Tweets) {
    try {
        const tokenData = getSavedTokens();

        if (tweets.length === 0) {
            p.log.info('No tweets were generated.');
            return;
        }

        p.intro(`Here are your generated tweets:`);
        tweets.forEach((tweet, i) => {
            p.log.message(`${color.bold(i + 1)}: ${tweet.text}`);
            if (tweet.tags && tweet.tags.length > 0) {
                p.log.message(`   Tags: ${tweet.tags.join(', ')}`);
            }
        });

        const action = await p.select({
            message: 'What do you want to do with these tweets?',
            options: [
                { value: 'all', label: 'Save all to database' },
                { value: 'select', label: 'Select which tweets to save' },
                { value: 'discard', label: 'Discard all' },
            ],
            initialValue: 'all',
        });

        if (p.isCancel(action) || action === 'discard') {
            p.outro(color.yellow('No tweets were saved.'));
            return;
        }

        let tweetsToSave: Tweets;

        if (action === 'select') {
            const selectedTweets = await p.multiselect({
                message: 'Select the tweets you want to keep (press space to select, enter to confirm):',
                options: tweets.map((tweet) => ({
                    value: tweet,
                    label: tweet.text,
                })),
                required: false,
            });

            if (p.isCancel(selectedTweets)) {
                p.outro(color.yellow('No tweets were saved.'));
                return;
            }

            tweetsToSave = selectedTweets as Tweets;
        } else {
            tweetsToSave = tweets;
        }

        if (tweetsToSave.length === 0) {
            p.outro(color.yellow('No tweets selected. Nothing saved.'));
            return;
        }

        const s = p.spinner();
        s.start(`🚀  ${color.cyan(`Saving ${tweetsToSave.length} tweet(s) to the cloud...`)}`);

        const tweetPromises = tweetsToSave.map((tweet) => {
            return fetch(`https://shitpost.heysheet.in/api/createTweet`, {
                method: 'POST',
                body: JSON.stringify({
                    username: tokenData?.username.toLowerCase(),
                    content: tweet.text,
                    tags: tweet.tags,
                    status: 'draft',
                    scheduledAt: new Date().toString(),
                }),
            });
        });

        await Promise.all(tweetPromises);

        s.stop(`✅  ${color.green("Your tweets are safe and sound in the database.")}`);
    } catch (err) {
        p.log.error('An error occurred while updating the database. Please check your internet connection and try again.');
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}
