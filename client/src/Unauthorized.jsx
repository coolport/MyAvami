import { useEffect, useState } from "react"
import { fetchUser } from "./services/getCurrentUser"


function Unauthorized() {
  const [user, setUser] = useState();

  useEffect(() => {
    const usernow = fetchUser()
    setUser(usernow)
  }, [])

  return (
    <>
      <p style={{ color: "black" }}>Unauthorized access. Invalid credentials.</p>
      <p style={{ color: "black" }}>{user}</p>
    </>
  )
}

export default Unauthorized
