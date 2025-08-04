import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    twitterId: v.string(),
    name: v.string(),
    username: v.string(),
    email: v.string(),
    profileImageUrl: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
  }).index('by_email', ['email'])
    .index('by_username', ['username'])
    .searchIndex('search_username_email', {
      searchField: 'username',
      filterFields: ['email'],
    }),
  tweets: defineTable({
    username: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    scheduledAt: v.string(),
    status: v.string()
  }).index('by_username', ['username'])
    .index('by_username_and_status', ['username', 'status'])
    .searchIndex('by_content', {
      searchField: 'content',
      filterFields: ['username', 'status'],
    })
});
