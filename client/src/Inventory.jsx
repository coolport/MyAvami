import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FiSearch, FiEdit2, FiTrash2, FiX } from "react-icons/fi"
import PageHeader from "./components/PageHeader"
import {
  Box,
  Flex,
  Heading,
  Input,
  Table,
  Text,
  Image,
  Button,
  Spinner,
  Badge,
} from "@chakra-ui/react"

function Inventory() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const editForm = useForm()

  useEffect(() => {
    getItems()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInventory(inventory)
    } else {
      const filtered = inventory.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCategory.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredInventory(filtered)
    }
  }, [inventory, searchTerm])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function getItems() {
    setLoading(true)
    const url = "http://localhost:5555/products"
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json = await response.json()
      const data = json.data
      const updatedArray = []

      for (const x in data) {
        updatedArray.push(data[x])
      }
      setInventory(updatedArray)
    } catch (e) {
      console.error(e)
      showToast("Failed to fetch inventory items", "error")
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(item) {
    setEditingItem(item)
    editForm.reset({
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      itemPrice: item.itemPrice,
      itemExpiration: item.itemExpiration ? item.itemExpiration.split('T')[0] : '',
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

      if (response.ok) {
        setEditingItem(null)
        getItems()
        showToast("Inventory item updated successfully")
      } else {
        throw new Error("Failed to update item")
      }
    } catch (error) {
      console.error("Edit error:", error.message)
      showToast("Failed to update inventory item", "error")
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

      if (response.ok) {
        setDeleteConfirm(null)
        getItems()
        showToast("Inventory item deleted successfully")
      } else {
        throw new Error("Failed to delete item")
      }
    } catch (error) {
      console.error("Delete error:", error.message)
      showToast("Failed to delete inventory item", "error")
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price)
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-PH')
  }

  function getStockStatus(count) {
    if (count === 0) return { label: 'Out of Stock', colorScheme: 'red' }
    if (count <= 10) return { label: 'Low Stock', colorScheme: 'orange' }
    return { label: 'In Stock', colorScheme: 'green' }
  }

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  }

  const modalContentStyle = {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid #e2e8f0',
    maxHeight: '90vh',
    overflowY: 'auto'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#2d3748',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
    outline: 'none'
  }

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none'
  }

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3182ce',
    color: '#ffffff'
  }

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ffffff',
    color: '#4a5568',
    border: '2px solid #e2e8f0'
  }

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e53e3e',
    color: '#ffffff'
  }

  return (
    <>
      <PageHeader title="Inventory" />

      {/* Toast Notification */}
      {toast && (
        <Box
          position="fixed"
          top={4}
          right={4}
          bg={toast.type === 'error' ? 'red.500' : 'green.500'}
          color="white"
          px={6}
          py={3}
          borderRadius="md"
          boxShadow="lg"
          zIndex={2000}
        >
          {toast.message}
        </Box>
      )}

      <Box px={8} py={6} bg="gray.50" minH="100vh">
        {/* Search and Stats Bar */}
        <Flex
          mb={6}
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={4}
          bg="white"
          p={6}
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Flex align="center" flex="1" maxW="400px">
            <FiSearch
              style={{
                marginRight: "12px",
                color: "#718096",
                fontSize: "18px"
              }}
            />
            <Input
              placeholder="Search by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.50"
              border="2px solid"
              borderColor="gray.200"
              color="gray.800"
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px #3182ce"
              }}
            />
          </Flex>

          <Box
            bg="blue.50"
            px={4}
            py={2}
            borderRadius="lg"
            border="1px solid"
            borderColor="blue.200"
          >
            <Text fontWeight="bold" color="blue.800">
              Total Items: {filteredInventory.length}
            </Text>
          </Box>
        </Flex>

        {/* Main Table */}
        <Box
          overflowX="auto"
          borderRadius="xl"
          bg="white"
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <Table.Root variant="simple">
            <Table.Header bg="gray.100">
              <Table.Row>
                <Table.ColumnHeader
                  color="gray.700"
                  fontWeight="bold"
                  fontSize="sm"
                  py={4}
                >
                  Product
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="gray.700"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Category
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="gray.700"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Price
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="gray.700"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Stock
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="gray.700"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Expiration
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="gray.700"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py={8}>
                    <Flex justify="center" align="center" color="gray.600">
                      <Spinner size="sm" mr={3} />
                      <Text>Loading inventory...</Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ) : filteredInventory.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py={8}>
                    <Text color="gray.500" fontSize="lg">
                      {searchTerm
                        ? "No items match your search"
                        : "No inventory items found"}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredInventory.map((item, index) => {
                  const stockStatus = getStockStatus(item.itemCount);
                  return (
                    <Table.Row
                      key={item._id || index}
                      _hover={{ bg: "gray.50" }}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <Table.Cell py={4}>
                        <Flex align="center">
                          <Image
                            src={item.itemImage}
                            alt={item.itemName}
                            boxSize="60px"
                            borderRadius="lg"
                            mr={4}
                            fallbackSrc="https://via.placeholder.com/60"
                            border="2px solid"
                            borderColor="gray.200"
                          />
                          <Box>
                            <Text
                              fontWeight="semibold"
                              color="gray.800"
                              fontSize="md"
                            >
                              {item.itemName}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.500"
                              mt={1}
                            >
                              {item.itemDescription}
                            </Text>
                          </Box>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorScheme="purple"
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontWeight="medium"
                        >
                          {item.itemCategory}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          fontWeight="bold"
                          color="gray.800"
                          fontSize="md"
                        >
                          {formatPrice(item.itemPrice)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Box>
                          <Text
                            fontWeight="bold"
                            color="gray.800"
                            fontSize="lg"
                          >
                            {item.itemCount}
                          </Text>
                          <Badge
                            colorScheme={stockStatus.colorScheme}
                            variant="subtle"
                            mt={1}
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                          >
                            {stockStatus.label}
                          </Badge>
                        </Box>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="gray.700">
                          {formatDate(item.itemExpiration)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEdit(item)}
                            leftIcon={<FiEdit2 />}
                            variant="solid"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(item)}
                            leftIcon={<FiTrash2 />}
                            variant="solid"
                          >
                            Delete
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table.Root>
        </Box>

        {/* Edit Modal */}
        {editingItem && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, width: '500px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2d3748'
                }}>
                  Edit Product
                </h2>
                <button
                  onClick={() => setEditingItem(null)}
                  style={{
                    border: 'none',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#4a5568',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '14px'
                  }}>
                    Product Name *
                  </label>
                  <input
                    {...editForm.register("itemName", { required: true })}
                    placeholder="Enter product name"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '14px'
                  }}>
                    Description *
                  </label>
                  <input
                    {...editForm.register("itemDescription", { required: true })}
                    placeholder="Enter description"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#2d3748',
                      fontSize: '14px'
                    }}>
                      Price (PHP) *
                    </label>
                    <input
                      {...editForm.register("itemPrice", { required: true })}
                      type="number"
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#2d3748',
                      fontSize: '14px'
                    }}>
                      Stock Count *
                    </label>
                    <input
                      {...editForm.register("itemCount", { required: true })}
                      type="number"
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '14px'
                  }}>
                    Category *
                  </label>
                  <input
                    {...editForm.register("itemCategory", { required: true })}
                    placeholder="Enter category"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '14px'
                  }}>
                    Expiration Date
                  </label>
                  <input
                    {...editForm.register("itemExpiration")}
                    type="date"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '14px'
                  }}>
                    Image URL *
                  </label>
                  <input
                    {...editForm.register("itemImage", { required: true })}
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    style={inputStyle}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={primaryButtonStyle}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, width: '450px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#2d3748'
                }}>
                  Delete Product
                </h3>
                <p style={{
                  margin: '0 0 12px 0',
                  color: '#4a5568',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  Are you sure you want to delete{' '}
                  <strong style={{ color: '#2d3748' }}>
                    {deleteConfirm.itemName}
                  </strong>?
                </p>
                <p style={{
                  color: '#e53e3e',
                  margin: '12px 0 0 0',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  This action cannot be undone.
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={dangerButtonStyle}
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </Box>
    </>
  )
}

export default Inventory
