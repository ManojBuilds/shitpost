import { api } from "@/convex/_generated/api";
import { convex } from "@/lib/convex";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const { username, content, tags, status , scheduledAt } = await req.json()
    if (!username || !content || !status ) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    try {
        await convex.mutation(api.tweets.createTweet, {
            username,
            content,
            tags,
            scheduledAt,
            status,
        })
        return NextResponse.json({ message: 'Tweets created successfully' }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating error: ', error);
        return NextResponse.json({ message: error.message })
    }
}
