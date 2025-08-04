import { TwitterApi } from 'twitter-api-v2';
import open from 'open';
import http from 'http';
import { saveTokens, getSavedTokens } from './authStore';
import { config } from './config';

export async function authorizeWithX() {
    const saved = getSavedTokens();
    if (saved) {
        return new TwitterApi(saved.accessToken);
    }

    const client = new TwitterApi({
        clientId: config.twitterClientId,
        clientSecret: config.twitterClientSecret,
    });

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
        config.twitterCallbackUrl!,
        { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access', 'users.email'] }
    );

    console.log(`🔗 Authorize here: ${url}`);
    await open(url);

    const code = await new Promise<string>((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
            const code = urlObj.searchParams.get('code');
            const returnedState = urlObj.searchParams.get('state');

            if (!code || returnedState !== state) {
                res.writeHead(400);
                res.end('Auth failed. Please close this window.');
                reject(new Error('Invalid OAuth callback.'));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('✅ Authorization successful! You can close this window.');
            server.close();
            resolve(code);
        });

        server.listen(3001, () => {
            console.log('📡 Waiting for callback...');
        });
    });

    const { client: loggedClient, accessToken, refreshToken, expiresIn } =
        await client.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: config.twitterCallbackUrl,
        });

    const expiresAt = Date.now() + expiresIn * 1000;

    const { data: user } = await loggedClient.v2.me({ "user.fields": ['confirmed_email', 'profile_image_url'] });

    const res = await fetch(`${config.frontendUrl}/api/createUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            twitterId: user.id,
            name: user.name,
            username: user.username.toLowerCase(),
            profileImageUrl: user.profile_image_url,
            email: user.confirmed_email,
            accessToken: accessToken,
            refreshToken,
            expiresAt
        }),
    });
    const newUser = await res.json()

    saveTokens({ accessToken, refreshToken: refreshToken!, expiresAt, email: user.confirmed_email!, userId: newUser.id, twitterId: user.id, username: user.username.toLowerCase() });

    return loggedClient;
}
