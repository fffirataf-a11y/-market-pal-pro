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

export interface User {
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

  // Arkadaş isteklerini gerçek zamanlı dinle (Gelen)
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

  // Giden arkadaşlık isteklerini dinle (Outgoing)
  const [outgoingRequests, setOutgoingRequests] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const outgoings: string[] = [];
      snapshot.forEach((doc) => {
        outgoings.push(doc.data().toUserId);
      });
      setOutgoingRequests(outgoings);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Arkadaşları yükle (Parallel - Optimized)
  const loadFriends = async (friendIds: string[]) => {
    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    try {
      // Paralel yükleme için Promise.all kullanıyoruz
      const friendPromises = friendIds.map(friendId =>
        getDoc(doc(db, 'users', friendId))
      );

      const snapshots = await Promise.all(friendPromises);

      const friendsData: User[] = [];
      snapshots.forEach(snap => {
        if (snap.exists()) {
          friendsData.push(snap.data() as User);
        }
      });

      setFriends(friendsData);
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  // İsim ile kullanıcı ara (Optimized - Cost Effective)
  const searchUserByName = async (searchName: string): Promise<User[]> => {
    if (!searchName.trim()) return [];

    setLoading(true);
    try {
      // searchKey alanı küçük harf olarak kaydedilmiş, bu yüzden case-insensitive arama yapabiliriz
      const searchTerm = searchName.trim().toLowerCase();

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('searchKey', '>=', searchTerm),
        where('searchKey', '<=', searchTerm + '\uf8ff'),
      );

      const snapshot = await getDocs(q);
      const users: User[] = [];
      const seenUids = new Set<string>(); // Duplicate kontrolü için
      const seenEmails = new Set<string>(); // Email kontrolü için

      snapshot.forEach((docSnapshot) => {
        const userData = docSnapshot.data() as User;

        // Kendisi değilse, zaten arkadaşı değilse VE daha önce eklenmemişse
        if (userData.uid !== currentUser?.uid &&
          !friends.find(f => f.uid === userData.uid) &&
          !seenUids.has(userData.uid) &&
          userData.email && !seenEmails.has(userData.email)) {

          seenUids.add(userData.uid);
          seenEmails.add(userData.email);
          users.push(userData);
        }
      });

      return users.slice(0, 20);
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

    // ✅ Yeni Kural: Herkes için 1 arkadaş limiti
    if (friends.length >= 1) {
      toast({
        title: "Limit Reached",
        description: "You can only have 1 friend at a time.",
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
    outgoingRequests,
  };
};