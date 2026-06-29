import AdminSideNavbar from "./sideNavbar/Admin";

export default function SideNavbar({ user, setUser,navState, setNavState }) {
   return (
      <>
         {user.rol === "Administrador" ? 
            <AdminSideNavbar user={user} setUser={setUser} navState={navState} setNavState={setNavState}/>
         : 
            null
        }
        
      </>
   )
}
