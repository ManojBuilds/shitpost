import * as p from '@clack/prompts';
import simpleGit from 'simple-git';
import dotenv from 'dotenv';
import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { GIT_DIFF_SUMMARY_SYSTEM_PROMPT } from './constants';
import { Tweets, TweetSchema } from './types';
import { getSavedTokens } from './authStore';
import color from 'picocolors';
import { config } from './config';


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
    console.error('❌ Git error:', err);
    return 'Git data not available. Are you in a Git repository?';
  }
}

// STEP 3: Generate Diff Summary
export async function generateDiffSummary(gitDiff: string): Promise<string> {
  const s = p.spinner();
  s.start(`🤖  ${color.cyan("Asking our AI overlords to make sense of your code...")}`);
  const { text } = await generateText({
    model: google("models/gemini-1.5-flash-latest"),
    prompt: `Summarize the following Git diff as if you were writing a changelog or commit description. Focus on what was changed and why.\n\n${gitDiff}`,
    system: GIT_DIFF_SUMMARY_SYSTEM_PROMPT,
  });

  s.stop(`✅  ${color.green("Your code, but readable. You're welcome.")}`);
  return text;
}

export async function generateTweets(diffSummary: string) {
  const s = p.spinner();
  s.start(`🐦  ${color.cyan("Turning your code into clout...")}`);

  const prompt = `\nYou're a developer who builds in public and tweets daily about what you're working on.\n\nBased on the following summary of today's code changes, generate 5 tweet ideas. \nMix tweet types: helpful tips, casual build-in-public updates, witty takes, and short threads.\nEach tweet should stand alone and be inspired by the actual work done.\n\nSummary:\n${diffSummary}\n`;

  const { object } = await generateObject({
    model: google("models/gemini-1.5-flash-latest"),
    output: 'array',
    schema: TweetSchema,
    prompt,
  });

  s.stop(`✅  ${color.green("Here are some spicy takes, fresh from the AI kitchen.")}`);
  return object;
}

export async function updateInDb(tweets: Tweets) {
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
    return fetch(`${config.frontendUrl}/api/createTweet`, {
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
  p.note(`Visit ${config.frontendUrl}/dashboard to manage and schedule your tweets.`);
}
