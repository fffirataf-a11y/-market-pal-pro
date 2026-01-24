import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/hooks/useSubscription';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  addedBy: string;
  addedByName?: string;
  addedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  sharedWith: string[];
  permissions: { [userId: string]: 'view' | 'edit' };
  items: ShoppingItem[];
  createdAt: any;
  updatedAt: any;
}

export const useShoppingLists = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { canPerformAction, incrementAction, plan } = useSubscription();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [friendIds, setFriendIds] = useState<string[]>([]);

  // Auth durumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLists([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listeleri gerçek zamanlı dinle
  useEffect(() => {
    if (!currentUser) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Friends list listener to get friend IDs
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const friends = docSnap.data().friends || [];
        setFriendIds(friends);
        setupListListeners(friends);
      } else {
        setFriendIds([]);
        setupListListeners([]);
      }
    });

    let unsubscribeOwn: () => void;
    let unsubscribeShared: () => void;
    let unsubscribeFriends: () => void;

    const setupListListeners = (currentFriendIds: string[]) => {
      // Clean up previous listeners if they exist
      if (unsubscribeOwn) unsubscribeOwn();
      if (unsubscribeShared) unsubscribeShared();
      if (unsubscribeFriends) unsubscribeFriends();

      // QUERY 1: Kendi listeleri
      const ownListsQuery = query(
        collection(db, 'shoppingLists'),
        where('ownerId', '==', currentUser.uid)
      );

      // QUERY 2: Paylaşılan listeler (Explicitly shared)
      const sharedListsQuery = query(
        collection(db, 'shoppingLists'),
        where('sharedWith', 'array-contains', currentUser.uid)
      );

      const allLists = new Map<string, ShoppingList>();

      const mergeAndSetLists = () => {
        const userLists = Array.from(allLists.values());
        // Client-side sıralama
        userLists.sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() || 0;
          const bTime = b.updatedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setLists(userLists);
        setLoading(false);
      };

      // Listener 1: Kendi listeleri
      unsubscribeOwn = onSnapshot(ownListsQuery, (snapshot) => {
        snapshot.forEach((doc) => {
          allLists.set(doc.id, { id: doc.id, ...doc.data() } as ShoppingList);
        });
        mergeAndSetLists();
      }, (error) => console.error('Own lists error:', error));

      // Listener 2: Paylaşılan listeler
      unsubscribeShared = onSnapshot(sharedListsQuery, (snapshot) => {
        snapshot.forEach((doc) => {
          allLists.set(doc.id, { id: doc.id, ...doc.data() } as ShoppingList);
        });
        mergeAndSetLists();
      }, (error) => console.error('Shared lists error:', error));

      // QUERY 3: Arkadaşların listeleri (Implicit sharing)
      if (currentFriendIds.length > 0) {
        // Firestore 'in' query supports max 10 values.
        const friendsListsQuery = query(
          collection(db, 'shoppingLists'),
          where('ownerId', 'in', currentFriendIds)
        );

        unsubscribeFriends = onSnapshot(friendsListsQuery, (snapshot) => {
          snapshot.forEach((doc) => {
            allLists.set(doc.id, { id: doc.id, ...doc.data() } as ShoppingList);
          });
          mergeAndSetLists();
        }, (error) => console.error('Friends lists error:', error));
      } else {
        mergeAndSetLists();
      }
    };

    return () => {
      unsubscribeUser();
      if (unsubscribeOwn) unsubscribeOwn();
      if (unsubscribeShared) unsubscribeShared();
      if (unsubscribeFriends) unsubscribeFriends();
    };
  }, [currentUser]);


  // Yeni liste oluştur
  const createList = async (name: string) => {
    if (!currentUser) {
      toast({
        title: t('common.error') || "Error",
        description: t('lists.loginRequired') || "You must be logged in",
        variant: "destructive",
        duration: 2000,
      });
      return null;
    }

    try {
      const newList = {
        name: name,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || 'User',
        sharedWith: [],
        permissions: {},
        items: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'shoppingLists'), newList);

      toast({
        title: t('common.success'),
        description: `List "${name}" created`,
        duration: 2000,
      });

      return docRef.id;
    } catch (error) {
      console.error('Create list error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to create list",
        variant: "destructive",
        duration: 2000,
      });
      return null;
    }
  };

  // Liste güncelle
  const updateList = async (listId: string, updates: Partial<ShoppingList>) => {
    try {
      await updateDoc(doc(db, 'shoppingLists', listId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Update list error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to update list",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Liste sil
  const deleteList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'shoppingLists', listId));

      toast({
        title: t('common.success'),
        description: "List deleted",
        duration: 2000,
      });
    } catch (error) {
      console.error('Delete list error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to delete list",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const addItem = async (listId: string, item: Omit<ShoppingItem, 'id' | 'addedBy' | 'addedByName' | 'addedAt'>, options?: { silent?: boolean }) => {
    if (!currentUser) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    // ✅ İZİN KONTROLÜ
    const isOwner = list.ownerId === currentUser.uid;
    const isFriend = friendIds.includes(list.ownerId);

    if (!isOwner && !isFriend) {
      // Paylaşılan liste - izni kontrol et
      const userPermission = list.permissions[currentUser.uid];
      if (userPermission !== 'edit') {
        toast({
          title: t('common.error'),
          description: "You don't have permission to edit this list",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }
    }

    // ABONELİK KONTROLÜ
    if (plan !== 'pro' && !canPerformAction()) {
      toast({
        title: t('common.error'),
        description: t('subscription.limitReached') || "Günlük limit doldu.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      const newItem: ShoppingItem = {
        ...item,
        id: Date.now().toString(),
        addedBy: currentUser.uid,
        addedByName: currentUser.displayName || 'User',
        addedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'shoppingLists', listId), {
        items: arrayUnion(newItem),
        updatedAt: Timestamp.now(),
      });

      // Kredi Düşme işlemi UI tarafında (Lists.tsx) yapılacak
      // incrementAction();

      if (!options?.silent) {
        toast({
          title: t('common.success'),
          description: t('lists.itemAdded') || `${item.name} added to list`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Add item error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to add item",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const updateItem = async (listId: string, itemId: string, updates: Partial<ShoppingItem>) => {
    if (!currentUser) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    // ✅ İZİN KONTROLÜ
    const isOwner = list.ownerId === currentUser.uid;
    const isFriend = friendIds.includes(list.ownerId);

    if (!isOwner && !isFriend) {
      const userPermission = list.permissions[currentUser.uid];
      if (userPermission !== 'edit') {
        toast({
          title: t('common.error'),
          description: "You don't have permission to edit this list",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }
    }

    try {
      const updatedItems = list.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      await updateDoc(doc(db, 'shoppingLists', listId), {
        items: updatedItems,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Update item error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to update item",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Ürünü sil
  const deleteItem = async (listId: string, itemId: string) => {
    if (!currentUser) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    // ✅ İZİN KONTROLÜ
    const isOwner = list.ownerId === currentUser.uid;
    const isFriend = friendIds.includes(list.ownerId);

    if (!isOwner && !isFriend) {
      const userPermission = list.permissions[currentUser.uid];
      if (userPermission !== 'edit') {
        toast({
          title: t('common.error'),
          description: "You don't have permission to edit this list",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }
    }

    try {
      const updatedItems = list.items.filter(item => item.id !== itemId);
      await updateDoc(doc(db, 'shoppingLists', listId), {
        items: updatedItems,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: t('common.success'),
        description: t('lists.itemRemoved') || "Item removed",
        duration: 2000,
      });
    } catch (error) {
      console.error('Delete item error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to delete item",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const deleteAllItems = async (listId: string) => {
    if (!currentUser) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    // ✅ İZİN KONTROLÜ (Sadece owner ve arkadaşlar silebilir)
    const isOwner = list.ownerId === currentUser.uid;
    const isFriend = friendIds.includes(list.ownerId);

    if (!isOwner && !isFriend) {
      toast({
        title: t('common.error'),
        description: "Only the list owner or friends can delete all items",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'shoppingLists', listId), {
        items: [],
        updatedAt: Timestamp.now(),
      });

      toast({
        title: t('common.success'),
        description: "All items removed",
        duration: 2000,
      });
    } catch (error) {
      console.error('Delete all items error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to delete items",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Listeyi arkadaşla paylaş
  const shareList = async (listId: string, friendId: string, permission: 'view' | 'edit' = 'view') => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;

      await updateDoc(doc(db, 'shoppingLists', listId), {
        sharedWith: arrayUnion(friendId),
        [`permissions.${friendId}`]: permission,
        updatedAt: Timestamp.now(),
      });

      // Local notification göster
      try {
        if (Notification.permission === 'granted') {
          new Notification('📋 List Shared', {
            body: `You shared "${list.name}" successfully`,
            icon: '/logo.png',
          });
        }
      } catch (err) {
        console.log('Notification error:', err);
      }

      toast({
        title: t('common.success'),
        description: "List shared successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Share list error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to share list",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Paylaşımı kaldır (Sadece explicit paylaşımları kaldırır, implicit arkadaşlık erişimini kaldırmak için arkadaştan çıkarmak gerekir)
  const unshareList = async (listId: string, friendId: string) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;

      const updatedPermissions = { ...list.permissions };
      delete updatedPermissions[friendId];

      await updateDoc(doc(db, 'shoppingLists', listId), {
        sharedWith: arrayRemove(friendId),
        permissions: updatedPermissions,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: t('common.success'),
        description: "Sharing removed",
        duration: 2000,
      });
    } catch (error) {
      console.error('Unshare list error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to remove sharing",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return {
    lists,
    loading,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    deleteAllItems,
    shareList,
    unshareList,
  };
};