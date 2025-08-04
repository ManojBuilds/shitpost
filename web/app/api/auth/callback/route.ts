import { api } from "@/convex/_generated/api";
import { convex } from "@/lib/convex";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const GET = async (_req: NextRequest) => {
    try {
        await auth.protect()
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ message: 'user not found' }, { status: 400 })
        }
        const dbUser = await convex.query(api.users.get, {
            username: user?.username || ''
        })
        if (dbUser) {
            return NextResponse.json({ message: 'Already setup', success: true }, { status: 200 })
        }
        const client = await clerkClient()
        const clerkResponse = await client.users.getUserOauthAccessToken(user.id, 'x')
        const tokenData = clerkResponse.data?.[0]
        if (!tokenData) {
            throw new Error("No token data")
        }
        const twitter = new TwitterApi(tokenData.token)
        const { data, errors } = await twitter.v2.me()
        if (errors?.length) {
            throw new Error(JSON.stringify(errors))
        }
        await convex.mutation(api.users.create, {
            accessToken: tokenData.token,
            email: user.emailAddresses?.[0].emailAddress || '',
            expiresAt: new Date(tokenData.expiresAt!).getTime(),
            name: user.fullName || '',
            profileImageUrl: user.imageUrl || '',
            username: user.username as string,
            twitterId: data.id,
        })
        return NextResponse.json({message: "setup done", success: true}, {status: 200})
    } catch (error: any) {
        console.error('AUTH CALLBACK ERROR:', error)
        return NextResponse.json({ message: error.message, success: false }, { status: 500 })
    }
}
