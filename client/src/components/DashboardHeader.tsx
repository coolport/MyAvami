import { Flex, Button, Text, Icon, Image, Separator, HStack } from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import avamiLogoWhite from '../assets/logowhite.png';
import { useEffect, useState } from 'react';
import { getSessionUser, logout } from '../services/authService';

const DashboardHeader = () => {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const loadRole = async () => {
      const user = await getSessionUser();
      if (user) setUserRole(user.role);
    };
    loadRole();
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
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
      <HStack>
        <HStack>
          <Icon as={FiUser} boxSize={6} />
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
          colorScheme="whiteAlpha"
        >
          Logout
        </Button>
      </HStack>

      {/* Right Section: Logo */}
      <Image src={avamiLogoWhite} alt="Avami Logo" height="2rem" />
    </Flex>
  );
};

export default DashboardHeader;
