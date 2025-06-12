import { useEffect, useState } from "react"
import {
  Stack,
  Card,
  Button,
  Box,
  Center,
  Text,
  Heading,
  Separator,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  IconButton,
  Flex,
} from "@chakra-ui/react"
import PageHeader from "./components/PageHeader"

function TransactHistory() {
  const [transactions, setTransactions] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    getTransactions()
  }, [])

  async function getTransactions() {
    const url = "http://localhost:5555/transactions"
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json = await response.json()
      // Reverse to show latest first
      setTransactions(json.data.reverse())
    } catch (e) {
      console.error("Error fetching transactions:", e)
    }
  }

  function handleDelete(transaction) {
    setDeleteConfirm(transaction)
  }

  async function confirmDelete() {
    const url = `http://localhost:5555/transactions/${deleteConfirm._id}`
    try {
      const response = await fetch(url, { method: "DELETE" })
      if (response.ok) {
        setDeleteConfirm(null)
        getTransactions()
        alert("Transaction deleted")
      }
    } catch (error) {
      console.error("Delete error:", error.message)
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null)
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getPaymentMethodColor(method) {
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

  function generateInvoice(transaction) {
    const formattedDate = formatDate(transaction.transactionDate)

    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - Transaction #${transaction._id}</title>
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
      <h2>Avami Pharmacy - Sales Invoice</h2>
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
        <h3 class="total">Total: PHP ${transaction.transactionTotal}</h3>
      </div>
    </body>
    </html>
  `

    // Open popup *before* doing any logic to avoid being blocked
    const invoiceWindow = window.open("", "_blank")
    if (!invoiceWindow) {
      alert("Please allow popups to generate invoice.")
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

      <Box maxWidth="1200px" margin="0 auto" padding={8}>
        {transactions.length === 0 ? (
          <Card.Root textAlign="center" padding={12} borderRadius="xl">
            <VStack spacing={4}>
              <Text fontSize="xl" color="gray.500" fontWeight="medium">
                No transactions found
              </Text>
              <Text color="gray.400">
                Transaction history will appear here once you make your first sale
              </Text>
            </VStack>
          </Card.Root>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 2 }}
            spacing={8}
          >
            {transactions.map((transaction, index) => (
              <Card.Root
                key={transaction._id}
                borderRadius="xl"
                boxShadow="0"
                borderWidth="1px"
                borderColor="gray.200"
                overflow="hidden"
                bg="white"
                margin={{ base: 2, md: 3 }}
                _hover={{
                  boxShadow: 'xl',
                  transform: 'translateY(-4px)',
                  borderColor: 'blue.300',
                  transition: 'all 0.3s ease'
                }}
                height="fit-content"
              >
                {/* Header */}
                <Card.Header bg="gray.50" pb={3}>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between" align="flex-start">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="sm" color="gray.500" fontWeight="medium">
                          Transaction ID
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="gray.800" noOfLines={1}>
                          #{transaction._id.slice(-8)}
                        </Text>
                      </VStack>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(transaction)}
                        aria-label="Delete transaction"
                      >
                        ×
                      </IconButton>
                    </HStack>

                    <HStack justify="space-between">
                      <Badge
                        colorScheme={getPaymentMethodColor(transaction.transactionPaymentMethod)}
                        variant="subtle"
                        textTransform="capitalize"
                      >
                        {transaction.transactionPaymentMethod}
                      </Badge>
                      {transaction.transactionDiscount && (
                        <Badge colorScheme="orange" variant="subtle">
                          Discount Applied
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </Card.Header>

                {/* Body */}
                <Card.Body py={4}>
                  <VStack align="stretch" spacing={4}>
                    {/* Employee & Date Info */}
                    <VStack align="stretch" spacing={2}>
                      <HStack>
                        <Text fontSize="sm" color="gray.500" fontWeight="medium" minW="20">
                          Employee:
                        </Text>
                        <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                          {transaction.transactionEmployee}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm" color="gray.500" fontWeight="medium" minW="20">
                          Date:
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {formatDate(transaction.transactionDate)}
                        </Text>
                      </HStack>
                    </VStack>

                    <Separator />

                    {/* Items */}
                    <Box>
                      <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>
                        Items ({transaction.transactCart.length})
                      </Text>
                      <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
                        {transaction.transactCart.map((item, itemIndex) => (
                          <HStack key={itemIndex} justify="space-between" py={1}>
                            <Text fontSize="sm" color="gray.700" noOfLines={1} flex={1}>
                              {item.transactionCartItemName}
                            </Text>
                            <Badge size="sm" colorScheme="gray" variant="solid" color="white" bg="black">
                              {item.transactionCartItemCount}
                            </Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    <Separator />

                    {/* Total */}
                    <HStack justify="space-between" align="center">
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        Total
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.600">
                        ₱{parseFloat(transaction.transactionTotal).toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Card.Body>

                {/* Footer */}
                <Card.Footer pt={0} pb={4}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => generateInvoice(transaction)}
                    width="100%"
                    leftIcon="🖨️"
                  >
                    Print Invoice
                  </Button>
                </Card.Footer>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bg="blackAlpha.600"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={1000}
        >
          <Card.Root
            bg="white"
            padding={6}
            borderRadius="xl"
            boxShadow="2xl"
            width="400px"
            maxWidth="90vw"
          >
            <VStack spacing={4}>
              <Text fontSize="xl" fontWeight="bold" color="red.600">
                Confirm Delete
              </Text>
              <Text textAlign="center" color="gray.600">
                Are you sure you want to delete this transaction?
              </Text>
              <Box
                p={4}
                bg="gray.50"
                borderRadius="lg"
                width="100%"
              >
                <VStack spacing={1}>
                  <Text fontWeight="semibold" color="gray.800">
                    Transaction #{deleteConfirm._id.slice(-8)}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Employee: {deleteConfirm.transactionEmployee}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Total: ₱{parseFloat(deleteConfirm.transactionTotal).toLocaleString()}
                  </Text>
                </VStack>
              </Box>
              <HStack spacing={3} width="100%">
                <Button
                  colorScheme="red"
                  onClick={confirmDelete}
                  flex={1}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
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
    </>
  )
}

export default TransactHistory
