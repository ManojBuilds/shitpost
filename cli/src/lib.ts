import * as p from '@clack/prompts';
import simpleGit from 'simple-git';
import { Tweets } from './types';
import { getSavedTokens } from './authStore';
import color from 'picocolors';
import axios from 'axios';


export async function getGitDiff(): Promise<string> {
    const git = simpleGit({ baseDir: process.cwd() });

    const s = p.spinner();
    s.start(`🧐  ${color.cyan("Initiating git-fu... preparing for code archaeology!")}`);

    try {
        s.message("Checking git status...");
        const status = await git.status();

        s.message("Getting staged changes...");
        const stagedDiff = await git.diff(['--cached']);

        s.message("Getting unstaged changes...");
        const unstagedDiff = await git.diff();

        const changedFiles = status.files.length
            ? status.files.map(f => `- ${f.path} (${f.working_dir})`).join('\n')
            : 'No file changes detected';

        const summary = `📦 Git Status:\n${changedFiles}\n\n🧾 Staged Diff:\n${stagedDiff || 'No staged changes'}\n\n🧾 Unstaged Diff:\n${unstagedDiff || 'No unstaged changes'}`;
        s.stop(`✅  ${color.green("Git analysis complete. Your code's secrets are now ours!")}`);
        return summary;
    } catch (err) {
        s.stop("❌  Git error");
        p.log.error("Git-ception failed! Are you sure you're in a git repository, Neo?");
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}

export async function generateDiffSummary(gitDiff: string): Promise<string> {
    const s = p.spinner();
    s.start(`🤖  ${color.cyan("Consulting the digital oracle for diff insights...")}`);
    try {
        const res = await axios.post('https://cli-shitpost.heysheet.in/api/diffSummary', {
            gitDiff,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        s.stop(`✅  ${color.green("Diff summarized by AI. Resistance is futile, your code is understood!")}`);
        return res.data.text;
    } catch (err) {
        console.error(err)
        s.stop("❌  AI error");
        p.log.error("AI's brain short-circuited while summarizing the diff. Try again, human!");
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}

export async function generateTweets(diffSummary: string) {
    const s = p.spinner();
    s.start(`🐦  ${color.cyan("Engaging tweet-bot protocol... preparing for social media domination!")}`);

    try {
        const res = await axios.post('https://cli-shitpost.heysheet.in/api/generateTweets', {
            diffSummary,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        s.stop(`✅  ${color.green("Tweets generated! Prepare for maximum social impact!")}`);
        return res.data;
    } catch (err) {
        console.error(err)
        s.stop("❌  AI error");
        p.log.error("The tweet-generating AI encountered a critical error. It's not you, it's the robots!");
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
            p.log.info('No tweets were generated. The AI is clearly slacking off.');
            return;
        }

        p.intro(`Behold, mortal! Your code has been transmuted into tweet-gold:`);
        tweets.forEach((tweet, i) => {
            p.log.message(`${color.bold(i + 1)}: ${tweet.text}`);
            if (tweet.tags && tweet.tags.length > 0) {
                p.log.message(`   Tags: ${tweet.tags.join(', ')}`);
            }
        });

        const action = await p.select({
            message: "Your tweets await their destiny! What's the next command, commander?",
            options: [
                { value: 'all', label: 'Save all to database' },
                { value: 'select', label: 'Select which tweets to save' },
                { value: 'discard', label: 'Discard all' },
            ],
            initialValue: 'all',
        });

        if (p.isCancel(action) || action === 'discard') {
            p.outro(color.yellow('Tweets aborted! The digital ether remains undisturbed.'));
            return;
        }

        let tweetsToSave: Tweets;

        if (action === 'select') {
            const selectedTweets = await p.multiselect({
                message: 'Choose your champions! Which tweets shall grace the timelines?',
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
            p.outro(color.yellow('No tweets selected. The void remains silent.'));
            return;
        }

        const s = p.spinner();
        s.start(`🚀  ${color.cyan(`Transmitting ${tweetsToSave.length} tweet(s) to the digital cosmos...`)}`);

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

        s.stop(`✅  ${color.green("Your tweets have been securely uploaded to the mainframe!")}`);
    } catch (err) {
        p.log.error('Database connection lost! Did you try turning it off and on again?');
        if (err instanceof Error) {
            p.log.error(err.message);
        }
        process.exit(1);
    }
}
