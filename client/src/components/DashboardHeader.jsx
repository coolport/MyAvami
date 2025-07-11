import { Flex, Button, Text, Icon, Image, Separator, HStack } from '@chakra-ui/react';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import avamiLogoWhite from '../assets/logowhite.png';
import { useEffect, useState } from 'react';
import { fetchUser } from '../services/getCurrentUser';

const DashboardHeader = () => {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setUserRole(fetchUser()); // e.g. 'admin' or 'employee'
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const url = `${import.meta.env.VITE_API_URL}/logout`
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Flex
      height={"60px"}
      as="header"
      justify="space-between"
      align="center"
      position="sticky"
      top="0"
      zIndex="sticky"
      p={3}
      bg="#0068A6"
      color="white"
    >
      {/* Left Section */}
      <HStack spacing={4}>
        <HStack spacing={2}>
          <Icon as={FiUser} boxSize={6} />
          {/* <Text fontWeight="medium">{userType}</Text> */}
          <Text fontWeight="medium" textTransform={"capitalize"}>{userRole}</Text>
        </HStack>
        <Separator orientation="vertical" height="24px" borderColor="white" />
        <Button
          onClick={handleLogout}
          variant="ghost"
          _hover={{
            transform: 'translateY(-4px)',
            bg: 'transparent',
            color: 'white'
          }}
          size="sm"
          leftIcon={<FiLogOut />}
          colorScheme="whiteAlpha"
        >
          Logout
        </Button>
      </HStack>

      {/* Center: Empty */}

      {/* Right Section: Logo */}
      <Image src={avamiLogoWhite} alt="Avami Logo" height="2rem" />
    </Flex>
  );
};

export default DashboardHeader;
