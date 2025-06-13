import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Text,
  Dialog,
  Badge,
  IconButton,
  VStack,
  HStack,
  Spacer,
} from "@chakra-ui/react"
import { Toaster, toaster } from "./components/ui/toaster.jsx"
import { IoClose } from "react-icons/io5";
import PageHeader from "./components/PageHeader"
import styles from './styles/Notification.module.css'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function handleDelete(notification) {
    setDeleteConfirm(notification)
    setIsDialogOpen(true)
  }

  async function confirmDelete() {
    const url = `http://localhost:5555/notifications/${deleteConfirm._id}`
    console.log("deleteConfirm: ", deleteConfirm)
    console.log("Deleting ID:", deleteConfirm?._id)

    try {
      const response = await fetch(url, {
        method: "DELETE",
      })
      console.log("DELETE RESPONSE OBJ: ", response)

      if (response.ok) {
        setDeleteConfirm(null)
        setIsDialogOpen(false)
        getNotifications()
        toaster.create({
          title: "Notification deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Delete error: ", error.message)
      toaster.create({
        title: "Error deleting notification",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null)
    setIsDialogOpen(false)
  }

  async function getNotifications() {
    const url = "http://localhost:5555/notifications"
    try {
      const response = await fetch(url)
      const json = await response.json()
      const notificationsJSON = json.data

      const updatedArray = []
      for (const x in notificationsJSON) {
        updatedArray.push(notificationsJSON[x])
      }

      // Reverse the array to show latest first
      const reversedArray = updatedArray.reverse()
      console.log("Updated Array (latest first): ", reversedArray)
      setNotifications(reversedArray)
    } catch (error) {
      console.error("Server error:", error.message)
      toaster.create({
        title: "Error fetching notifications",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Function to get notification type class name
  const getNotificationClassName = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      case 'info':
        return 'info'
      default:
        return 'default'
    }
  }

  // Function to get badge color scheme
  const getBadgeColorScheme = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return 'green'
      case 'warning':
        return 'orange'
      case 'error':
        return 'red'
      case 'info':
        return 'blue'
      default:
        return 'gray'
    }
  }

  // Function to format date/time if available
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  useEffect(() => {
    getNotifications()
    console.log("getNotifications() Triggered")
  }, [])

  return (
    <>
      <PageHeader title={"Notifications"} />
      <Toaster />
      {/* DELETE CONFIRMATION MODAL */}
      <Dialog.Root open={isDialogOpen} onOpenChange={({ open }) => setIsDialogOpen(open)}>
        <Dialog.Backdrop className={styles.modalOverlay} />
        <Dialog.Positioner>
          <Dialog.Content className={styles.modalCard}>
            <Dialog.Header className={styles.modalTitle}>
              <Dialog.Title>Confirm Delete</Dialog.Title>
              <Dialog.CloseTrigger onClick={cancelDelete} />
            </Dialog.Header>
            <Dialog.Body className={styles.modalContent}>
              <Text className={styles.modalDescription}>
                Are you sure you want to delete this notification?
              </Text>
              {deleteConfirm && (
                <Box className={styles.modalNotificationPreview}>
                  <Text className={styles.modalNotificationTitle}>
                    {deleteConfirm.notificationTitle}
                  </Text>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer className={styles.modalButtons}>
              <Button
                className={`${styles.modalButton} ${styles.modalDeleteButton}`}
                onClick={confirmDelete}
                colorScheme="red"
                mr={3}
              >
                Delete
              </Button>
              <Button
                className={styles.modalButton}
                onClick={cancelDelete}
                variant="outline"
              >
                Cancel
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* NOTIFICATIONS CONTAINER */}
      <Box className={styles.container}>
        {notifications.length === 0 ? (
          <Box className={styles.emptyState}>
            <VStack className={styles.emptyStateContent} spacing={4}>
              <Text className={styles.emptyStateTitle} fontSize="xl" fontWeight="bold">
                No notifications found
              </Text>
              <Text className={styles.emptyStateDescription} color="gray.500">
                Notifications will appear here when system events occur
              </Text>
            </VStack>
          </Box>
        ) : (
          <VStack className={styles.notificationsList} spacing={4} align="stretch">
            {notifications.map((notification, index) => {
              const notificationClass = getNotificationClassName(notification.notificationType)
              const badgeColorScheme = getBadgeColorScheme(notification.notificationType)

              return (
                <Box
                  key={notification._id || index}
                  className={`${styles.notificationCard} ${styles[notificationClass]}`}
                  borderRadius="md"
                  shadow="sm"
                  overflow="hidden"
                >
                  {/* Header */}
                  <Box className={styles.cardHeader}>
                    <HStack className={styles.cardHeaderContent} spacing={4}>
                      <HStack className={styles.cardHeaderLeft} spacing={3} flex={1}>
                        <Text className={styles.cardTitle} fontWeight="semibold" fontSize="lg">
                          {notification.notificationTitle}
                        </Text>
                        {notification.notificationType && (
                          <Badge
                            className={`${styles.badge} ${styles[notificationClass]}`}
                            colorScheme={badgeColorScheme}
                            variant="subtle"
                          >
                            {notification.notificationType}
                          </Badge>
                        )}
                      </HStack>
                      <IconButton
                        className={styles.deleteButton}
                        icon={<IoClose />}
                        onClick={() => handleDelete(notification)}
                        aria-label="Delete notification"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                      />
                    </HStack>
                  </Box>

                  {/* Body */}
                  <Box className={styles.cardBody}>
                    <VStack className={styles.cardBodyContent} align="start" spacing={3}>
                      <Text className={styles.cardMessage}>
                        {notification.notificationMessage}
                      </Text>

                      {notification.notificationUserInvolved && (
                        <HStack className={styles.userInfo} spacing={2}>
                          <Text className={styles.userLabel} fontWeight="medium" color="gray.600">
                            User:
                          </Text>
                          <Text className={styles.userName} fontWeight="semibold">
                            {notification.notificationUserInvolved}
                          </Text>
                        </HStack>
                      )}

                      {notification.createdAt && (
                        <Text className={styles.timestamp} fontSize="sm" color="gray.500">
                          {formatDate(notification.createdAt)}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>
    </>
  )
}

export default Notifications
