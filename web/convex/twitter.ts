'use node'
import { action } from './_generated/server';
import { v } from 'convex/values';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import { MediaValidator } from './mimeTypes';
import { Id } from './_generated/dataModel';

export const postTweet = action({
    args: {
        id: v.id('tweets'),
        content: v.string(),
        accessToken: v.string(),
        medias: v.array(
            MediaValidator
        ),
        community: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { content, accessToken, medias } = args;
        const twitterClient = new TwitterApi(accessToken);
        const mediaIds: string[] = []

        for (const media of medias) {
            const url = await ctx.storage.getUrl(media.storageId as Id<"_storage">);
            if (!url) {
                throw new Error(`Media with storageId ${media.storageId} not found.`);
            }
            const res = await fetch(url)
            const arraybuffer = await res.arrayBuffer()
            const buffer = Buffer.from(arraybuffer)
            const mediaId = await twitterClient.v2.uploadMedia(buffer, {
                media_type: media.mimeType as EUploadMimeType,
            });
            mediaIds.push(mediaId);
        }

        try {
            await twitterClient.v2.tweet({
                community_id: args.community === "everyone" ? "" : "1495042358068477955", text: content, media: {
                    media_ids: mediaIds as [string] | [string, string] | [string, string, string] | [string, string, string, string],
                }
            });
            console.log('Tweet posted successfully');
        } catch (error) {
            console.error('Failed to post tweet:', error);
            throw new Error('Failed to post tweet');
        }
    },
});
