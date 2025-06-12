import { Flex, Button, Text, Icon, Image, Separator, HStack } from '@chakra-ui/react';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import avamiLogoWhite from '../assets/logowhite.png';

const DashboardHeader = ({ userType = "Admin" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here
    navigate('/');
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
          <Text fontWeight="medium">Admin</Text>
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
