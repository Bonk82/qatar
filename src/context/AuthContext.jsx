import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, listar } from "../connection/firebase";

const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("There is no Auth provider");
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    const googleProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => signOut(auth);

  const resetPassword = async (email) => sendPasswordResetEmail(auth, email);

  const verRol = async (cu) =>{
    const usuarios = await listar('usuario')
    console.log('verrol',usuarios,cu);
    const elUser = cu;
    if(cu){
      const rol =  usuarios.filter(f=>f.userID === cu?.uid)[0]?.tipo;
      const estado =  usuarios.filter(f=>f.userID === cu?.uid)[0]?.estado;
      elUser.rol = rol;
      elUser.estado = estado;
    }
    setUser(elUser);
    setLoading(false);
  } 

  useEffect(() => {
    const unsubuscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log({ currentUser });
      // setUser(currentUser);
      verRol(currentUser);
      // setLoading(false);
    });
    return () => unsubuscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <authContext.Provider
      value={{
        signup,
        login,
        user,
        logout,
        loading,
        loginWithGoogle,
        resetPassword,
      }}
    >
      {children}
    </authContext.Provider>
  );
}