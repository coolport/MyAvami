import { HStack, Card, Button, Box, Stack, Image, Float, Table, Text, Badge, IconButton, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import PageHeader from "./components/PageHeader";

function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function handleDelete(notification) {
    // Put selected item in the deleteConfirm state, will render
    // the popup, n be target in confirmDelete
    setDeleteConfirm(notification)
  }

  async function confirmDelete() {
    const url = `http://localhost:5555/notifications/${deleteConfirm._id}`;
    console.log("deleteConfirm: ", deleteConfirm)
    console.log("Deleting ID:", deleteConfirm?._id);
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      console.log("DELETE RESPONSE OBJ: ", response);

      if (response.ok) {
        // IF GOODS
        // 1. reset deleteConfirm state, unmountingit, and remove notif focus
        setDeleteConfirm(null);
        // 2. REFRESH LIST!
        getNotifications();
        alert("Notification Deleted");
      }
    } catch (error) {
      console.error("Delete error: ", error.message);
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null)
  }

  async function getNotifications() {
    const url = "http://localhost:5555/notifications";
    try {
      const response = await fetch(url);
      const json = await response.json();
      const notificationsJSON = json.data;

      const updatedArray = [];
      for (const x in notificationsJSON) {
        updatedArray.push(notificationsJSON[x]);
      }

      // Reverse the array to show latest first
      const reversedArray = updatedArray.reverse();
      console.log("Updated Array (latest first): ", reversedArray);
      setNotifications(reversedArray);
    } catch (error) {
      console.error("Server error:", error.message);
    }
  }

  // Function to get notification type color and variant
  const getNotificationStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return { colorScheme: 'green', variant: 'subtle' };
      case 'warning':
        return { colorScheme: 'orange', variant: 'subtle' };
      case 'error':
        return { colorScheme: 'red', variant: 'subtle' };
      case 'info':
        return { colorScheme: 'blue', variant: 'subtle' };
      default:
        return { colorScheme: 'gray', variant: 'subtle' };
    }
  };

  // Function to format date/time if available
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    getNotifications();
    console.log("getNotifications() Triggered")
  }, [])

  return (
    <>
      <PageHeader title={"Notifications"} />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <Box
          position='fixed'
          top={0}
          left={0}
          width='100%'
          height='100%'
          bg='blackAlpha.600'
          display='flex'
          justifyContent='center'
          alignItems='center'
          zIndex={1000}
        >
          <Card.Root
            bg='white'
            padding={6}
            borderRadius='xl'
            boxShadow='2xl'
            width='400px'
            maxWidth='90vw'
          >
            <VStack spacing={4}>
              <Text fontSize='xl' fontWeight='bold' color='red.600'>
                Confirm Delete
              </Text>
              <Text textAlign='center' color='gray.600'>
                Are you sure you want to delete this notification?
              </Text>
              <Box
                p={4}
                bg='gray.50'
                borderRadius='lg'
                width='100%'
              >
                <Text fontWeight='semibold' color='gray.800' textAlign='center'>
                  {deleteConfirm.notificationTitle}
                </Text>
              </Box>
              <HStack spacing={3} width='100%'>
                <Button
                  colorScheme='red'
                  onClick={confirmDelete}
                  flex={1}
                >
                  Delete
                </Button>
                <Button
                  variant='outline'
                  onClick={cancelDelete}
                  flex={1}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </Card.Root>
        </Box>
      )}

      {/* NOTIFICATIONS CONTAINER */}
      <Box maxWidth="800px" margin="0 auto" padding={8}>
        {notifications.length === 0 ? (
          <Card.Root textAlign="center" padding={12} borderRadius="xl">
            <VStack spacing={4}>
              <Text fontSize="xl" color="gray.500" fontWeight="medium">
                No notifications found
              </Text>
              <Text color="gray.400">
                Notifications will appear here when system events occur
              </Text>
            </VStack>
          </Card.Root>
        ) : (
          <VStack spacing={6} align="stretch">
            {notifications.map((notification, index) => {
              const notificationStyle = getNotificationStyle(notification.notificationType);

              return (
                <Card.Root
                  key={notification._id || index}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                  overflow="hidden"
                  bg="white"
                  _hover={{
                    transform: 'translateY(-2px)',
                    borderColor: `${notificationStyle.colorScheme}.300`,
                    transition: 'all 0.3s ease'
                  }}
                  height="fit-content"
                >
                  {/* Header */}
                  <Card.Header bg="gray.50" pb={3}>
                    <HStack justify="space-between" align="flex-start">
                      <VStack align="flex-start" spacing={2} flex={1}>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="gray.800"
                          lineHeight="short"
                        >
                          {notification.notificationTitle}
                        </Text>
                        {notification.notificationType && (
                          <Badge
                            {...notificationStyle}
                            textTransform="capitalize"
                          >
                            {notification.notificationType}
                          </Badge>
                        )}
                      </VStack>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(notification)}
                        aria-label="Delete notification"
                      >
                        ×
                      </IconButton>
                    </HStack>
                  </Card.Header>

                  {/* Body */}
                  <Card.Body py={4}>
                    <VStack align="flex-start" spacing={3}>
                      <Text
                        color="gray.700"
                        fontSize="md"
                        lineHeight="relaxed"
                      >
                        {notification.notificationMessage}
                      </Text>

                      {notification.notificationUserInvolved && (
                        <HStack>
                          <Text fontSize="sm" color="gray.500" fontWeight="medium" minW="12">
                            User:
                          </Text>
                          <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                            {notification.notificationUserInvolved}
                          </Text>
                        </HStack>
                      )}

                      {notification.createdAt && (
                        <Text fontSize="sm" color="gray.600">
                          {formatDate(notification.createdAt)}
                        </Text>
                      )}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </VStack>
        )}
      </Box>
    </>
  )
}

export default Notifications
