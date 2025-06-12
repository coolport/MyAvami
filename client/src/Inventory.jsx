import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FiSearch, FiEdit2, FiTrash2, FiX } from "react-icons/fi"
import PageHeader from "./components/PageHeader"
import "./Inventory.css"

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
    if (count === 0) return { label: 'Out of Stock', className: 'stock-out' }
    if (count <= 10) return { label: 'Low Stock', className: 'stock-low' }
    return { label: 'In Stock', className: 'stock-in' }
  }

  return (
    <div className="inventory-container">
      <PageHeader title="Inventory" />


      <div className="inventory-card">

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              placeholder="Search by name, description, or category..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

          </div>

          <div className="header-right">
            <span className="item-count">Total Items: {filteredInventory.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Expiration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <div className="loading-spinner"></div>
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    {searchTerm ? 'No items match your search' : 'No inventory items found'}
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, index) => {
                  const stockStatus = getStockStatus(item.itemCount)
                  return (
                    <tr key={item._id || index} className="table-row">
                      <td className="product-cell">
                        <div className="product-info">
                          <img
                            src={item.itemImage}
                            alt={item.itemName}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/50"
                            }}
                          />
                          <div className="product-details">
                            <div className="product-name">{item.itemName}</div>
                            <div className="product-description">{item.itemDescription}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{item.itemCategory}</span>
                      </td>
                      <td>
                        <span className="price">{formatPrice(item.itemPrice)}</span>
                      </td>
                      <td>
                        <div className="stock-info">
                          <div className="stock-count">{item.itemCount}</div>
                          <span className={`stock-badge ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="expiration-cell">
                        {formatDate(item.itemExpiration)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(item)}
                            title="Edit item"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(item)}
                            title="Delete item"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button
                className="modal-close-btn"
                onClick={() => setEditingItem(null)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    {...editForm.register("itemName", { required: true })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    {...editForm.register("itemDescription", { required: true })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Price (PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...editForm.register("itemPrice", { required: true, min: 0 })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Count</label>
                  <input
                    type="number"
                    {...editForm.register("itemCount", { required: true, min: 0, max: 999 })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    {...editForm.register("itemCategory", { required: true })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    {...editForm.register("itemExpiration")}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Image URL</label>
                  <input
                    type="url"
                    {...editForm.register("itemImage", { required: true })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Delete Product</h2>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete "<strong>{deleteConfirm.itemName}</strong>"?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
