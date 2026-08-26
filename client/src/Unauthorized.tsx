import { useEffect, useState } from "react";
import { getSessionUser } from "./services/authService";

function Unauthorized() {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      const user = await getSessionUser();
      if (user) setUserRole(user.role);
    };
    loadUser();
  }, []);

  return (
    <>
      <p style={{ color: "black" }}>Unauthorized access. Invalid credentials.</p>
      {userRole && <p style={{ color: "black" }}>{userRole}</p>}
    </>
  )
}

export default Unauthorized
