import * as p from '@clack/prompts';
import open from 'open';
import http from 'http';
import { saveTokens, getSavedTokens } from './authStore';

export async function authorizeWithX() {
    try {
        const saved = getSavedTokens();
        if (saved) return;

        const tokenData = await new Promise((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                let body = '';
                req.on('data', chunk => (body += chunk));
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('✅ Auth complete. You can close this window.');
                        server.close();
                        resolve(data);
                    } catch (e) {
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('❌ Failed to parse token data.');
                        server.close();
                        reject(e);
                    }
                });
            });

            server.listen(0, async () => {
                const address = server.address();
                const port = typeof address === 'object' && address?.port;
                const callbackUrl = `http://localhost:${port}`;

                const authUrl = `https://shitpost-ujla.onrender.com/auth/x?callback=${encodeURIComponent(callbackUrl)}`;
                await open(authUrl);

                p.log.message('🌐 Opened browser for authorization...');
                console.log(`📡 Waiting for token data on ${callbackUrl}...`);
            });
        });

        const {
            accessToken,
            refreshToken,
            expiresAt,
            email,
            twitterId,
            username,
            userId
        } = tokenData as any;

        saveTokens({
            accessToken,
            refreshToken,
            expiresAt,
            email,
            userId,
            twitterId,
            username
        });

    } catch (err) {
        p.log.error('❌ An error occurred during authorization.');
        if (err instanceof Error) p.log.error(err.message);
        process.exit(1);
    }
}
