import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthCallback() {
    return (
        <div className="grid place-items-center pt-20">
            <Card>
                <CardHeader>
                    <CardTitle>Setting up your account</CardTitle>
                    <CardDescription>Please wait while we prepare your shitposting environment...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
