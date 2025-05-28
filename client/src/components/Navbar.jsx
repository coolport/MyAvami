import { Box, Button, HStack } from "@chakra-ui/react"
import { Link } from "react-router"

function Navbar() {

  return (
    <>
      {/* quick implementation, todo: use useNavigate hook instead of Link so useNavigate(-1) function etc can be used */}
      <HStack>
        <Link to="/">
          <Button>Home</Button>
        </Link>
        <Link to="/inventory">
          <Button>Inventory</Button>
        </Link>
        <Link to="/entry">
          <Button>Add Item</Button>
        </Link>
      </HStack >
      <div>
        Navbar
      </div>
    </>
  )
}


export default Navbar


