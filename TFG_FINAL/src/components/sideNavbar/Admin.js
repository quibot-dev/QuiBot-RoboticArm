import { NavLink } from "react-router-dom"
import { LazyLoadImage } from "react-lazy-load-image-component"
import axios from "axios"


const AdminSideNavbar = ({ user, setUser, navState, setNavState }) => {

    let path_home = '/administrador'
    let path_usuaris = '/administrador/usuaris'
    let path_ev3 = '/administrador/EV3'
    let path_nou_estudiant = '/administrador/nouEstudiant'
    let log_out_path = "/"

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
    const saveNavState = (state) => {
        setNavState(state)
    };

    return (
        <aside id="sidebar" className="fixed z-20 h-full top-0 left-0 pt-16 lg:flex flex-shrink-0 flex-col transition-width duration-75" aria-label="Sidebar">
            <div className="relative flex-1 flex flex-col min-h-0 bg-blue-100 pt-0">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex-1 px-3">
                        <ul className="space-y-2 pb-2">
                            <li>
                                <div className={`flex flex-row group ${(navState === "home") ? 'bg-blue-200 rounded-full text-gray-900' : 'text-gray-500'}`}>
                                    <svg className="mt-2 ml-2 w-6 h-6 group-hover:text-gray-900 flex-shrink-0  transition duration-75 " fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                                    </svg>
                                    <NavLink onClick={() => saveNavState("home")} className="text-base group-hover:text-gray-900  font-normal rounded-xl flex items-center p-2  group" to={path_home}> Home </NavLink>

                                </div>

                            </li>
                            <li>
                                <div className={`flex flex-row group ${(navState === "usuaris") ? 'bg-blue-200 rounded-full text-gray-900' : 'text-gray-500'}`}>
                                    <svg className="mt-2 ml-2 w-6 h-6  group-hover:text-gray-900 flex-shrink-0 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                                    </svg>
                                    <NavLink onClick={() => saveNavState("usuaris")} className="text-base  font-normal rounded-xl flex items-center p-2 group-hover:text-gray-900 group" to={path_usuaris}> Usuaris </NavLink>
                                </div>
                            </li>
                            <li>
                                <div className={`flex flex-row group ${(navState === "EV3") ? 'bg-blue-200 rounded-full text-gray-900' : 'text-gray-500'}`}>
                                    <svg className="mt-2 ml-2 w-6 h-6  flex-shrink-0  group-hover:text-gray-900 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                    </svg>
                                    <NavLink onClick={() => saveNavState("EV3")} className="text-base group-hover:text-gray-900  font-normal rounded-xl flex items-center p-2  group" to={path_ev3}> Robots </NavLink>
                                </div>
                            </li>

                        </ul>
                        <li>
                                <div className={`flex flex-row group ${(navState === "visio") ? 'bg-blue-200 rounded-full text-gray-900' : 'text-gray-500'}`}>
                                    <svg className="mt-2 ml-2 w-6 h-6 flex-shrink-0 group-hover:text-gray-900 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    <NavLink onClick={() => saveNavState("visio")} className="text-base group-hover:text-gray-900 font-normal rounded-xl flex items-center p-2 group" to="/administrador/visio"> Visió </NavLink>
                                </div>
                            </li>
                        <hr className="border-gray-400 mt-5 mb-5 mr-2 ml-2"></hr>
                        <ul className="space-y-2 pb-2">
                            <li>
                                <div className={`flex flex-row group ${(navState === "nouEstudiant") ? 'bg-blue-200 rounded-full text-gray-900' : 'text-gray-500'}`}>
                                    <svg className="mt-2 ml-2 w-6 h-6 flex-shrink-0  group-hover:text-gray-900 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                                    </svg>
                                    <NavLink onClick={() => saveNavState("nouEstudiant")} className="text-base font-normal rounded-xl flex items-center p-2 group-hover:text-gray-900 group" to={path_nou_estudiant}> Afegir Usuari </NavLink>
                                </div>
                            </li>
                            <li>
                                <div className="flex flex-row group">
                                    <svg className="mt-2 ml-2 w-6 h-6 text-gray-500 group-hover:text-gray-900 flex-shrink-0 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"></path>
                                    </svg>
                                    <NavLink onClick={() => handleLogOut()} className="text-base text-gray-500 group-hover:text-gray-900  font-normal rounded-xl flex items-center p-2 group" to={log_out_path}> Sortir </NavLink>
                                </div>

                            </li>

                        </ul>
                    </div>
                    <div className="flex-1 w-40 mt-67">
			<LazyLoadImage effect="blur" src="/logo-qui-bot-capcalera.png" className="hidden xl:block mb-2"/>
                        <LazyLoadImage effect="blur" src="/logo1.png" className=" hidden xl:block" />
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default AdminSideNavbar
