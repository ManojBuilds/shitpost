import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Media } from "./mimeTypes";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const sendMedia = action({
  args: {
    files: v.array(v.object({ storageId: v.id("_storage"), mimeType: v.string() })),
    tweetId: v.id("tweets"),
  },
  handler: async (ctx, args) => {
    console.log('Saving files', args)
    const medias: Media[] = [];
    for (const file of args.files) {
      medias.push({ storageId: file.storageId, mimeType: file.mimeType as "image/jpeg" | "video/mp4" | "video/quicktime" | "image/gif" | "image/png" | "image/webp" });
    }
    await ctx.runMutation(api.tweets.updateTweet, {
      tweetId: args.tweetId,
      medias,
    });
  },
});
