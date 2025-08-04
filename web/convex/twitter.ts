'use node'
import { action } from './_generated/server';
import { v } from 'convex/values';
import { TwitterApi } from 'twitter-api-v2';

export const postTweet = action({
    args: {
        id: v.id('tweets'),
        content: v.string(),
        accessToken: v.string(),
    },
    handler: async (ctx, args) => {
        const { content, accessToken } = args;
        const twitterClient = new TwitterApi(accessToken);
        try {
            await twitterClient.v2.tweet(content);
            console.log('Tweet posted successfully');
        } catch (error) {
            console.error('Failed to post tweet:', error);
            throw new Error('Failed to post tweet');
        }
    },
});
