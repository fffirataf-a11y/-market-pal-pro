import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Camera,
  Save,
  UserPlus,
  X,
  Check,
  Search,
  Loader2,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/useFriends";

// 20 sevimli cartoon avatar - Farklı stiller
// 20 Awesome Cartoon Avatars (Adventurer Style)
const AVATARS = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    url: `https://api.dicebear.com/9.x/micah/svg?seed=${i + 1}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`,
  })),
];

interface User {
  uid: string;
  email: string;
  fullName: string;
  displayName: string;
  photoURL: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  // ✅ Firebase Friends Hook
  const {
    friends,
    friendRequests,
    loading: friendsLoading,
    searchUserByName,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useFriends();

  // Load initial user data
  const [originalUserData, setOriginalUserData] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved
      ? JSON.parse(saved)
      : {
        name: "Guest User",
        username: "",
        email: "guest@smartmarket.app",
        avatar: AVATARS[0].url,
      };
  });

  // Current editing data
  const [userData, setUserData] = useState(originalUserData);
  const [hasChanges, setHasChanges] = useState(false);

  // Dialog states
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  // ✅ Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  // Check for changes
  useEffect(() => {
    const userChanged =
      userData.name !== originalUserData.name ||
      userData.username !== originalUserData.username ||
      userData.email !== originalUserData.email ||
      userData.avatar !== originalUserData.avatar;

    setHasChanges(userChanged);
  }, [userData, originalUserData]);

  // ✅ Instagram tarzı anlık arama - OPTIMIZE EDİLMİŞ
  useEffect(() => {
    const searchUsers = async () => {
      // Çok kısa aramalar için durma
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const results = await searchUserByName(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    };

    // ✅ Debounce süresini artır: 300ms → 800ms
    const timer = setTimeout(searchUsers, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]); // ✅ searchUserByName'i dependency'den çıkar

  // ✅ Send friend request
  const handleSendRequest = async (user: User) => {
    await sendFriendRequest(user);
    setSearchResults(searchResults.filter(u => u.uid !== user.uid));
  };

  const handleSaveChanges = async () => { // ✅ async ekle
    // Validation
    if (!userData.name.trim()) {
      toast({
        title: t("common.error"),
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      toast({
        title: t("common.error"),
        description: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }

    try {
      // ✅ 1. Firebase'e kaydet
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          displayName: userData.name,
          photoURL: userData.avatar,
          searchKey: userData.name.toLowerCase(), // ✅ Arama için
        });
      }

      // ✅ 2. localStorage'a kaydet
      localStorage.setItem("user", JSON.stringify(userData));
      setOriginalUserData(userData);
      setHasChanges(false);

      // Trigger event
      window.dispatchEvent(new Event("user-data-change"));

      toast({
        title: t("common.success"),
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: t("common.error"),
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setUserData(originalUserData);
    setHasChanges(false);
    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded",
    });
  };

  // Select avatar
  const handleSelectAvatar = (avatarUrl: string) => {
    setUserData({ ...userData, avatar: avatarUrl });
    setIsSelectingAvatar(false);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (hasChanges) {
                    if (confirm("You have unsaved changes. Discard them?")) {
                      navigate("/settings");
                    }
                  } else {
                    navigate("/settings");
                  }
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Profile</h1>
            </div>

            {/* Bildirim Badge */}
            {friendRequests.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={() => setShowFriendRequests(true)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Requests
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {friendRequests.length}
                </span>
              </Button>
            )}

            {/* Save/Discard buttons */}
            {hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDiscardChanges}>
                  <X className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button size="sm" onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6 space-y-6">
        {/* Avatar Section */}
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={userData.avatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
              />
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full shadow-lg"
                onClick={() => setIsSelectingAvatar(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              {userData.username && (
                <p className="text-muted-foreground">@{userData.username}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Personal Info */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Personal Information</h3>

          {/* Name */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              placeholder="Enter username"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>
        </Card>

        {/* Friend Requests Notification */}
        {friendRequests.length > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground animate-pulse">
                    {friendRequests.length}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-base">
                    {friendRequests.length} New Friend Request{friendRequests.length > 1 ? 's' : ''}!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {friendRequests[0].fromUserName}
                    {friendRequests.length > 1 && ` and ${friendRequests.length - 1} other${friendRequests.length > 2 ? 's' : ''}`}
                    {' '}wants to be your friend
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowFriendRequests(true)}
                size="sm"
                className="flex-shrink-0"
              >
                View
              </Button>
            </div>
          </Card>
        )}

        {/* Friends List */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              Shopping Friends ({friends.length})
            </h3>
            <Button onClick={() => setIsAddingFriend(true)} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </div>

          {friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No friends added yet</p>
              <p className="text-sm">Add friends to share shopping lists</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.uid}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.photoURL}
                      alt={friend.displayName}
                      className="w-10 h-10 rounded-full border-2 border-primary"
                    />
                    <div>
                      <p className="font-medium">{friend.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Remove ${friend.displayName} from friends?`)) {
                        removeFriend(friend.uid);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      {/* Fixed Bottom Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
          <div className="container max-w-4xl py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Unsaved Changes</p>
                <p className="text-sm text-muted-foreground">
                  Don't forget to save your changes
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDiscardChanges}>
                  Discard
                </Button>
                <Button onClick={handleSaveChanges} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selection Dialog */}
      <Dialog open={isSelectingAvatar} onOpenChange={setIsSelectingAvatar}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
            <DialogDescription>
              Select a cute cartoon avatar for your profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-4 py-4 max-h-96 overflow-y-auto">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                className={`relative rounded-full overflow-hidden border-4 transition-all hover:scale-110 ${userData.avatar === avatar.url
                  ? "border-primary ring-4 ring-primary/20"
                  : "border-transparent hover:border-primary/50"
                  }`}
                onClick={() => handleSelectAvatar(avatar.url)}
              >
                <img
                  src={avatar.url}
                  alt={`Avatar ${avatar.id}`}
                  className="w-full h-full object-cover"
                />
                {userData.avatar === avatar.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Add Friend Dialog - INSTAGRAM TARZI ANLIK ARAMA */}
      <Dialog open={isAddingFriend} onOpenChange={(open) => {
        setIsAddingFriend(open);
        if (!open) {
          setSearchQuery("");
          setSearchResults([]);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Shopping Friend
            </DialogTitle>
            <DialogDescription>
              Start typing to search for friends
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Arama Input - Sadece input, buton yok */}
            <div className="space-y-2">
              <Label>Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Type a name... (e.g., 'S', 'Ser')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Start typing to see matching users
              </p>
            </div>

            {/* Arama Sonuçları - Otomatik göster */}
            {searchQuery.length >= 2 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searching ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground px-1">
                      {searchResults.length} user{searchResults.length > 1 ? 's' : ''} found
                    </p>
                    {searchResults.map((user) => (
                      <div
                        key={user.uid}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full border-2 border-primary flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(user)}
                          disabled={friendsLoading}
                          className="flex-shrink-0"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                    <p className="text-muted-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Başlangıç durumu */}
            {searchQuery.length < 2 && !searching && searchResults.length === 0 && (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">Start typing to search</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Type at least 2 characters
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Friend Requests Dialog */}
      <Dialog open={showFriendRequests} onOpenChange={setShowFriendRequests}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Friend Requests ({friendRequests.length})
            </DialogTitle>
            <DialogDescription>
              Accept or reject pending friend requests
            </DialogDescription>
          </DialogHeader>

          {friendRequests.length === 0 ? (
            <div className="py-12 text-center">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3 py-4 overflow-y-auto">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <img
                        src={request.fromUserPhoto}
                        alt={request.fromUserName}
                        className="w-12 h-12 rounded-full border-2 border-primary"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{request.fromUserName}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent {new Date(request.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectFriendRequest(request)}
                      disabled={friendsLoading}
                      className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        acceptFriendRequest(request);
                        if (friendRequests.length === 1) {
                          setShowFriendRequests(false);
                        }
                      }}
                      disabled={friendsLoading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;