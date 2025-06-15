import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FiSearch, FiEdit2, FiTrash2, FiX } from "react-icons/fi"
import PageHeader from "./components/PageHeader"
import styles from "./styles/Inventory.module.css"

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

  return (
    <>
      <PageHeader title="Inventory" />

      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.container}>
        {/* Search and Stats Bar */}
        <div className={styles.searchStatsBar}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.totalItemsBox}>
            <p className={styles.totalItemsText}>
              Total Items: {filteredInventory.length}
            </p>
          </div>
        </div>

        {/* Main Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeaderCell}>Product</th>
                <th className={styles.tableHeaderCell}>Category</th>
                <th className={styles.tableHeaderCell}>Price</th>
                <th className={styles.tableHeaderCell}>Stock</th>
                <th className={styles.tableHeaderCell}>Expiration</th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingCell}>
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      <span>Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    <p className={styles.emptyText}>
                      {searchTerm
                        ? "No items match your search"
                        : "No inventory items found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, index) => {
                  const stockStatus = getStockStatus(item.itemCount);
                  return (
                    <tr
                      key={item._id || index}
                      className={styles.tableRow}
                    >
                      <td className={styles.tableCell}>
                        <div className={styles.productCell}>
                          <img
                            src={item.itemImage || "https://via.placeholder.com/60"}
                            alt={item.itemName}
                            className={styles.productImage}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/60"
                            }}
                          />
                          <div className={styles.productInfo}>
                            <h3 className={styles.productName}>
                              {item.itemName}
                            </h3>
                            <p className={styles.productDescription}>
                              {item.itemDescription}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.badge} ${styles.purple}`}>
                          {item.itemCategory}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <p className={styles.price}>
                          {formatPrice(item.itemPrice)}
                        </p>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.stockContainer}>
                          <p className={styles.stockCount}>
                            {item.itemCount}
                          </p>
                          <span className={`${styles.badge} ${styles.stockBadge} ${styles[stockStatus.colorScheme]}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <p className={styles.dateText}>
                          {formatDate(item.itemExpiration)}
                        </p>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.button} ${styles.edit}`}
                            onClick={() => handleEdit(item)}
                          >
                            <FiEdit2 />
                            Edit
                          </button>
                          <button
                            className={`${styles.button} ${styles.delete}`}
                            onClick={() => handleDelete(item)}
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.edit}`}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  Edit Product
                </h2>
                <button
                  onClick={() => setEditingItem(null)}
                  className={styles.closeButton}
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className={styles.form}
              >
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Product Name *
                  </label>
                  <input
                    {...editForm.register("itemName", { required: true })}
                    placeholder="Enter product name"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Description *
                  </label>
                  <input
                    {...editForm.register("itemDescription", { required: true })}
                    placeholder="Enter description"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroupRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Price (PHP) *
                    </label>
                    <input
                      {...editForm.register("itemPrice", { required: true })}
                      type="number"
                      placeholder="0.00"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Stock Count *
                    </label>
                    <input
                      {...editForm.register("itemCount", { required: true })}
                      type="number"
                      placeholder="0"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Category *
                  </label>
                  <input
                    {...editForm.register("itemCategory", { required: true })}
                    placeholder="Enter category"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Expiration Date
                  </label>
                  <input
                    {...editForm.register("itemExpiration")}
                    type="date"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Image URL *
                  </label>
                  <input
                    {...editForm.register("itemImage", { required: true })}
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className={styles.input}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className={`${styles.modalButton} ${styles.secondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.modalButton} ${styles.primary}`}
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
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.delete}`}>
              <div className={styles.deleteContent}>
                <h3 className={`${styles.modalTitle} ${styles.delete}`}>
                  Delete Product
                </h3>
                <p className={styles.deleteText}>
                  Are you sure you want to delete{' '}
                  <span className={styles.deleteProductName}>
                    {deleteConfirm.itemName}
                  </span>?
                </p>
                <p className={styles.deleteWarning}>
                  This action cannot be undone.
                </p>
              </div>

              <div className={`${styles.modalActions} ${styles.delete}`}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className={`${styles.modalButton} ${styles.secondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`${styles.modalButton} ${styles.danger}`}
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Inventory
