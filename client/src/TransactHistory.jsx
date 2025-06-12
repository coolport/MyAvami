import { useEffect, useState } from "react"
import { Stack, Card, Button, Box } from "@chakra-ui/react"
import PageHeader from "./components/PageHeader"

function TransactHistory() {
  const [transactions, setTransactions] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    getTransactions()
    console.log("Called getTransactions() - useEffect")
  }, [])

  async function getTransactions() {
    const url = "http://localhost:5555/transactions"
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json = await response.json()
      console.log("Transactions data:", json.data)
      setTransactions(json.data)
    } catch (e) {
      console.error("Error fetching transactions:", e)
    }
  }

  function handleDelete(transaction) {
    // Put selected item in the deleteConfirm state, will render
    // the popup, n be target in confirmDelete
    setDeleteConfirm(transaction)
  }

  async function confirmDelete() {
    const url = `http://localhost:5555/transactions/${deleteConfirm._id}`
    console.log("deleteConfirm: ", deleteConfirm)
    try {
      const response = await fetch(url, {
        method: "DELETE",
      })
      console.log("Delete response:", response)
      if (response.ok) {
        // IF GOODS
        // 1. reset deleteConfirm state, unmountingit, and remove item focus
        setDeleteConfirm(null)
        // 2. REFRESH LIST!
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
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <PageHeader title={"Transaction History"} />
      <h1>Transaction History</h1>

      {/* Delete PopUp */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '300px',
            textAlign: 'center'
          }}>
            <h3>Confirm Delete</h3>
            <p>Delete Transaction?</p>
            <p>Employee: {deleteConfirm.transactionEmployee}</p>
            <p>Total: PHP {deleteConfirm.transactionTotal}</p>
            <Button onClick={confirmDelete}>Delete</Button>
            <Button onClick={cancelDelete}>Cancel</Button>
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        transactions.map((transaction, index) => (
          <Box width="50%" bgColor={"yellow"} key={index}>
            <Card.Root borderRadius={"0"}>
              <Stack>
                <Card.Header>Transaction #{transaction._id}</Card.Header>
                <Card.Body>
                  Employee: {transaction.transactionEmployee}
                  <br />
                  Date: {formatDate(transaction.transactionDate)}
                  <br />
                  Payment: {transaction.transactionPaymentMethod}
                  <br />
                  Discount: {transaction.transactionDiscount ? 'Yes' : 'No'}
                  <br />
                  Total: PHP {transaction.transactionTotal}
                  <br />
                  Items:
                  {transaction.transactCart.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      - {item.transactionCartItemName} (Qty: {item.transactionCartItemCount})
                    </div>
                  ))}
                </Card.Body>
                <Card.Footer>
                  <Button onClick={() => handleDelete(transaction)}>Delete</Button>
                </Card.Footer>
              </Stack>
            </Card.Root>
          </Box>
        ))
      )}
    </>
  )
}

export default TransactHistory
