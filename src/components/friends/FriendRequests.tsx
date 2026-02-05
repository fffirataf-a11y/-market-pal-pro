import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFriends } from "@/hooks/useFriends";
import { Check, X, UserPlus } from "lucide-react";

export function FriendRequests() {
    const { friendRequests, acceptFriendRequest, rejectFriendRequest, loading } = useFriends();

    if (friendRequests.length === 0) return null;

    return (
        <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Arkadaşlık İstekleri
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {friendRequests.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {friendRequests.map((request) => (
                    <div
                        key={request.id}
                        className="flex items-center justify-between bg-background p-3 rounded-lg shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={request.fromUserPhoto} />
                                <AvatarFallback>
                                    {request.fromUserName?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{request.fromUserName}</p>
                                <p className="text-xs text-muted-foreground">Seni arkadaş olarak eklemek istiyor</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => rejectFriendRequest(request)}
                                disabled={loading}
                            >
                                <X className="h-4 w-4" strokeWidth={2.5} />
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => acceptFriendRequest(request)}
                                disabled={loading}
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Kabul Et
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
