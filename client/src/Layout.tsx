import { Outlet } from "react-router"
import { Box } from "@chakra-ui/react"

function Layout() {
  return (
    <Box minH={"100vh"} bgColor={"#f7f7f7"}>
      <Outlet />
    </Box>
  )
}

export default Layout
