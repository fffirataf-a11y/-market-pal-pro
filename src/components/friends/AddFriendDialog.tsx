import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Search, Check, Loader2 } from "lucide-react";
import { useFriends, User } from "@/hooks/useFriends";
import { showInterstitialAd } from "@/lib/adManager";
import { useSubscription } from "@/hooks/useSubscription";
import { LimitReachedDialog } from "@/components/LimitReachedDialog";

// ... (debounce hook remains same)

export function AddFriendDialog() {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounceValue(searchTerm, 500);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const { searchUserByName, sendFriendRequest, loading, outgoingRequests } = useFriends();
    const { plan, canPerformAction, incrementAction, getRemainingActions } = useSubscription();
    const [sentRequests, setSentRequests] = useState<string[]>([]);
    const [limitDialogOpen, setLimitDialogOpen] = useState(false);

    useEffect(() => {
        const search = async () => {
            if (debouncedSearch.length >= 1) {
                const results = await searchUserByName(debouncedSearch);
                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        };
        search();
    }, [debouncedSearch]);

    const handleSendRequest = async (user: User) => {
        if (!canPerformAction()) {
            setLimitDialogOpen(true);
            return;
        }

        await sendFriendRequest(user);
        incrementAction();
        setSentRequests((prev) => [...prev, user.uid]);
        // Show interstitial ad after sending friend request
        await showInterstitialAd(plan);
    };

    const isRequestSent = (userId: string) => {
        return sentRequests.includes(userId) || outgoingRequests.includes(userId);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Arkadaş Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Arkadaş Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Kullanıcı adı ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {loading && searchTerm.length > 0 && searchResults.length === 0 ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((user) => {
                                const sent = isRequestSent(user.uid);
                                return (
                                    <div
                                        key={user.uid}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.photoURL} />
                                                <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.displayName}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={sent ? "secondary" : "default"}
                                            disabled={sent}
                                            onClick={() => handleSendRequest(user)}
                                        >
                                            {sent ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    İstek Bekliyor
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="h-4 w-4 mr-1" />
                                                    Ekle
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                );
                            })
                        ) : searchTerm.length >= 1 ? (
                            <p className="text-center text-muted-foreground py-4">Kullanıcı bulunamadı</p>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                Aramak için bir isim yazın
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
            <LimitReachedDialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen} />
        </Dialog>
    );
}
