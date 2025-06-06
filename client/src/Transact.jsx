import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Stack, HStack, Card, Button, Box, Image } from "@chakra-ui/react"

function Transact() {
  const [inventory, setInventory] = useState([])
  const [transactingItem, setTransactingItem] = useState(null)
  const transactForm = useForm()

  useEffect(() => {
    getItems()
    console.log("Called getItems() - useEffect")
  }, [])

  async function getItems() {
    const url = "http://localhost:5555/products"
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const updatedArray = []
      const json = await response.json()
      const data = json.data
      for (const x in data) {
        console.log(`data[${x}]`, data[x])
        updatedArray.push(data[x])
      }
      setInventory(updatedArray)
    } catch (e) {
      console.error(e)
    }
  }

  function handleTransact(item) {
    setTransactingItem(item)
    transactForm.reset({
      transactionEmployee: '',
      transactionCartItemCount: 1,
      transactionDiscount: false,
      transactionPaymentMethod: 'cash'
    })
  }

  async function onTransactSubmit(data) {
    const transactionData = {
      transactionEmployee: data.transactionEmployee,
      transactCart: [{
        transactionCartItemName: transactingItem.itemName,
        transactionCartItemID: transactingItem._id,
        transactionCartItemCount: parseInt(data.transactionCartItemCount)
      }],
      transactionTotal: transactingItem.itemPrice * parseInt(data.transactionCartItemCount),
      transactionDiscount: data.transactionDiscount,
      transactionPaymentMethod: data.transactionPaymentMethod
    }

    const url = "http://localhost:5555/transactions"
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })
      console.log("Transaction response:", response)
      if (response.ok) {
        setTransactingItem(null)
        transactForm.reset()
        alert("Transaction added successfully")
      }
    } catch (error) {
      console.error("Transaction error:", error.message)
    }
  }

  function cancelTransact() {
    setTransactingItem(null)
    transactForm.reset()
  }

  return (
    <>
      <h1>Test Transact</h1>

      {transactingItem && (
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
            width: '400px'
          }}>
            <h3>Add Transaction- {transactingItem.itemName}</h3>
            <p>Price: PHP {transactingItem.itemPrice}</p>
            <form onSubmit={transactForm.handleSubmit(onTransactSubmit)}>
              Employee Name: <input {...transactForm.register("transactionEmployee", { required: true })} />
              <br />
              Quantity: <input type="number" min="1" {...transactForm.register("transactionCartItemCount", { required: true, min: 1 })} />
              <br />
              Payment Method:
              <select {...transactForm.register("transactionPaymentMethod", { required: true })}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
              </select>
              <br />
              Discount: <input type="checkbox" {...transactForm.register("transactionDiscount")} />
              <br />
              <br />
              <Button type="submit">Add Transaction</Button>
              <Button type="button" onClick={cancelTransact}>Cancel</Button>
            </form>
          </div>
        </div>
      )}

      <HStack scale="auto">
      </HStack>
      {inventory.map((item, index) => (
        <Box width="50%" bgColor={"yellow"} key={index}>
          <Card.Root borderRadius={"0"}>
            <Stack>
              <Card.Header>{item.itemName}</Card.Header>
              <Card.Header>PHP {item.itemPrice}</Card.Header>
              <Card.Body>{item.itemDescription}
                <Image rounded="md" src={item.itemImage} alt={item.itemName} />
              </Card.Body>
              <Card.Footer>
                <Button onClick={() => handleTransact(item)}>Add to Transactions</Button>
              </Card.Footer>
            </Stack>
          </Card.Root>
        </Box>
      ))}
    </>
  )
}

export default Transact
