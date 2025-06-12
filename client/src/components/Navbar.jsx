import { Box, Button, HStack } from "@chakra-ui/react"
import { Link } from "react-router"

function Navbar() {

  return (
    <>
      {/* quick implementation, todo: use useNavigate hook instead of Link so useNavigate(-1) function etc can be used */}
      DEV NAVBAR
      <HStack>
        <Link to="/">
          <Button>Home</Button>
        </Link>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
        <Link to="/inventory">
          <Button>Inventory</Button>
        </Link>
        <Link to="/entry">
          <Button>Add Item</Button>
        </Link>
        <Link to="/transact">
          <Button>Transact</Button>
        </Link>
        <Link to="/transacthistory">
          <Button>Transact History</Button>
        </Link>
        <Link to="/notifications">
          <Button>Notifications</Button>
        </Link>
        <Link to="/sales">
          <Button>Sale</Button>
        </Link>
      </HStack >
    </>
  )
}


export default Navbar


