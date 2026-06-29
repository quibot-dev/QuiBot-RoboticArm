import { useState } from 'react';
import { NavLink } from "react-router-dom";
import axios from 'axios'
import Titol from '../components/Titol';
import Input from '../components/Input';
import { LazyLoadImage } from "react-lazy-load-image-component"
const { createHash } = require('crypto');

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}


export default function Login({ user, setUser }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogIn = () => {

    if (email.length > 0 && password.length > 0) {

      console.log(email, password, hash(password))
      axios
        .post('/api/usuaris/accedir', {
          email: email,
          contrassenya: hash(password)
        })
        .then(res => {
          setUser({
            is_logged: res.data.acces,
            correu: res.data.correu,
            nom: res.data.nom,
            cognom1: res.data.cognom1,
            cognom2: res.data.cognom2,
            rol: res.data.rol,
            id: res.data.id,
            permis: res.data.permis,
            ev3_id: res.data.ev3_id,
            vinculat: res.data.Vinculat
          })

        })
        .catch(error => console.error(`Error: ${error}`))
    }
  };

  return (
    <>
      <Titol titol="Accedeix al teu perfil" noPadding={false} />

      <div className='mt-5 mx-auto max-w-xl rounded-xl p-6 shadow bg-gray-200'>
        <form>
          <Input name="Correu" value={email} setValue={setEmail} type="email" />
          <Input name="Contrasenya" value={password} setValue={setPassword} type="password" />
        </form>

        <div className='mt-10 flex items-center justify-center'>
          <NavLink className="bg-teal-400 hover:bg-Tronja text-white bg-Tronja-clar font-bold py-2 px-4 rounded w-full text-center" to='/' style={{ transition: "all .15s ease" }} onClick={() => handleLogIn()} > ENTRA </NavLink>
        </div>
      </div>

      <div className="flex justify-center mt-24">
        <LazyLoadImage effect="blur" src="/logos.png"  />
      </div>
    </>
  )
}
