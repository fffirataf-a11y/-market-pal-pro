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
  // Email ile giriş - EMAIL VERIFICATION KONTROLÜ
  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', email);

      // 1. Connectivity Check
      if (!navigator.onLine) {
        throw new Error('No internet connection (navigator.onLine is false)');
      }

      console.log('Login successful for:', user.email);

      // 🛑 EMAIL VERIFICATION KONTROLÜ (ZORUNLU)
      if (!user.emailVerified) {
        console.warn('⚠️ Email not verified! Blocking access.');
        await signOut(auth);
        throw new Error('Email not verified. Please check your inbox.');
      }

      // ✅ Firestore'dan kullanıcı bilgilerini al (Timeout ekli)
      let firestoreData: any = {};
      try {
        const firestorePromise = getDoc(doc(db, 'users', user.uid));
        // Keep Firestore timeout short to avoid UI hanging if DB rules fail
        const fsTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 5000)
        );

        // Firestore isteği 5 saniyede bitmezse atla
        const userDoc = await Promise.race([firestorePromise, fsTimeoutPromise]) as any;
        firestoreData = userDoc.exists() ? userDoc.data() : {};
      } catch (firestoreError) {
        console.warn('Firestore read failed or timed out, proceeding with auth data only:', firestoreError);
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

      // Use the actual error message if available, otherwise default
      let errorMessage = error.message || "Login failed";

      // Enhanced Error Mapping
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
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = `Network Error. Origin: ${window.location.origin}. Check Firebase Authorized Domains.`;
      } else if (errorMessage.includes("timed out")) {
        errorMessage = "Connection timed out. Please check your internet.";
      }

      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
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
          url: 'https://smartmarket-3a6bd.web.app/auth',
          handleCodeInApp: false,
        });
      } catch (emailError) {
        console.warn('Verification email send failed:', emailError);
      }

      // OTOMATİK GİRİŞ YOK - EMAIL VERIFICATION ZORUNLU
      await signOut(auth);

      // LocalStorage temizle (garanti olsun)
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');

      toast({
        title: "Account Created",
        description: "Please check your email to verify your account before logging in.",
        duration: 5000,
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
        url: 'https://smartmarket-3a6bd.web.app/auth',
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