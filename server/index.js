import express from "express";
import dotenv from "dotenv";
import { z } from "zod";
import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

const sessions = {}


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
  const session = req.query.session;
  if (!session) return res.status(400).send("Missing session");
  console.log("🔁 Starting OAuth flow...");

  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access", "users.email"]
  });

  sessions[session] = { codeVerifier, state };
  console.log("🔁 OAuth session initialized:", session);

  res.redirect(url);
});

app.get("/auth/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    console.log("🔙 Received OAuth callback:", { code, state });
    const sessionId = Object.keys(sessions).find(s => sessions[s].state === state);
    if (!sessionId) {
      return res.status(400).send("Invalid or expired session");
    }

    const oauthRequestData = sessions[sessionId];

    if (!code || !state || !oauthRequestData || state !== oauthRequestData.state) {
      console.error("❌ Invalid OAuth callback state or missing code.");
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

    console.log("✅ Logged in as Twitter user:", user.username);

    const userCreationData = await axios.post(`${FRONTEND_URL}/api/createUser`, {
        twitterId: user.id,
        name: user.name,
        username: user.username.toLowerCase(),
        profileImageUrl: user.profile_image_url,
        email: user.confirmed_email,
        accessToken,
        refreshToken,
        expiresAt
    });

    const newUser =userCreationData.data;
    console.log("🆕 User created in frontend DB:", newUser.id);

    const payload = {
      accessToken,
      refreshToken,
      expiresAt,
      email: user.confirmed_email,
      twitterId: user.id,
      username: user.username.toLowerCase(),
      userId: newUser.id
    };
    sessions[sessionId].tokenData = payload;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
  <html>
    <body>
      <h2>✅ Auth complete!</h2>
      <p>This window will close automatically.</p>
      <script>setTimeout(() => window.close(), 200);</script>
    </body>
  </html>
`);
  } catch (err) {
    console.error("❌ OAuth error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

app.get("/api/session/:id", (req, res) => {
  const session = sessions[req.params.id];
  if (session?.tokenData) {
    const data = session.tokenData;
    delete sessions[req.params.id];
    res.json(data);
  } else {
    res.status(404).end();
  }
});

app.post("/api/diffsummary", async (req, res) => {
  const { gitDiff } = req.body;
  console.log("📄 Received Git diff for summarization");

  try {
    const { text } = await generateText({
      model: google("models/gemini-1.5-flash-latest"),
      prompt: `Summarize the following Git diff as if you were writing a changelog or commit description. Focus on what was changed and why.\n\n${gitDiff}`,
      system: GIT_DIFF_SUMMARY_SYSTEM_PROMPT,
    });

    console.log("✅ Diff summary generated.");
    res.status(200).json({ text });
  } catch (err) {
    console.error("❌ Failed to generate diff summary:", err);
    res.status(500).json({ error: "Diff summary generation failed" });
  }
});

app.post("/api/generateTweets", async (req, res) => {
  const { diffSummary } = req.body;
  console.log("🐦 Generating tweets from diff summary...");

  const prompt = `You're a developer who builds in public and tweets daily about what you're working on.

Based on the following summary of today's code changes, generate 5 tweet ideas. 
Mix tweet types: helpful tips, casual build-in-public updates, witty takes, and short threads.
Each tweet should stand alone and be inspired by the actual work done.

Summary:
${diffSummary}`;

  try {
    const { object } = await generateObject({
      model: google("models/gemini-1.5-flash-latest"),
      output: 'array',
      schema: TweetSchema,
      prompt,
    });

    console.log("✅ Tweet ideas generated.");
    res.json(object);
  } catch (err) {
    console.error("❌ Tweet generation failed:", err);
    res.status(500).json({ error: "Tweet generation failed" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔗 Twitter OAuth start: http://localhost:${port}/auth/x`);
});
