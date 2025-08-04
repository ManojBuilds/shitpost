'use server'
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { TwitterApi } from "twitter-api-v2";
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const getAccessToken = async () => {
    try {
        await auth.protect()
        const { userId } = await auth()
        if (!userId) {
            console.log('NO USER FOUND')
            return
        }
        const client = await clerkClient()
        const clerkResponse = await client.users.getUserOauthAccessToken(userId, 'x')
        return clerkResponse.data[0]?.token
    } catch (error) {
        console.error('ERROR: GETACCESS_TOKEN', error)
    }
}

export const tweetPost = async ({ content, id }: { content: string, id: Id<"tweets"> }) => {
    try {
        await auth.protect()
        const accessToken = await getAccessToken()
        if (!accessToken) {
            throw new Error('Access token not found in response');
        }
        const twitterClient = new TwitterApi(accessToken);
        await twitterClient.v2.tweet(content);
        await convex.mutation(api.tweets.updateTweet, {
            tweetId: id,
            status: 'published'
        })
        console.log('Tweet posted successfully');
        revalidatePath('/dashboard')
    } catch (error) {
        console.error('Failed to post tweet:', error);
        throw new Error('Failed to post tweet');
    }
}

export const ai = async ({ prompt }: { prompt: string }) => {
    try {
        const { text } = await generateText({
            model: google("models/gemini-2.0-flash-exp"),
            prompt,
            system: `You are a helpful assistant that improves tweets for a developer-focused audience.
Given a draft tweet, enhance it while keeping the original intent, tone, and authenticity intact.
You may make it more concise, engaging, or witty.
Optionally use relevant hashtags (like #buildinpublic, #devlife, #indiehacker) only if they improve reach.
Do not add emojis unless the original tweet had them.
Keep it under 280 characters and avoid over-formal rewriting.`
        })
        console.log(text)
        return text;
    } catch (error) {
        console.error('ERROR AI: ', error)
        return null
    }
}
