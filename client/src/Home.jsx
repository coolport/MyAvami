import React from 'react';
import { Box, SimpleGrid, Icon, Text, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import {
  FiBox,
  FiShoppingCart,
  FiClock,
  FiTool,
  FiBarChart2,
  FiHelpCircle,
  FiBell,
  FiUserPlus,
} from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import DashboardHeader from './components/DashboardHeader';

const features = [
  { label: 'Inventory', icon: FiBox, path: '/inventory' },
  { label: 'Transact', icon: FiShoppingCart, path: '/sales' },
  { label: 'Transaction History', icon: FiClock, path: '/transacthistory' },
  { label: 'Notifications', icon: FiBell, path: '/notifications' },
  { label: 'OldTransact', icon: FiShoppingCart, path: '/entry' },
  { label: 'Reports', icon: FiBarChart2, path: '/reports' },
  { label: 'Maintenance', icon: FiTool, path: '/maintenance' },
  { label: 'Help', icon: FiHelpCircle, path: '/help' },
  { label: 'Registration', icon: FiUserPlus, path: '/registration' },
];

const Homepage = () => {
  return (
    <>
      <DashboardHeader />
      <Box p={12}>
        <SimpleGrid
          columns={[1, 2, 3, 4,]}
          spacing={12}
          maxW="1400px"
          mx="auto"
        >
          {features.map((feature) => (
            <LinkBox
              as="article"
              key={feature.label}
              bg="white"
              borderRadius="16px"
              p={12}
              m={3}
              textAlign="center"
              transition="all 0.3s ease"
              // boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
              border="1px solid"
              borderColor="gray.200"
              minH="180px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              _hover={{
                bg: 'lightskyblue',
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0, 104, 166, 0.3)',
                color: 'white'
              }}
            >
              <LinkOverlay as={RouterLink} to={feature.path}>
                <Icon as={feature.icon} boxSize={12} mb={4} color="#0068A6"
                  _groupHover={{ color: 'white' }}
                />
                <Text fontSize="lg" fontWeight="semibold" color="gray.700"
                  _groupHover={{ color: 'white' }}
                >{feature.label}</Text>
              </LinkOverlay>
            </LinkBox>
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
};

export default Homepage;
