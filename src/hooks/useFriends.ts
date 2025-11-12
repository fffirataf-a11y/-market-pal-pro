import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';

interface User {
  uid: string;
  email: string;
  fullName: string;
  displayName: string;
  photoURL: string;
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export const useFriends = () => {
  const { toast } = useToast();
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;

  // Arkadaş listesini gerçek zamanlı dinle
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (docSnapshot) => {
        console.log('🔄 Friends listener triggered!', docSnapshot.data());
        if (docSnapshot.exists()) {
          const friendIds = docSnapshot.data().friends || [];
          console.log('👥 Friend IDs:', friendIds);
          loadFriends(friendIds);
        }
      },
      (error) => {
        console.error('Friends listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Arkadaş isteklerini gerçek zamanlı dinle
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: FriendRequest[] = [];
        snapshot.forEach((docSnapshot) => {
          requests.push({ 
            id: docSnapshot.id, 
            ...docSnapshot.data() 
          } as FriendRequest);
        });
        setFriendRequests(requests);
      },
      (error) => {
        console.error('Friend requests listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Arkadaşları yükle
  const loadFriends = async (friendIds: string[]) => {
    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    try {
      const friendsData: User[] = [];
      
      for (const friendId of friendIds) {
        const friendDocRef = doc(db, 'users', friendId);
        const friendDoc = await getDoc(friendDocRef);
        
        if (friendDoc.exists()) {
          friendsData.push(friendDoc.data() as User);
        }
      }
      
      setFriends(friendsData);
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  // İsim ile kullanıcı ara
  const searchUserByName = async (searchName: string): Promise<User[]> => {
    if (!searchName.trim()) return [];

    setLoading(true);
    try {
      // Firestore'da case-insensitive arama için küçük harfe çevir
      const searchLower = searchName.toLowerCase();
      
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      
      const users: User[] = [];
      
      snapshot.forEach((docSnapshot) => {
        const userData = docSnapshot.data() as User;
        const nameLower = userData.fullName?.toLowerCase() || '';
        
        // İsim içinde arama yap
        if (nameLower.includes(searchLower) && 
            userData.uid !== currentUser?.uid && 
            !friends.find(f => f.uid === userData.uid)) {
          users.push(userData);
        }
      });

      return users;
    } catch (error) {
      console.error('Search user error:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Arkadaşlık isteği gönder
const sendFriendRequest = async (toUser: User) => {
  if (!currentUser) {
    toast({
      title: "Error",
      description: "You must be logged in",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    // Mevcut istek var mı kontrol et
    const existingRequestQuery = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', currentUser.uid),
      where('toUserId', '==', toUser.uid),
      where('status', '==', 'pending')
    );

    const existingSnapshot = await getDocs(existingRequestQuery);
    
    if (!existingSnapshot.empty) {
      toast({
        title: "Already Sent",
        description: "Friend request already sent to this user",
      });
      return;
    }

    // Ters yönde istek var mı kontrol et
    const reverseRequestQuery = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', toUser.uid),
      where('toUserId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const reverseSnapshot = await getDocs(reverseRequestQuery);
    
    if (!reverseSnapshot.empty) {
      toast({
        title: "Request Exists",
        description: "This user has already sent you a friend request. Check your requests!",
      });
      return;
    }

    // Yeni istek oluştur
    await addDoc(collection(db, 'friendRequests'), {
      fromUserId: currentUser.uid,
      fromUserName: currentUser.displayName || 'User',
      fromUserPhoto: currentUser.photoURL || '',
      toUserId: toUser.uid,
      toUserName: toUser.displayName,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // ✅ YENİ: Local notification göster (hedef kullanıcı app'te ise)
    try {
      if (Notification.permission === 'granted') {
        new Notification('👋 Friend Request Sent', {
          body: `Your request was sent to ${toUser.displayName}`,
          icon: toUser.photoURL || '/logo.png',
        });
      }
    } catch (err) {
      console.log('Notification error:', err);
    }

    toast({
      title: "Success",
      description: `Friend request sent to ${toUser.displayName}`,
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    toast({
      title: "Error",
      description: "Failed to send friend request",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

const acceptFriendRequest = async (request: FriendRequest) => {
  if (!currentUser) return;

  console.log('🔵 Accepting request:', request);
  console.log('🔵 Current user:', currentUser.uid);
  console.log('🔵 Friend user:', request.fromUserId);

  setLoading(true);
  try {
    await updateDoc(doc(db, 'friendRequests', request.id), {
      status: 'accepted',
    });
    console.log('✅ Request updated');

    const currentUserRef = doc(db, 'users', currentUser.uid);
    const friendUserRef = doc(db, 'users', request.fromUserId);

    console.log('🔵 Updating current user doc:', currentUser.uid);
    await updateDoc(currentUserRef, {
      friends: arrayUnion(request.fromUserId),
    });
    console.log('✅ Current user updated');

    console.log('🔵 Updating friend user doc:', request.fromUserId);
    await updateDoc(friendUserRef, {
      friends: arrayUnion(currentUser.uid),
    });
    console.log('✅ Friend user updated');

    // ✅ YENİ: Local notification göster
    try {
      if (Notification.permission === 'granted') {
        new Notification('✅ Friend Request Accepted', {
          body: `You are now friends with ${request.fromUserName}!`,
          icon: request.fromUserPhoto || '/logo.png',
        });
      }
    } catch (err) {
      console.log('Notification error:', err);
    }

    toast({
      title: "Success",
      description: `You are now friends with ${request.fromUserName}`,
    });
  } catch (error) {
    console.error('❌ Accept friend request error:', error);
    toast({
      title: "Error",
      description: "Failed to accept friend request",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  // Arkadaşlık isteğini reddet
  const rejectFriendRequest = async (request: FriendRequest) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'friendRequests', request.id), {
        status: 'rejected',
      });

      toast({
        title: "Request Rejected",
        description: "Friend request has been rejected",
      });
    } catch (error) {
      console.error('Reject friend request error:', error);
      toast({
        title: "Error",
        description: "Failed to reject friend request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Arkadaşı kaldır
  const removeFriend = async (friendId: string) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const friendUserRef = doc(db, 'users', friendId);

      await updateDoc(currentUserRef, {
        friends: arrayRemove(friendId),
      });

      await updateDoc(friendUserRef, {
        friends: arrayRemove(currentUser.uid),
      });

      toast({
        title: "Friend Removed",
        description: "Friend has been removed from your list",
      });
    } catch (error) {
      console.error('Remove friend error:', error);
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    friends,
    friendRequests,
    loading,
    searchUserByName,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  };
};