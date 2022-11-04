import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import {createContext,useContext, useEffect, useState} from 'react';
import { auth } from '../connection/firebase';

export const authContext = createContext();

export const useAuth = ()=>{
  const context = useContext(authContext);
  if(!context) throw new Error('No existe un proveedor de contexto Auth');
  return context;
}

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = (email,password)=> createUserWithEmailAndPassword(auth, email, password);
  
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () => {
    const googleProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => signOut(auth);

  const resetPassword = async (email) => sendPasswordResetEmail(auth, email);

  useEffect(() => {
    const unsubuscribe = onAuthStateChanged(auth, (currentUser) => {
      // console.log({ currentUser });
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubuscribe();
  }, []);

  return (
    <authContext.Provider value={{signup,login,user,logout,loading,loginWithGoogle,resetPassword,}}>{children}</authContext.Provider>
  )
}