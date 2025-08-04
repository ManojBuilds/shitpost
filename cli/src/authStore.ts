import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.resolve(process.env.HOME || '.', '.shitpost');

type TokenData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  userId: string;
  username: string;
  twitterId: string
};

export function saveTokens(tokens: TokenData) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  
}

export function getSavedTokens(): TokenData | null {
  if (!fs.existsSync(TOKEN_PATH)) return null;

  try {
    const raw = fs.readFileSync(TOKEN_PATH, 'utf-8');
    const data = JSON.parse(raw) as TokenData;
    return data;
  } catch (err) {
    console.error('❌ Failed to parse saved token:', err);
    return null;
  }
}
