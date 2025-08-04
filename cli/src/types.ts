import { z } from 'zod';
export const TweetSchema = z.object({
    text: z.string().describe("The tweet content, must be under 280 characters."),
    tone: z
        .string()
        .optional()
        .describe("Optional tone of the tweet, e.g., 'funny', 'casual', 'technical'."),
    tags: z
        .array(z.string())
        .optional()
        .describe("Optional hashtags or topics, like '#buildinpublic', '#devlife'."),
    reason: z.string().describe('Reason why this tweet')
    
}).describe('List of generated tweet suggestions based on git changes.');

export const TweetsArraySchema = z.array(TweetSchema);
export type Tweet = z.infer<typeof TweetSchema>;
export type Tweets = z.infer<typeof TweetsArraySchema>;
