import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Text,
  Badge,
  IconButton,
  VStack,
  HStack,
  Dialog,
} from "@chakra-ui/react"
import { Toaster, toaster } from "./components/ui/toaster"
import { IoClose } from "react-icons/io5";
import PageHeader from "./components/PageHeader"
import { getTransactions, deleteTransaction } from "./services/userService"
import { formatDateTime } from "./utils/format"
import type { Transaction } from "./types"
import styles from './styles/TransactHistory.module.css'

function TransactHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    getTransactions()
  }, [])

  async function fetchTransactions() {
    try {
      const data = await getTransactions()
      // Reverse to show latest first
      setTransactions([...data].reverse())
    } catch (e) {
      console.error("Error fetching transactions:", e)
      toaster.create({
        title: "Error fetching transactions",
        description: (e as Error).message,
        type: "error",
        duration: 5000,
        closable: true,
      })
    }
  }

  function handleDelete(transaction: Transaction) {
    setDeleteConfirm(transaction)
    setIsDialogOpen(true)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    try {
      await deleteTransaction(deleteConfirm._id)
      setDeleteConfirm(null)
      setIsDialogOpen(false)
      fetchTransactions()
      toaster.create({
        title: "Transaction deleted",
        type: "success",
        duration: 3000,
        closable: true,
      })
    } catch (error) {
      console.error("Delete error:", (error as Error).message)
      toaster.create({
        title: "Error deleting transaction",
        description: (error as Error).message,
        type: "error",
        duration: 5000,
        closable: true,
      })
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null)
    setIsDialogOpen(false)
  }

  function getPaymentMethodColor(method?: string) {
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'green';
      case 'card':
        return 'blue';
      case 'credit':
        return 'purple';
      default:
        return 'gray';
    }
  }

  function generateInvoice(transaction: Transaction) {
    const formattedDate = formatDateTime(transaction.transactionDate)

    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transaction Details#${transaction._id}</title>
      <style>
        body { font-family: sans-serif; padding: 20px; background: white; color: #333; }
        h2 { text-align: center; color: #2D3748; margin-bottom: 30px; }
        .section { margin-bottom: 20px; padding: 15px; background: #F7FAFC; border-radius: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .items-table th, .items-table td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; }
        .items-table th { background-color: #EDF2F7; font-weight: bold; }
        .right { text-align: right; margin-top: 20px; padding: 15px; background: #F0FFF4; border-radius: 8px; }
        .total { color: #22543D; font-size: 1.2em; }
      </style>
    </head>
    <body>
      <h2>Avami Pharmacy - Invoice Details</h2>
      <div class="section">
        <strong>Transaction ID:</strong> ${transaction._id}<br/>
        <strong>Employee:</strong> ${transaction.transactionEmployee}<br/>
        <strong>Date:</strong> ${formattedDate}<br/>
        <strong>Amount Paid:</strong> PHP ${transaction.transactionAmountPaid}<br/>
        <strong>Payment Method:</strong> ${transaction.transactionPaymentMethod}<br/>
        <strong>Discount Applied:</strong> ${transaction.transactionDiscount ? "Yes" : "No"}<br/>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${transaction.transactCart.map(item => `
            <tr>
              <td>${item.transactionCartItemName}</td>
              <td>${item.transactionCartItemCount}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="right">
        <h3 class="total">Total: PHP ${transaction.transactionTotal.toFixed(2)}</h3 >
      </div >
    </body >
    </html >
    `

    // Open popup *before* doing any logic to avoid being blocked
    const invoiceWindow = window.open("", "_blank")
    if (!invoiceWindow) {
      toaster.create({
        title: "Popup blocked",
        description: "Please allow popups to generate invoice.",
        type: "warning",
        duration: 5000,
        closable: true,
      })
      return
    }

    invoiceWindow.document.write(invoiceHTML)
    invoiceWindow.document.close()

    // Delay print until window finishes loading
    invoiceWindow.onload = () => {
      invoiceWindow.print()
    }
  }

  return (
    <>
      <PageHeader title="Transaction History" />
      <Toaster />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog.Root open={isDialogOpen} onOpenChange={({ open }) => setIsDialogOpen(open)}>
        <Dialog.Backdrop className={styles.modalOverlay} />
        <Dialog.Positioner>
          <Dialog.Content className={styles.modalCard}>
            <Dialog.Header>
              <Dialog.Title className={styles.modalTitle}>Confirm Delete</Dialog.Title>
              <Dialog.CloseTrigger onClick={cancelDelete} />
            </Dialog.Header>
            <Dialog.Body className={styles.modalContent}>
              <Text className={styles.modalDescription}>
                Are you sure you want to delete this transaction?
              </Text>
              {deleteConfirm && (
                <Box className={styles.modalPreview}>
                  <VStack className={styles.modalPreviewContent}>
                    <Text className={styles.modalPreviewTitle}>
                      Transaction #{deleteConfirm._id.slice(-8)}
                    </Text>
                    <Text className={styles.modalPreviewEmployee}>
                      Employee: {deleteConfirm.transactionEmployee}
                    </Text>
                    <Text className={styles.modalPreviewTotal}>
                      Total: ₱{parseFloat(String(deleteConfirm.transactionTotal)).toLocaleString()}
                    </Text>
                  </VStack>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer className={styles.modalButtons}>
              <Button
                className={`${styles.modalButton} ${styles.modalDeleteButton} `}
                onClick={confirmDelete}
              >
                Delete
              </Button>
              <Button
                className={`${styles.modalButton} ${styles.modalCancelButton} `}
                onClick={cancelDelete}
                variant="outline"
              >
                Cancel
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Box className={styles.container}>
        {transactions.length === 0 ? (
          <Box className={styles.emptyState}>
            <VStack className={styles.emptyStateContent}>
              <Text className={styles.emptyStateTitle}>
                No transactions found
              </Text>
              <Text className={styles.emptyStateDescription}>
                Transaction history will appear here once you make your first sale
              </Text>
            </VStack>
          </Box>
        ) : (
          <Box className={styles.transactionGrid}>
            {transactions.map((transaction) => (
              <Box
                key={transaction._id}
                className={styles.transactionCard}
              >
                {/* Header */}
                <Box className={styles.cardHeader}>
                  <VStack className={styles.cardHeaderContent} align="stretch">
                    <HStack className={styles.cardHeaderTop} justify="space-between" align="flex-start">
                      <VStack className={styles.cardHeaderLeft} align="flex-start">
                        <Text className={styles.transactionIdLabel}>
                          Transaction ID
                        </Text>
                        <Text className={styles.transactionId}>
                          #{transaction._id.slice(-8)}
                        </Text>
                      </VStack>
                      <IconButton
                        className={styles.deleteButton}
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        as={IoClose}
                        onClick={() => handleDelete(transaction)}
                        aria-label="Delete transaction"
                      />
                    </HStack>

                    <HStack className={styles.badgeContainer} justify="space-between">
                      <Badge
                        colorPalette={getPaymentMethodColor(transaction.transactionPaymentMethod)}
                        textTransform="capitalize"
                      >
                        {transaction.transactionPaymentMethod}
                      </Badge>
                      {transaction.transactionDiscount && (
                        <Badge colorPalette="orange" variant="subtle">
                          Discount Applied
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </Box>

                {/* Body */}
                <Box className={styles.cardBody}>
                  <VStack className={styles.cardBodyContent} align="stretch">
                    {/* Employee & Date Info */}
                    <VStack className={styles.infoSection} align="stretch">
                      <HStack className={styles.infoRow}>
                        <Text className={styles.infoLabel}>
                          Employee:
                        </Text>
                        <Text className={styles.infoValue}>
                          {transaction.transactionEmployee}
                        </Text>
                      </HStack>
                      <HStack className={styles.infoRow}>
                        <Text className={styles.infoLabel}>
                          Date:
                        </Text>
                        <Text className={styles.infoValueDate}>
                          {formatDateTime(transaction.transactionDate)}
                        </Text>
                      </HStack>
                    </VStack>

                    <hr className={styles.separator} />

                    {/* Items */}
                    <Box className={styles.itemsSection}>
                      <Text className={styles.itemsHeader}>
                        Items ({transaction.transactCart.length})
                      </Text>
                      <VStack className={styles.itemsList} align="stretch">
                        {transaction.transactCart.map((item, itemIndex) => (
                          <HStack key={itemIndex} className={styles.itemRow} justify="space-between">
                            <Text className={styles.itemName}>
                              {item.transactionCartItemName}
                            </Text>
                            <span className={styles.itemCount}>
                              {item.transactionCartItemCount}
                            </span>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    <hr className={styles.separator} />

                    {/* Total */}
                    <HStack className={styles.totalSection} justify="space-between" align="center">
                      <Text className={styles.totalLabel}>
                        Total
                      </Text>
                      <Text className={styles.totalAmount}>
                        ₱{parseFloat(String(transaction.transactionTotal)).toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Footer */}
                <Box className={styles.cardFooter}>
                  <Button
                    className={styles.printButton}
                    colorPalette="blue"
                    size="sm"
                    onClick={() => generateInvoice(transaction)}
                    width="100%"
                  >
                    Print
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </>
  )
}

export default TransactHistory
