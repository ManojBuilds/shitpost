import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export const POST = async (req: NextRequest) => {
    const { twitterId, name, username, email, profileImageUrl, accessToken, refreshToken, expiresAt } = await req.json()
    if (!twitterId || !name || !username || !email) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    try {
        const newUserId = await convex.mutation(api.users.create, {
            twitterId,
            name,
            username,
            email,
            profileImageUrl,
            accessToken,
            expiresAt,
            refreshToken
        })
        console.log({newUserId})
        return NextResponse.json({ id: newUserId, message: 'User created successfully' });

    } catch (error) {
        console.error('Error creating user', error);
        return NextResponse.json({ message: "ok" }, { status: 200 })
    }
}
