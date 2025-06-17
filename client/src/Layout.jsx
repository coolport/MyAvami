import { Outlet } from "react-router"
import Navbar from "./components/Navbar"
import { Box } from "@chakra-ui/react"

function Layout() {

  return (
    <>
      <Navbar />
      {/* <Box minH={"100vh"} bgColor={"#F3F8F9"}> */}
      <Box minH={"100vh"} bgColor={"#ECF1EA"}>
        {/* <Box minH={"100vh"} bgColor={"black"}> */}
        <Outlet />
      </Box >
    </>
  )
}

export default Layout


