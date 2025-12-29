import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';

export const useFirebaseAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Email ile giriş - EMAIL VERIFICATION KONTROLÜ
  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      // DEBUG LOG
      // Timeoutlu login yerine normal login kullan, hang olursa kullanıcı tekrar dener
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      console.log('Login successful for:', user.email);

      // Email doğrulama kontrolünü GEÇİCİ OLARAK DEVRE DIŞI BIRAK
      // Apple review ekibi için bu kontrolü atlamamız gerekebilir
      if (!user.emailVerified) {
        console.warn('Email not verified but allowing access for testing:', user.email);
      }

      // ✅ Firestore'dan kullanıcı bilgilerini al (Hata olursa devam et)
      let firestoreData: any = {};
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        firestoreData = userDoc.exists() ? userDoc.data() : {};
      } catch (firestoreError) {
        console.warn('Firestore read failed during login, proceeding with auth data only:', firestoreError);
        // Firestore hatası login'i engellememeli
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || firestoreData.fullName || 'User',
        fullName: firestoreData.fullName || user.displayName || 'User',
        searchKey: (firestoreData.fullName || user.displayName || 'User').toLowerCase(),
        avatar: user.photoURL || "https://api.dicebear.com/9.x/thumbs/svg?seed=Easton",
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userToken', user.uid);
      window.dispatchEvent(new Event('auth-change'));

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Login failed";

      if (error.message === 'EMAIL_NOT_VERIFIED') {
        errorMessage = "Please verify your email address first. Check your inbox.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "User not found";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Wrong password";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email ile kayıt - VERIFICATION EMAIL GÖNDER + FIRESTORE KAYDET
  const signupWithEmail = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Profil güncelle
      await updateProfile(user, {
        displayName: fullName,
        photoURL: "https://api.dicebear.com/9.x/thumbs/svg?seed=Easton",
      });

      // ✅ Firestore'a kullanıcı bilgilerini kaydet (Hata olsa bile devam et)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: fullName,
          searchKey: fullName.toLowerCase(),
          displayName: fullName,
          photoURL: "https://api.dicebear.com/9.x/thumbs/svg?seed=Easton",
          createdAt: new Date().toISOString(),
          friends: [],
        });
      } catch (fsError) {
        console.error('Firestore write failed during signup:', fsError);
      }

      // Doğrulama emaili gönder
      try {
        await sendEmailVerification(user, {
          url: window.location.origin + '/auth',
          handleCodeInApp: false,
        });
      } catch (emailError) {
        console.warn('Verification email send failed:', emailError);
      }

      // OTOMATİK GİRİŞ İÇİN SIGNOUT YAPMIYORUZ
      // await signOut(auth);

      // Local storage güncelle (Auto login için)
      localStorage.setItem('userToken', user.uid);
      window.dispatchEvent(new Event('auth-change'));

      toast({
        title: "Success",
        description: "Account created! You are logged in.",
        duration: 3000,
      });

      return user;
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = "Signup failed";

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak (min 6 characters)";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email doğrulama linkini tekrar gönder
  const resendVerificationEmail = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No user logged in');
      }

      if (user.emailVerified) {
        throw new Error('Email already verified');
      }

      await sendEmailVerification(user, {
        url: window.location.origin + '/auth',
        handleCodeInApp: false,
      });

      toast({
        title: "Success",
        description: "Verification email sent! Please check your inbox.",
      });
    } catch (error: any) {
      console.error('Resend email error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email doğrulama durumunu kontrol et
  const checkEmailVerification = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      await reload(user);
      return user.emailVerified;
    } catch (error) {
      console.error('Check verification error:', error);
      return false;
    }
  };

  // Telefon ile giriş - SMS gönder
  const sendPhoneVerification = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);

      toast({
        title: "Success",
        description: "Verification code sent to your phone",
      });

      return confirmation;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Telefon kodu doğrula
  const verifyPhoneCode = async (code: string) => {
    if (!confirmationResult) {
      throw new Error('No confirmation result');
    }

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(code);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        phone: user.phoneNumber,
        name: user.displayName || 'User',
        avatar: user.photoURL || "https://api.dicebear.com/9.x/thumbs/svg?seed=Easton",
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userToken', user.uid);
      window.dispatchEvent(new Event('auth-change'));

      toast({
        title: "Success",
        description: "Phone verified successfully",
      });

      return user;
    } catch (error: any) {
      console.error('Code verification error:', error);
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırlama
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Success",
        description: "Password reset email sent",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to send reset email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
      window.dispatchEvent(new Event('auth-change'));

      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    loading,
    loginWithEmail,
    signupWithEmail,
    sendPhoneVerification,
    verifyPhoneCode,
    resetPassword,
    resendVerificationEmail,
    checkEmailVerification,
    logout,
  };
};