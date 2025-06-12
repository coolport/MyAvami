import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { HStack, Card, Button, Box, Stack, Image, Float, Table } from "@chakra-ui/react"
// import Navbar from "./components/Navbar"
import PageHeader from "./components/PageHeader"


function Inventory() {
  const [inventory, setInventory] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const editForm = useForm()

  // useEffect(() => {
  //   getItems()
  //   // setItems([...data[0]]) 
  //   console.log("Called getPosts() - useEffect")
  //   //bmindful lang abt other logs, since state updates are async, as well as in this case, the func ur calling
  // }, []) //dependency array: nothing, just run at start (when component is first mounted)

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
      //json object, has data,string,success (as defined in endpoint definition)
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

  function handleEdit(item) {
    setEditingItem(item)
    // Pre-fill the form with current values
    editForm.reset({
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      itemPrice: item.itemPrice,
      itemExpiration: item.itemExpiration ? item.itemExpiration.split('T')[0] : '', // Format date for input
      itemCount: item.itemCount,
      itemImage: item.itemImage,
      itemCategory: item.itemCategory
    })
  }

  async function onEditSubmit(data) {
    const url = `http://localhost:5555/products/${editingItem._id}`
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      console.log("Edit response:", response)
      if (response.ok) {
        setEditingItem(null)
        getItems() // refresh items
      }
    } catch (error) {
      console.error("Edit error:", error.message)
    }
  }

  function handleDelete(item) {
    setDeleteConfirm(item)
  }

  async function confirmDelete() {
    const url = `http://localhost:5555/products/${deleteConfirm._id}`
    try {
      const response = await fetch(url, {
        method: "DELETE",
      })
      console.log("Delete response:", response)
      if (response.ok) {
        setDeleteConfirm(null)
        getItems() // refresh items
      }
    } catch (error) {
      console.error("Delete error:", error.message)
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null)
  }

  function cancelEdit() {
    setEditingItem(null)
    editForm.reset()
  }

  return (
    <>
      <PageHeader title={"Inventory"} />
      <h1>Displaying Inventory Items:</h1>

      {/* popup */}
      {editingItem && (
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
            backgroundColor: 'gray',
            padding: '20px',
            borderRadius: '5px',
            width: '400px'
          }}>
            <h3>Edit Item</h3>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              itemName: <input {...editForm.register("itemName")} />
              <br />
              itemDescription: <input {...editForm.register("itemDescription")} />
              <br />
              itemPrice: <input type="number" {...editForm.register("itemPrice")} />
              <br />
              itemExpiration: <input type="date" {...editForm.register("itemExpiration", { valueAsDate: true })} />
              <br />
              itemCount: <input type="number" {...editForm.register("itemCount", { min: 0, max: 99 })} />
              <br />
              itemImage: <input {...editForm.register("itemImage")} />
              <br />
              itemCategory: <input {...editForm.register("itemCategory")} />
              <br />
              <Button type="submit">Save Changes</Button>
              <Button type="button" onClick={cancelEdit}>Cancel</Button>
            </form>
          </div>
        </div>
      )}

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
            backgroundColor: 'gray',
            padding: '20px',
            borderRadius: '5px',
            width: '300px',
            textAlign: 'center'
          }}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{deleteConfirm.itemName}"?</p>
            <Button onClick={confirmDelete}>Yes, Delete</Button>
            <Button onClick={cancelDelete}>Cancel</Button>
          </div>
        </div>
      )}

      <HStack scale="auto">
      </HStack>
      {inventory.map((item, index) => (
        <Box width="50%" bgColor={"yellow"} key={index}>
          {/* color of container lol not visible bc of border radius 0 */}
          <Card.Root borderRadius={"0"}>
            <Stack>
              <Card.Header>{item.itemName}</Card.Header>
              <Card.Header>PHP {item.itemPrice}</Card.Header>
              <Card.Body>{item.itemDescription}
                <Image rounded="md" src={item.itemImage} alt={item.itemName} />
              </Card.Body>
              <Card.Footer>
                <Button onClick={() => handleEdit(item)}>Edit</Button>
                <Button onClick={() => handleDelete(item)}>Delete</Button>
              </Card.Footer>
            </Stack>
          </Card.Root>
        </Box>
      ))}
    </>
  )
}

export default Inventory
