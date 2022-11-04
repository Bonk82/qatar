

import { deleteScore, readScores, saveScore, updateScore } from '../connection/firebase';
import { useState } from 'react';

export const Dashboard = () => {
  const [users, setUsers] = useState([]);
  // let users=[2,4]
  // const s = saveScore(2000,22)
  // console.log(s);
  const registrar = async ()=>{
    await saveScore(5,5);
    mostrar();
  }

  const mostrar = async()=>{
    const list = await readScores();
    // console.log(list);
    setUsers(list);
    // users = list;
    setTimeout(() => {
      console.log(users);
    }, 200);
  }

  const eliminar = ()=> deleteScore();

  const eliminarId = async id=>{
    await deleteScore(id);
    mostrar();
  }
  const actualizar = async id => {
    await updateScore(id);
    mostrar();
  }
  return (
    <div>
      <h1>Dashboarad Mundial 2022</h1> 
      <button onClick={registrar}>Registrar</button>
      <button onClick={mostrar}>Mostrar</button>
      <button onClick={eliminar}>Eliminar el primer registro</button>
      <ul>
      {users.map(u=>{
        return (<li key={u.id}>
          {u.id} -{u.born}
          <button onClick={()=>eliminarId(u.id)} key={u.id}>Eliminar</button>
          <button onClick={()=>actualizar(u.id)} key={'btnudt'+u.id}>actualizar born</button>
        </li>)
      })}
      </ul>
    </div>
  )
}
