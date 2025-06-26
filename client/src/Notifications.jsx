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
import { IoClose, IoPrint } from "react-icons/io5";
import PageHeader from "./components/PageHeader"
import styles from './styles/Notification.module.css'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [suppliers, setSuppliers] = useState([])
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

  async function fetchSuppliers() {
    try {
      const response = await fetch("http://localhost:5555/supplier", {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json = await response.json()
      if (json.success && json.data) {
        setSuppliers(json.data)
      }
    } catch (e) {
      console.error("Failed to fetch suppliers:", e)
    }
  }

  async function getNotifications() {
    const url = "http://localhost:5555/notifications"
    try {
      const response = await fetch(url)
      const json = await response.json()
      const notificationsJSON = json.data

      const updatedArray = []
      for (const x in notificationsJSON) {
        const notification = notificationsJSON[x]

        // Handle supplier data similar to inventory
        let supplierName = null
        let actualSupplierId = notification.supplierId

        if (notification.supplierId) {
          if (typeof notification.supplierId === 'object' && notification.supplierId !== null) {
            // Supplier is populated (object)
            supplierName = notification.supplierId.supplierName || null
            actualSupplierId = notification.supplierId._id
          } else if (typeof notification.supplierId === 'string') {
            // Supplier is not populated (just ID)
            const supplier = suppliers.find(s => s._id === notification.supplierId)
            supplierName = supplier ? supplier.supplierName : null
            actualSupplierId = notification.supplierId
          }
        }

        const notificationWithSupplier = {
          ...notification,
          supplierName: supplierName,
          supplierId: actualSupplierId // Keep the actual ID
        }
        updatedArray.push(notificationWithSupplier)
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

  // Function to handle reorder form printing
  const handlePrintReorderForm = async (notification) => {
    try {
      // Get supplier info from our state first
      let supplier = null

      if (notification.supplierId) {
        if (typeof notification.supplierId === 'object' && notification.supplierId !== null) {
          // Already populated
          supplier = notification.supplierId
        } else if (typeof notification.supplierId === 'string') {
          // Find from our suppliers state
          supplier = suppliers.find(s => s._id === notification.supplierId)
        }
      }

      if (!supplier) {
        toaster.create({
          title: "No supplier found",
          description: "Cannot generate reorder form - supplier information not available",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        return
      }

      // Create and print the reorder form
      printReorderForm(notification, supplier)

    } catch (error) {
      console.error("Error generating reorder form:", error)
      toaster.create({
        title: "Error",
        description: "Failed to generate reorder form",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Function to generate and print reorder form
  const printReorderForm = (notification, supplier) => {
    const currentDate = new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const reorderQuantity = notification.stockLevel === 'out_of_stock' ? 100 : 50

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reorder Form</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
            color: #333;
          }
          .letterhead {
            text-align: center;
            border-bottom: 3px solid #2d5aa0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .pharmacy-name {
            font-size: 28px;
            font-weight: bold;
            color: #2d5aa0;
            margin-bottom: 5px;
          }
          .pharmacy-address {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .form-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            color: #2d5aa0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .form-section {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #2d5aa0;
          }
          .section-title {
            font-weight: bold;
            font-size: 18px;
            color: #2d5aa0;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .label {
            font-weight: bold;
            color: #555;
            min-width: 150px;
          }
          .value {
            color: #333;
            flex: 1;
            text-align: left;
            padding-left: 20px;
          }
          .product-details {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .urgent-notice {
            background-color: #f8d7da;
            border: 2px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
          }
          .urgent-text {
            color: #721c24;
            font-weight: bold;
            font-size: 16px;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 200px;
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #333;
            margin-bottom: 5px;
            height: 40px;
          }
          .terms {
            margin-top: 30px;
            padding: 15px;
            background-color: #e9ecef;
            border-radius: 5px;
            font-size: 12px;
            color: #6c757d;
          }
          .terms-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #495057;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="pharmacy-name">AVAMI PHARMACY ANONAS</div>
          <div class="pharmacy-address">
            08 Molave, Project 3, Quezon City, 1102 Kalakhang Maynila<br>
            Contact: (02) 8xxx-xxxx | Email: avamipharmacy@gmail.com
          </div>
        </div>

        <div class="form-title">Product Reorder Request Form</div>

        <div class="form-section">
          <div class="section-title">Order Information</div>
          <div class="info-row">
            <span class="label">Date of Request:</span>
            <span class="value">${currentDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Request Type:</span>
            <span class="value">${notification.stockLevel === 'out_of_stock' ? 'URGENT - Out of Stock' : 'Low Stock Replenishment'}</span>
          </div>
          <div class="info-row">
            <span class="label">Requested By:</span>
            <span class="value">Pharmacy Manager</span>
          </div>
        </div>

        ${notification.stockLevel === 'out_of_stock' ? `
        <div class="urgent-notice">
          <div class="urgent-text">⚠️ URGENT REORDER REQUIRED ⚠️</div>
          <div>This product is completely out of stock and needs immediate replenishment</div>
        </div>
        ` : ''}

        <div class="form-section">
          <div class="section-title">Supplier Information</div>
          <div class="info-row">
            <span class="label">Supplier Name:</span>
            <span class="value">${supplier.supplierName}</span>
          </div>
          <div class="info-row">
            <span class="label">Contact Email:</span>
            <span class="value">${supplier.supplierEmail}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone Number:</span>
            <span class="value">${supplier.supplierNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Address:</span>
            <span class="value">${supplier.supplierAddress}</span>
          </div>
        </div>

        <div class="product-details">
          <div class="section-title">Product Details & Order Request</div>
          <div class="info-row">
            <span class="label">Product Name:</span>
            <span class="value">${notification.itemInvolved}</span>
          </div>
          <div class="info-row">
            <span class="label">Current Stock Level:</span>
            <span class="value">${notification.currentStock} units ${notification.stockLevel === 'out_of_stock' ? '(OUT OF STOCK)' : '(LOW STOCK)'}</span>
          </div>
          <div class="info-row">
            <span class="label">Requested Quantity:</span>
            <span class="value">${reorderQuantity} units</span>
          </div>
          <div class="info-row">
            <span class="label">Expected Delivery:</span>
            <span class="value">Within 3-5 business days</span>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">Order Details</div>
          <p><strong>Dear ${supplier.supplierName},</strong></p>
          <p>We would like to place an order for <strong>${reorderQuantity} units</strong> of <strong>${notification.itemInvolved}</strong>. 
          ${notification.stockLevel === 'out_of_stock' ?
        'This is an urgent request as we are currently out of stock for this essential item.' :
        'Our current inventory is running low and we need to replenish our stock to meet customer demand.'
      }</p>
          
          <p>Please confirm the availability and provide us with:</p>
          <ul>
            <li>Unit price and total cost</li>
            <li>Expected delivery date</li>
            <li>Payment terms</li>
            <li>Any minimum order requirements</li>
          </ul>

          <p>We appreciate your prompt response and look forward to continuing our business relationship.</p>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div><strong>Pharmacy Manager</strong></div>
            <div>Avami Pharmacy Anonas</div>
            <div>Date: ${currentDate}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div><strong>Supplier Representative</strong></div>
            <div>${supplier.supplierName}</div>
            <div>Date: _______________</div>
          </div>
        </div>

        <div class="terms">
          <div class="terms-title">Terms and Conditions:</div>
          <p>• All orders are subject to supplier confirmation and availability<br>
          • Payment terms to be confirmed upon order acceptance<br>
          • Delivery charges may apply based on order value and location<br>
          • Products must meet quality standards and expiration date requirements<br>
          • This form serves as an official purchase request from Avami Pharmacy Anonas</p>
        </div>
      </body>
      </html>
    `

    // Create new window and print
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }

    // Show success message
    toaster.create({
      title: "Reorder form generated",
      description: "The reorder form has been sent to printer",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  // Function to check if notification is a stock alert - UPDATED TO BE MORE FLEXIBLE
  const isStockAlert = (notification) => {
    console.log("Checking stock alert for notification:", {
      notificationType: notification.notificationType,
      stockLevel: notification.stockLevel,
      itemInvolved: notification.itemInvolved,
      supplierId: notification.supplierId
    })

    // Check for stock alert type OR if it contains stock level indicators
    return (notification.notificationType === 'stock_alert' &&
      (notification.stockLevel === 'low_stock' || notification.stockLevel === 'out_of_stock')) ||
      // Alternative check - if the notification mentions stock levels
      (notification.stockLevel &&
        (notification.stockLevel === 'low_stock' || notification.stockLevel === 'out_of_stock')) ||
      // Another alternative - check notification title/message for stock keywords
      (notification.notificationTitle &&
        (notification.notificationTitle.toLowerCase().includes('low stock') ||
          notification.notificationTitle.toLowerCase().includes('out of stock'))) ||
      (notification.notificationMessage &&
        (notification.notificationMessage.toLowerCase().includes('low stock') ||
          notification.notificationMessage.toLowerCase().includes('out of stock')))
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
      case 'stock_alert':
        return 'warning'
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
      case 'stock_alert':
        return 'orange'
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

  // Function to check if supplier data is available
  const hasSupplierData = (notification) => {
    if (!notification.supplierId) return false

    if (typeof notification.supplierId === 'object' && notification.supplierId !== null) {
      return true // Already populated
    } else if (typeof notification.supplierId === 'string') {
      return suppliers.find(s => s._id === notification.supplierId) !== undefined
    }

    return false
  }

  useEffect(() => {
    // Fetch suppliers first, then notifications
    fetchSuppliers().then(() => {
      getNotifications()
    })
    console.log("fetchSuppliers and getNotifications() Triggered")
  }, [])

  // Re-fetch notifications when suppliers are loaded to properly populate supplier data
  useEffect(() => {
    if (suppliers.length > 0) {
      getNotifications()
    }
  }, [suppliers])

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
              const showReorderButton = isStockAlert(notification)
              const supplierAvailable = hasSupplierData(notification)

              // Debug log for each notification
              console.log(`Notification ${index}:`, {
                _id: notification._id,
                isStockAlert: showReorderButton,
                supplierId: notification.supplierId,
                supplierAvailable: supplierAvailable,
                itemInvolved: notification.itemInvolved,
                notificationType: notification.notificationType,
                stockLevel: notification.stockLevel
              })

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
                      <HStack spacing={2}>
                        {/* Reorder button - Only show if stock alert and supplier available */}
                        {showReorderButton && supplierAvailable && (
                          <IconButton
                            className={styles.printButton}
                            onClick={() => handlePrintReorderForm(notification)}
                            aria-label="Print reorder form"
                            size="sm"
                            variant="solid"
                            colorScheme="blue"
                            title="Print Reorder Form"
                          >
                            <IoPrint />
                          </IconButton>
                        )}
                        <IconButton
                          className={styles.deleteButton}
                          as={IoClose}
                          onClick={() => handleDelete(notification)}
                          aria-label="Delete notification"
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                        />
                      </HStack>
                    </HStack>
                  </Box>

                  {/* Body */}
                  <Box className={styles.cardBody}>
                    <VStack className={styles.cardBodyContent} align="start" spacing={3}>
                      <Text className={styles.cardMessage}>
                        {notification.notificationMessage}
                      </Text>

                      {/* Show current stock level for stock alerts */}
                      {showReorderButton && (
                        <Box className={styles.stockInfo}
                          style={{
                            backgroundColor: notification.stockLevel === 'out_of_stock' ? '#fed7d7' : '#fff3cd',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: notification.stockLevel === 'out_of_stock' ? '1px solid #fc8181' : '1px solid #fbd38d'
                          }}>
                          <Text fontSize="sm" fontWeight="medium">
                            {notification.currentStock !== undefined ?
                              `Current Stock: ${notification.currentStock} units` :
                              'Stock level needs attention'
                            }
                            {supplierAvailable ? (
                              <Text as="span" fontSize="xs" color="gray.600" ml={2}>
                                • Reorder form available
                              </Text>
                            ) : (
                              <Text as="span" fontSize="xs" color="red.600" ml={2}>
                                • No supplier found
                              </Text>
                            )}
                          </Text>
                        </Box>
                      )}

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
