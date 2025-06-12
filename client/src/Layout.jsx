import { Outlet } from "react-router"
import Navbar from "./components/Navbar"
import { Box } from "@chakra-ui/react"

function Layout() {

  return (
    <>
      <Navbar />
      <Box minH={"100vh"} bgColor={"#F3F8F9"}>
        <Outlet />
      </Box >
    </>
  )
}

export default Layout


