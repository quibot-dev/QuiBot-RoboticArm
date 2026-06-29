// react-router-dom adds acces for all components used in App to Router, Route and Routes
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import TopNavbar from './components/TopNavbar'
import SideNavbar from './components/SideNavbar'

import Users from "./pages/admin/Users"
import Login from "./pages/Login"
import Terminals from "./pages/admin/Terminals"
import EditTerminal from "./pages/admin/edit/EditTerminal"
import NewStudent from "./pages/admin/NewStudent"
import Home from "./Home"
import EditUser from "./pages/admin/edit/EditUser"
import VisionEV3 from "./pages/admin/VisionEV3"
import Card from './Estudiant/Card'
import Container from "./Estudiant/Container"
import Pinça_pipeta from "./Estudiant/Pinça_pipeta"
import Manual_Auto_Veu from "./Estudiant/Manual_Auto_Veu"

export default function App() {

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user_obj')) || []);
    const [navState, setNavState] = useState(JSON.parse(localStorage.getItem('navState')) || "terminals");

    useEffect(() => {
    	if (!user.id) return;
        const interval = setInterval(() => {
            axios
                .post('/api/usuaris/infoUsuari', { id: user.id })
                .then(res => {
                    // console.log("info: ", res.data[0])
                    if (res.data[0].Permis != user.permis || res.data[0].EV3_id != user.ev3_id || res.data[0].Vinculat != user.vinculat) {
                        setUser({
                            is_logged: user.is_logged,
                            correu: user.correu,
                            nom: user.nom,
                            cognom1: user.cognom1,
                            cognom2: user.cognom2,
                            rol: user.rol,
                            id: user.id,
                            permis: res.data[0].Permis,
                            ev3_id: res.data[0].EV3_id,
                            vinculat: res.data[0].Vinculat
                        })
                    }
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, [user])

    useEffect(() => {
        localStorage.setItem('user_obj', JSON.stringify(user));
    }, [user])

    useEffect(() => {
        localStorage.setItem('navState', JSON.stringify(navState));
    }, [navState])


    function RequireAdmin({ children }) {
        if (user.is_logged && user.rol === 'Administrador')
            return children;
        return <Navigate to='/' />
    }

    function RequireStudent({ children }) {
        if (user.is_logged && user.rol === 'Estudiant')
            return children;
        return <Navigate to='/' />
    }


    function RequireLink({ children }) {
        const params = useParams();
        if (user.permis && user.vinculat && user.ev3_id == params.ev3_id)
            return children;
        return <Navigate to='/estudiantat' />
    }



    function IsLogged({ children }) {
        if (user.is_logged) {
            if (user.rol === 'Administrador') {
                if ((navState === 'EV3') || (navState === 'usuaris') || (navState === "nouEstudiant")) {
                    setNavState('home')
                    return <Navigate to={"/Administrador"} />
                }
                return <Navigate to={"/Administrador"} />
            }
            return <Navigate to={"/Estudiant"} />
        }
        return children;
    }

    return (
        <Router forceRefresh>
            <div className="App flex flex-col h-screen text-gray-700 w-full">
                <TopNavbar user={user} setUser={setUser} />
                {user.is_logged ? <SideNavbar user={user} setUser={setUser} navState={navState} setNavState={setNavState} /> : null}
                <main className={user.is_logged ? "flex-1 overflow-y-auto bg-gray-100" : "flex-1 overflow-y-auto"}>
                    <div className="p-10" style={user.rol === "Administrador" ? { marginLeft: 169 } : null}>
                        <Routes>
                            <Route path="*" element={<Navigate to={"/"} />} />
                            <Route path="/" element={<IsLogged> <Login user={user} setUser={setUser} /> </IsLogged>} />

                            {/* administrador */}

                            <Route path={'/administrador'} element={<RequireAdmin> <Home user={user} />   </ RequireAdmin>} />
                            <Route path={'/administrador/usuaris'} element={<RequireAdmin> <Users />  </ RequireAdmin>} />
                            <Route path={'/administrador/usuaris/:id'} element={<RequireAdmin> <EditUser user={user} /> </ RequireAdmin>} />

                            <Route path={'/administrador/nouEstudiant'} element={<RequireAdmin> <NewStudent />  </ RequireAdmin>} />

                            <Route path={'/administrador/EV3'} element={<RequireAdmin> <Terminals />  </ RequireAdmin>} />
                            <Route path={'/administrador/EV3/:id'} element={<RequireAdmin> <EditTerminal user={user} />  </ RequireAdmin>} />
                            <Route path={'/administrador/visio'} element={<RequireAdmin> <VisionEV3 />  </ RequireAdmin>} />

                            {/* estudiant */}

                            <Route path='/estudiant' element={<RequireStudent> <Card user={user} /> </ RequireStudent>} />
                            <Route path='/estudiant/:ev3_id' element={<RequireStudent> <RequireLink> <Pinça_pipeta /> </RequireLink> </ RequireStudent>} />

                            <Route path='/estudiant/:ev3_id/:accessori' element={<RequireStudent>  <RequireLink> <Manual_Auto_Veu /> </RequireLink> </ RequireStudent>} />
                            <Route path='/estudiant/:ev3_id/:accessori/:mode' element={<RequireStudent>  <RequireLink> <Container user={user} /> </RequireLink> </ RequireStudent>} />
                            

                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}
