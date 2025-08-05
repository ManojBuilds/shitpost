import * as p from '@clack/prompts';
import open from 'open';
import crypto from 'crypto';
import { saveTokens, getSavedTokens } from './authStore';

export async function authorizeWithX() {
    try {
        const saved = getSavedTokens();
        if (saved) return;

        const sessionId = crypto.randomUUID();

        const authUrl = `https://shitpost-ujla.onrender.com/auth/x?session=${sessionId}`;
        await open(authUrl);
        p.log.message(`🌐 Opened browser for authorization...`);
        p.log.message(`🕒 Waiting for authorization to complete...`);

        const tokenData = await pollForAuth(sessionId);

        const { accessToken, refreshToken, expiresAt, email, twitterId, username, userId } = tokenData;
        saveTokens({ accessToken, refreshToken, expiresAt, email, userId, twitterId, username });

        p.log.success('✅ Logged in with X (Twitter) successfully!');
    } catch (err) {
        p.log.error('❌ An error occurred during authorization.');
        if (err instanceof Error) p.log.error(err.message);
        process.exit(1);
    }
}

async function pollForAuth(sessionId: string): Promise<any> {
    const maxTries = 5 * 60;
    for (let i = 0; i < maxTries; i++) {
        const res = await fetch(`https://shitpost-ujla.onrender.com/api/session/${sessionId}`);
        if (res.status === 200) {
            return await res.json();
        }
        await new Promise(resolve => setTimeout(resolve, 2500));
    }
    throw new Error('Authorization timed out. Please try running the command again.');
}
