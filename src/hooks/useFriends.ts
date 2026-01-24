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

  // Auth State Listener
  const [user, setUser] = useState<any>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Arkadaş listesini gerçek zamanlı dinle
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
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
  }, [user]);

  // Arkadaş isteklerini gerçek zamanlı dinle (Gelen)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', user.uid),
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
  }, [user]);

  // Giden arkadaşlık isteklerini dinle (Outgoing)
  const [outgoingRequests, setOutgoingRequests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', user.uid),
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
  }, [user]);

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
      const searchTerm = searchName.trim().toLowerCase();
      console.log('🔍 Searching for:', searchTerm);

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('searchKey', '>=', searchTerm),
        where('searchKey', '<=', searchTerm + '\uf8ff'),
      );

      console.log('📡 Executing query...');
      const snapshot = await getDocs(q);
      console.log('✅ Query result count:', snapshot.size);

      const users: User[] = [];
      const seenUids = new Set<string>();
      const seenEmails = new Set<string>();

      snapshot.forEach((docSnapshot) => {
        const userData = docSnapshot.data() as User;

        // Kendisi değilse, zaten arkadaşı değilse VE daha önce eklenmemişse
        if (userData.uid !== user?.uid &&
          !friends.find(f => f.uid === userData.uid) &&
          !seenUids.has(userData.uid) &&
          userData.email && !seenEmails.has(userData.email)) {

          seenUids.add(userData.uid);
          seenEmails.add(userData.email);
          users.push(userData);
        }
      });

      console.log('👥 Found users:', users.length);
      return users.slice(0, 20);
    } catch (error) {
      console.error('❌ Search user error:', error);
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
    if (!user) {
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
        where('fromUserId', '==', user.uid),
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
        where('toUserId', '==', user.uid),
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
        fromUserId: user.uid,
        fromUserName: user.displayName || 'User',
        fromUserPhoto: user.photoURL || '',
        toUserId: toUser.uid,
        toUserName: toUser.displayName,
        status: 'pending',
        createdAt: Timestamp.now(),
      });

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
    if (!user) return;

    console.log('🔵 Accepting request:', request);
    setLoading(true);
    try {
      await updateDoc(doc(db, 'friendRequests', request.id), {
        status: 'accepted',
      });

      const userRef = doc(db, 'users', user.uid);
      const friendUserRef = doc(db, 'users', request.fromUserId);

      await updateDoc(userRef, {
        friends: arrayUnion(request.fromUserId),
      });

      await updateDoc(friendUserRef, {
        friends: arrayUnion(user.uid),
      });

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
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const friendUserRef = doc(db, 'users', friendId);

      await updateDoc(userRef, {
        friends: arrayRemove(friendId),
      });

      await updateDoc(friendUserRef, {
        friends: arrayRemove(user.uid),
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