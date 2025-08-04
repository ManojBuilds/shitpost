import dotenv from 'dotenv'
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
    frontendUrl: process.env.FRONTEND_URL!,
    generativeAiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    twitterClientId: process.env.TWITTER_CLIENT_ID!,
    twitterClientSecret: process.env.TWITTER_CLIENT_SECRET!,
    twitterCallbackUrl: process.env.TWITTER_CALLBACK_URL!
} as const

