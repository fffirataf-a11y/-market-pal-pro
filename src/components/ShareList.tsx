import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Check, Users, Trash2, Eye, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/useFriends";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db, auth } from "@/config/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { showInterstitialAd } from "@/lib/adManager";
import { useSubscription } from "@/hooks/useSubscription";

interface ShareListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
}

interface SharedUser {
  uid: string;
  fullName: string;
  displayName: string;
  email: string;
  photoURL: string;
  permission: 'view' | 'edit';
}

const MAX_SHARES = 5;

const ShareList = ({ open, onOpenChange, listId }: ShareListProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { friends } = useFriends();
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [listOwner, setListOwner] = useState<string | null>(null);

  const currentUser = auth.currentUser;
  const isOwner = currentUser && currentUser.uid === listOwner;

  // Mevcut paylaşılan kullanıcıları yükle
  useEffect(() => {
    if (!listId || !open) return;

    const loadSharedUsers = async () => {
      try {
        const listRef = doc(db, 'shoppingLists', listId);
        const listDoc = await getDoc(listRef);

        if (listDoc.exists()) {
          const data = listDoc.data();
          setListOwner(data.ownerId);

          const sharedWith = data.sharedWith || [];
          const permissions = data.permissions || {};

          // Paylaşılan kullanıcıların detaylarını al
          // Önce mevcut friends listesinden eşle, bulunamazsa Firestore'dan getir
          const usersData: SharedUser[] = [];
          for (const friendId of sharedWith) {
            let friend = friends.find(f => f.uid === friendId) as any;

            if (!friend) {
              // Arkadaş listesinde yoksa kullanıcı profilini Firestore'dan oku
              try {
                const userDoc = await getDoc(doc(db, 'users', friendId));
                if (userDoc.exists()) {
                  friend = userDoc.data();
                }
              } catch (e) {
                console.warn('Shared user fetch fallback failed:', friendId, e);
              }
            }

            if (friend) {
              usersData.push({
                ...friend,
                permission: permissions[friendId] || 'view'
              });
            }
          }

          setSharedUsers(usersData);
        }
      } catch (error) {
        console.error('Load shared users error:', error);
      }
    };

    loadSharedUsers();
  }, [listId, open, friends]);

  // Arkadaşı listeye ekle
  const handleShareWithFriend = async (friendId: string) => {
    if (!listId || !currentUser || !isOwner) return;

    if (sharedUsers.length >= MAX_SHARES) {
      toast({
        title: "Limit Aşıldı",
        description: `En fazla ${MAX_SHARES} kişiyle paylaşabilirsiniz`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const listRef = doc(db, 'shoppingLists', listId);

      await updateDoc(listRef, {
        sharedWith: arrayUnion(friendId),
        [`permissions.${friendId}`]: 'edit' // Varsayılan edit izni
      });

      const friend = friends.find(f => f.uid === friendId);
      if (friend) {
        setSharedUsers(prev => [...prev, { ...friend, permission: 'edit' }]);
      }

      toast({
        title: "Başarılı! 🎉",
        description: "Liste arkadaşınızla paylaşıldı",
      });
    } catch (error) {
      console.error('Share list error:', error);
      toast({
        title: "Hata",
        description: "Liste paylaşılamadı",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Arkadaşı listeden kaldır
  const handleRemoveFromList = async (friendId: string) => {
    if (!listId || !isOwner) return;

    setLoading(true);
    try {
      const listRef = doc(db, 'shoppingLists', listId);
      const listDoc = await getDoc(listRef);

      if (listDoc.exists()) {
        const currentShared = listDoc.data().sharedWith || [];
        const currentPermissions = listDoc.data().permissions || {};

        const updatedShared = currentShared.filter((id: string) => id !== friendId);
        const updatedPermissions = { ...currentPermissions };
        delete updatedPermissions[friendId];

        await updateDoc(listRef, {
          sharedWith: updatedShared,
          permissions: updatedPermissions
        });

        setSharedUsers(prev => prev.filter(u => u.uid !== friendId));

        toast({
          title: "Kaldırıldı",
          description: "Arkadaş listeden kaldırıldı",
        });
      }
    } catch (error) {
      console.error('Remove from list error:', error);
      toast({
        title: "Hata",
        description: "Kaldırılamadı",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // İzin türünü değiştir
  const handlePermissionChange = async (friendId: string, newPermission: 'view' | 'edit') => {
    if (!listId || !isOwner) return;

    setLoading(true);
    try {
      const listRef = doc(db, 'shoppingLists', listId);

      await updateDoc(listRef, {
        [`permissions.${friendId}`]: newPermission
      });

      setSharedUsers(prev =>
        prev.map(u => u.uid === friendId ? { ...u, permission: newPermission } : u)
      );

      toast({
        title: "Güncellendi",
        description: "İzin türü değiştirildi",
      });
    } catch (error) {
      console.error('Update permission error:', error);
      toast({
        title: "Hata",
        description: "İzin güncellenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Paylaşılmamış arkadaşları filtrele
  const availableFriends = friends.filter(
    friend => !sharedUsers.some(u => u.uid === friend.uid)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste Paylaşımı
          </DialogTitle>
          <DialogDescription>
            {isOwner
              ? `Liste arkadaşlarınızla paylaşın (${sharedUsers.length}/${MAX_SHARES})`
              : "Bu listeye erişimi olan kişiler"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mevcut Paylaşılanlar */}
          {sharedUsers.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Paylaşılan Kişiler ({sharedUsers.length})
              </Label>
              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{user.fullName || user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.permission}
                          onValueChange={(value: 'view' | 'edit') => handlePermissionChange(user.uid, value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-28 h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">
                              <div className="flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                Görüntüle
                              </div>
                            </SelectItem>
                            <SelectItem value="edit">
                              <div className="flex items-center gap-2">
                                <Edit3 className="h-3 w-3" />
                                Düzenle
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          onClick={() => handleRemoveFromList(user.uid)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant={user.permission === 'edit' ? 'default' : 'secondary'}>
                        {user.permission === 'edit' ? 'Düzenleyebilir' : 'Görüntüleyebilir'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arkadaş Ekle (Sadece Owner) */}
          {isOwner && availableFriends.length > 0 && sharedUsers.length < MAX_SHARES && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Arkadaş Ekle</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableFriends.map((friend) => (
                  <div
                    key={friend.uid}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.photoURL} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {friend.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{friend.fullName || friend.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {friend.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleShareWithFriend(friend.uid)}
                      disabled={loading}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Ekle
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boş Durum */}
          {sharedUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                {isOwner
                  ? "Henüz kimseyle paylaşılmadı. Arkadaşlarınızı ekleyin!"
                  : "Bu liste henüz kimseyle paylaşılmamış"
                }
              </p>
            </div>
          )}

          {/* Limit Uyarısı */}
          {isOwner && sharedUsers.length >= MAX_SHARES && (
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ Maksimum {MAX_SHARES} kişiyle paylaşım limitine ulaştınız
              </p>
            </div>
          )}
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full h-11 font-semibold">
          Tamam
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareList;