import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore,collection, addDoc,getDocs, getDoc, deleteDoc,doc, updateDoc, serverTimestamp   } from "firebase/firestore";
import {createUserWithEmailAndPassword, getAuth} from 'firebase/auth'


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyDw2yYJ_Lw4fJr9pmBBCdfZIMXacwyD624",

  authDomain: "mundial22-8981f.firebaseapp.com",

  projectId: "mundial22-8981f",

  storageBucket: "mundial22-8981f.appspot.com",

  messagingSenderId: "718337084302",

  appId: "1:718337084302:web:4a5bd1d7fb185c2b5432df",

  measurementId: "G-LZWX20EKP6"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const crearUsuario = async(email,password) =>{
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log(user);
      // ...
    })
    .catch((error) => {
      console.log(error.code,error.message);
      // ..
    });
}


export const saveScore = async(scoreA,scoreB) => {
  console.log(scoreA,scoreB);
  
  // return scoreA + scoreB;
  try {
    const docRef = await addDoc(collection(db, "users"), {
      first: "Ada",
      last: "Lovelace",
      born: 1815
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const readScores = async()=>{
  const usuarios = await getDocs(collection(db, "users"));
  let u = [];
   usuarios.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data()}`,doc.data());
    const obj = doc.data()
    obj.id = doc.id;
    u.push(obj)
  });

  return u;
}

// export const deleteScore = async id=>{
//   await deleteDoc(doc(db, "users"),id);
// }

export const deleteScore = async id=>{
  let uid = await (await getDocs(collection(db, "users"))).docs[0].id;
  console.log(uid);
  if(id) uid = id;
  await deleteDoc(doc(db, "users",uid));
}

export const updateScore = async id=>{
  const usuario = await (getDoc(doc(db, "users",id))).data();//rellenar los datos con esta data
  console.log(usuario);
  updateDoc(doc(db,'users',id))
}

//MODELOS GENERALES
export const listar = async(coleccion)=>{
  const usuarios = await getDocs(collection(db, coleccion));
  let u = [];
   usuarios.forEach((doc) => {
    // console.log(`${doc.id} => ${doc.data()}`,doc.data());
    const obj = doc.data()
    obj.id = doc.id;
    u.push(obj)
  });
  return u;
}

export const guardar = async(coleccion,documento) => {
  console.log(coleccion,documento);
  try {
    const docRef = await addDoc(collection(db,coleccion),documento);
    console.log("documento almacenado con ID: ", docRef.id);
    return docRef;
  } catch (e) {
    console.error("Error guardando document0: ", e);
  }
}

export const actualizar = async (coleccion,id,documento)=>{
  const documentoRef = await (getDoc(doc(db, coleccion,id))).data();//rellenar los datos con esta data
  console.log(documentoRef);
  // updateDoc(doc(db,coleccion,id))
  documento.fechaActualizado = serverTimestamp();
  updateDoc(documentoRef,documento)
}

export const eliminar = async (coleccion,id)=>{
  // let uid = (await getDocs(collection(db, coleccion))).docs[0].id;
  // console.log(uid);
  // if(id) uid = id;
  await deleteDoc(doc(db,coleccion,id));
}
