import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ message: 'User not found' })
    }
    try {
        const client = await clerkClient()
        const clerkResponse = await client.users.getUserOauthAccessToken(userId, 'x')
        const accessToken = clerkResponse.data[0]?.token

        if (!accessToken) {
            return NextResponse.json({ message: 'Access token not found' })
        }

        return NextResponse.json({token: accessToken})
    } catch (error) {
        console.error('Error access token: ', error)
        return NextResponse.json({ message: 'error' })
    }
}
