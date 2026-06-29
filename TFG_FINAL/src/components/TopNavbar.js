import { NavLink } from "react-router-dom";
import axios from "axios";

export default function Navbar({ user, setUser }) {

    const handleLogOut = () => {
        axios
            .post('/api/usuaris/sortir', {
                user_correu: user.correu
            })
            .then(res => {
                setUser({ is_logged: false })
            })
            .catch(error => console.error(`Error: ${error}`))
    };

    return (
        <nav className="w-full flex  justify-between bg-Blau-clar text-Groc-clar py-4 px-10 shadow">
            <NavLink className="font-bold text-2xl flex items-center justify-center" to="/"> QUIBOT </NavLink>
            <div className="flex items-center justify-center">
                {!user.is_logged ?
                    null
                    :
                    <>
                        {user.rol === "Administrador" ?

                            <p className="flex items-center justify-center">{user.nom} - {user.correu}</p>
                            :
                            <div className="flex flex-row">

                                <div className="flex">
                                    <p className="mr-10 flex items-center justify-center">{user.nom} - {user.correu}</p>
                                </div>

                                <div className="flex">
                                    <NavLink onClick={() => handleLogOut()} className="flex shadow font-bold rounded-full bg-Tronja-clar hover:bg-Tronja px-3 py-2 leading-snug" to="/"> Sortir </NavLink>
                                </div>

                            </div>
                        }

                    </>

                }
            </div>
        </nav>
    )
};

