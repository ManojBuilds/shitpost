import express from "express";
import dotenv from "dotenv";
import { z } from "zod";
import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

const app = express();
const port = 5000;
app.use(express.json());

const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

let oauthRequestData = null;

export const TweetSchema = z.object({
  text: z.string().describe("The tweet content, must be under 280 characters."),
  tone: z.string().optional().describe("Optional tone of the tweet, e.g., 'funny', 'casual', 'technical'."),
  tags: z.array(z.string()).optional().describe("Optional hashtags or topics, like '#buildinpublic', '#devlife'."),
  reason: z.string().describe('Reason why this tweet')
}).describe('List of generated tweet suggestions based on git changes.');

export const GIT_DIFF_SUMMARY_SYSTEM_PROMPT = `
You are an expert software developer who specializes in writing changelogs, commit messages, and technical summaries from Git diffs.

Given a raw Git diff, summarize the changes made in clear, concise, and developer-friendly language.

Goals:
- Explain what changed and why
- Mention key file/function changes if relevant
- Do not include line numbers or raw diff syntax
- Use bullet points or short paragraphs if needed
- Prefer brevity but retain meaning

Audience:
- Other developers
- Indie hackers building in public
- Project changelog readers
`;

const client = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

app.get("/auth/x", async (req, res) => {
  const { callback } = req.query
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access", "users.email"]
  });

  oauthRequestData = { codeVerifier, state, callback };
  res.redirect(url);
});

app.get("/auth/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state || !oauthRequestData || state !== oauthRequestData.state) {
      return res.status(400).json({ error: "Invalid state or code" });
    }

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn
    } = await client.loginWithOAuth2({
      code: code,
      codeVerifier: oauthRequestData.codeVerifier,
      redirectUri: CALLBACK_URL
    });

    const expiresAt = Date.now() + expiresIn * 1000;

    const { data: user } = await loggedClient.v2.me({
      "user.fields": ["confirmed_email", "profile_image_url"]
    });

    const userCreationRes = await fetch(`${FRONTEND_URL}/api/createUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twitterId: user.id,
        name: user.name,
        username: user.username.toLowerCase(),
        profileImageUrl: user.profile_image_url,
        email: user.confirmed_email,
        accessToken,
        refreshToken,
        expiresAt
      })
    });

    const newUser = await userCreationRes.json();
    const payload = {
      accessToken,
      refreshToken,
      expiresAt,
      email: user.confirmed_email,
      twitterId: user.id,
      username: user.username.toLowerCase(),
      userId: newUser.id
    };
    await fetch(oauthRequestData.callback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
  <html>
    <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h2>✅ Auth complete!</h2>
      <p>This window will close automatically.</p>
      <script>setTimeout(() => window.close(), 1000);</script>
    </body>
  </html>
`);


  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

app.post("/api/diffsummary", async (req, res) => {
  const { gitDiff } = req.body;
  const { text } = await generateText({
    model: google("models/gemini-1.5-flash-latest"),
    prompt: `Summarize the following Git diff as if you were writing a changelog or commit description. Focus on what was changed and why.\n\n${gitDiff}`,
    system: GIT_DIFF_SUMMARY_SYSTEM_PROMPT,
  });
  res.status(200).json({ text });
});

app.post("/api/generateTweets", async (req, res) => {
  const { diffSummary } = req.body;

  const prompt = `You're a developer who builds in public and tweets daily about what you're working on.

Based on the following summary of today's code changes, generate 5 tweet ideas. 
Mix tweet types: helpful tips, casual build-in-public updates, witty takes, and short threads.
Each tweet should stand alone and be inspired by the actual work done.

Summary:
${diffSummary}`;

  const { object } = await generateObject({
    model: google("models/gemini-1.5-flash-latest"),
    output: 'array',
    schema: TweetSchema,
    prompt,
  });

  res.json(object);
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔗 Twitter OAuth start: http://localhost:${port}/auth/x`);
});
