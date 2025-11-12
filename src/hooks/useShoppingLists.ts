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
import { onAuthStateChanged } from 'firebase/auth'; // ✅ EKLE

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
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser); // ✅ State'e al

  // ✅ Auth durumunu dinle
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

  // ✅ QUERY 1: Kendi listeleri
  const ownListsQuery = query(
    collection(db, 'shoppingLists'),
    where('ownerId', '==', currentUser.uid)
  );

  // ✅ QUERY 2: Paylaşılan listeler
  const sharedListsQuery = query(
    collection(db, 'shoppingLists'),
    where('sharedWith', 'array-contains', currentUser.uid)
  );

  const allLists = new Map<string, ShoppingList>();

  // Listener 1: Kendi listeleri dinle
  const unsubscribe1 = onSnapshot(
    ownListsQuery,
    (snapshot) => {
      snapshot.forEach((docSnapshot) => {
        allLists.set(docSnapshot.id, {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as ShoppingList);
      });
      updateLists();
    },
    (error) => {
      console.error('Own lists listener error:', error);
    }
  );

  // Listener 2: Paylaşılan listeleri dinle
  const unsubscribe2 = onSnapshot(
    sharedListsQuery,
    (snapshot) => {
      snapshot.forEach((docSnapshot) => {
        allLists.set(docSnapshot.id, {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as ShoppingList);
      });
      updateLists();
    },
    (error) => {
      console.error('Shared lists listener error:', error);
    }
  );

  // Listeleri güncelle ve sırala
  const updateLists = () => {
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

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}, [currentUser]);


  // Yeni liste oluştur
  const createList = async (name: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
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
        title: "Success",
        description: `List "${name}" created`,
      });

      return docRef.id;
    } catch (error) {
      console.error('Create list error:', error);
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
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
        title: "Error",
        description: "Failed to update list",
        variant: "destructive",
      });
    }
  };

  // Liste sil
  const deleteList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'shoppingLists', listId));

      toast({
        title: "Success",
        description: "List deleted",
      });
    } catch (error) {
      console.error('Delete list error:', error);
      toast({
        title: "Error",
        description: "Failed to delete list",
        variant: "destructive",
      });
    }
  };

  // Listeye ürün ekle
  const addItem = async (listId: string, item: Omit<ShoppingItem, 'id' | 'addedBy' | 'addedByName' | 'addedAt'>) => {
    if (!currentUser) return;

    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;

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

      toast({
        title: "Success",
        description: `${item.name} added to list`,
      });
    } catch (error) {
      console.error('Add item error:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  // Ürünü güncelle
  const updateItem = async (listId: string, itemId: string, updates: Partial<ShoppingItem>) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;

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
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  // Ürünü sil
  const deleteItem = async (listId: string, itemId: string) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;

      const updatedItems = list.items.filter(item => item.id !== itemId);

      await updateDoc(doc(db, 'shoppingLists', listId), {
        items: updatedItems,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Success",
        description: "Item removed",
      });
    } catch (error) {
      console.error('Delete item error:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };
  // Tüm itemleri sil (Toplu silme)
  const deleteAllItems = async (listId: string) => {
    try {
      await updateDoc(doc(db, 'shoppingLists', listId), {
        items: [], // ← Direkt boş array gönder
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Success",
        description: "All items removed",
      });
    } catch (error) {
      console.error('Delete all items error:', error);
      toast({
        title: "Error",
        description: "Failed to delete items",
        variant: "destructive",
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

    // ✅ YENİ: Local notification göster
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
      title: "Success",
      description: "List shared successfully",
    });
  } catch (error) {
    console.error('Share list error:', error);
    toast({
      title: "Error",
      description: "Failed to share list",
      variant: "destructive",
    });
  }
};

  // Paylaşımı kaldır
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
        title: "Success",
        description: "Sharing removed",
      });
    } catch (error) {
      console.error('Unshare list error:', error);
      toast({
        title: "Error",
        description: "Failed to remove sharing",
        variant: "destructive",
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