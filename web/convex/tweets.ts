import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { MediaValidator } from "./mimeTypes";

export const createTweet = mutation({
    args: {
        username: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
        scheduledAt: v.string(),
        status: v.string(),
        medias: v.optional(v.array(MediaValidator)),
        community: v.optional(v.string())
    },
    async handler(ctx, args) {
        const newTweet = await ctx.db.insert('tweets', {
            content: args.content,
            scheduledAt: args.scheduledAt,
            status: args.status,
            tags: args.tags,
            username: args.username,
            medias: args.medias || [],
            community: args.community,
        })
        return newTweet;
    },
})


export const getTweets = query({
    args: {
        username: v.string(),
        status: v.optional(v.string()),
        search: v.optional(v.string()),
        sort: v.optional(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    async handler(ctx, args) {
        const { username, status, search, sort, paginationOpts } = args;

        let query;

        if (search) {
            query = ctx.db
                .query('tweets')
                .withSearchIndex('by_content', (q) => {
                    let sq = q.search('content', search).eq('username', username);
                    if (status && status !== 'all') {
                        sq = sq.eq('status', status);
                    }
                    return sq;
                });
        } else if (status && status !== 'all') {
            const order = sort === 'asc' ? 'desc' : 'desc';
            query = ctx.db
                .query('tweets')
                .withIndex('by_username_and_status', (q) => q.eq('username', username).eq('status', status))
                .order(order);
        } else {
            const order = sort === 'asc' ? 'desc' : 'desc';
            query = ctx.db
                .query('tweets')
                .withIndex('by_username', (q) => q.eq('username', username))
                .order(order);
        }

        const { page, isDone, continueCursor } = await query.paginate(paginationOpts);

        const tweetsWithMedias = await Promise.all(page.map(async (tweet) => {
            const mediaUrls = await Promise.all(tweet.medias.map(async (media) => {
                const url = await ctx.storage.getUrl(media.storageId)
                return ({url, mimeType: media.mimeType})
            }));
            return { ...tweet, mediaUrls };
        }));

        return { page: tweetsWithMedias, isDone, continueCursor };
    },
});

export const getTweetCounts = query({
    args: {
        username: v.string(),
    },
    async handler(ctx, args) {
        const tweets = await ctx.db
            .query('tweets')
            .withIndex('by_username', (q) => q.eq('username', args.username))
            .collect();

        const counts = {
            all: tweets.length,
            scheduled: tweets.filter(t => t.status === 'scheduled').length,
            draft: tweets.filter(t => t.status === 'draft').length,
            published: tweets.filter(t => t.status === 'published').length,
            failed: tweets.filter(t => t.status === 'failed').length,
        };

        return counts;
    },
});

export const updateTweet = mutation({
  args: {
    tweetId: v.id('tweets'),
    content: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
    status: v.optional(v.string()),
    medias: v.optional(v.array(MediaValidator)),
    community: v.optional(v.string())
  },
  async handler(ctx, args) {
    const { tweetId, ...fields } = args;

    const tweet = await ctx.db.get(tweetId);
    if (!tweet) {
      throw new Error("Tweet not found");
    }

    // Filter out undefined fields to only update what's provided
    const updates: Record<string, any> = {};
    for (const key in fields) {
    // @ts-expect-error it will owrk
      if (fields[key] !== undefined) {
        // @ts-expect-error good
        updates[key] = fields[key];
      }
    }

    const updatedTweet = await ctx.db.patch(tweetId, updates);

    // Run scheduledPost if status is being changed to 'published'
    if (updates.status === 'published') {
      const user = await ctx.db
        .query('users')
        .withIndex('by_username', (q) => q.eq('username', tweet.username))
        .unique();

      await ctx.scheduler.runAfter(0, internal.tweets.scheduledPost, {
        content: tweet.content,
        id: tweet._id,
        accessToken: user?.accessToken as string,
        medias: tweet.medias,
      });
    }

    return updatedTweet;
  },
});


export const deleteTweet = mutation({
    args: {
        tweetId: v.id('tweets'),
    },
    async handler(ctx, args) {
        await ctx.db.delete(args.tweetId);
    },
});

export const scheduleTweet = mutation({
    args: {
        tweetId: v.id('tweets'),
        scheduledAt: v.string(),
    },
    async handler(ctx, args) {
        const tweet = await ctx.db.get(args.tweetId);

        if (!tweet) {
            throw new Error("Tweet not found");
        }

        await ctx.db.patch(args.tweetId, {
            scheduledAt: args.scheduledAt,
            status: 'scheduled'
        });

        const user = await ctx.db.query('users').withIndex('by_username', (q) => q.eq('username', tweet.username)).unique()
        console.log('token:', user)
        await ctx.scheduler.runAt(new Date(args.scheduledAt), internal.tweets.scheduledPost, {
            content: tweet.content,
            id: tweet._id,
            accessToken: user?.accessToken as string,
            medias: tweet.medias
        });
    },
});

export const updateTweetStatus = internalMutation({
    args: {
        tweetId: v.id("tweets"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.tweetId, { status: args.status });
    },
});

export const scheduledPost = internalAction({
    args: {
        content: v.string(),
        id: v.id('tweets'),
        accessToken: v.string(),
        medias: v.array(MediaValidator),
        community: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        try {
            await ctx.runAction(api.twitter.postTweet, args);
            await ctx.runMutation(internal.tweets.updateTweetStatus, {
                tweetId: args.id,
                status: 'published'
            });
        } catch (e) {
            console.error(e);
            await ctx.runMutation(internal.tweets.updateTweetStatus, {
                tweetId: args.id,
                status: 'failed'
            });
        }
    }
});

