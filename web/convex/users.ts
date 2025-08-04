import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        twitterId: v.string(),
        name: v.string(),
        username: v.string(),
        email: v.string(),
        profileImageUrl: v.string(),
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresAt: v.number(),
    },
    async handler(ctx, args) {
        const existingByUsername = await ctx.db
            .query('users')
            .withIndex('by_username', (q) => q.eq('username', args.username))
            .first();

        if (existingByUsername) {
            return existingByUsername._id
        }

        const convexUser = await ctx.db.insert('users', {
            email: args.email,
            profileImageUrl: args.profileImageUrl,
            twitterId: args.twitterId,
            name: args.name,
            username: args.username,
            accessToken: args.accessToken,
            refreshToken: args.refreshToken,
            expiresAt: args.expiresAt
        })
        console.log('handler userId:', convexUser)
        return convexUser;
    },
})

export const get = query({
    args: {
        username: v.string()
    },
    async handler(ctx, args) {
        return await ctx.db.query('users').withIndex('by_username', q=>q.eq('username', args.username)).unique()
    },
})
