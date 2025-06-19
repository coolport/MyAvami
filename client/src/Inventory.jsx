import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FiSearch, FiEdit2, FiTrash2, FiX, FiArrowUp, FiArrowDown } from "react-icons/fi"
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const editForm = useForm()

  useEffect(() => {
    getItems()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInventory(inventory)
    } else {
      // Linear Search Implementation
      const filtered = linearSearch(inventory, searchTerm)
      setFilteredInventory(filtered)
    }
  }, [inventory, searchTerm])

  // Linear Search Algorithm
  function linearSearch(array, searchTerm) {
    const results = []
    const lowerSearchTerm = searchTerm.toLowerCase()

    // Go through each item one by one (linear search)
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      const nameMatch = item.itemName.toLowerCase().includes(lowerSearchTerm)
      const descMatch = item.itemDescription.toLowerCase().includes(lowerSearchTerm)
      const categoryMatch = item.itemCategory.toLowerCase().includes(lowerSearchTerm)

      // If any field matches, add to results
      if (nameMatch || descMatch || categoryMatch) {
        results.push(item)
      }
    }

    return results
  }

  // Merge Sort Algorithm 
  function mergeSort(array, sortKey) {
    // Base case: arrays with 0 or 1 element are already sorted
    if (array.length <= 1) {
      return array
    }

    // Divide the array into two halves
    const middle = Math.floor(array.length / 2)
    const left = array.slice(0, middle)
    const right = array.slice(middle)

    // Recursively sort both halves
    const sortedLeft = mergeSort(left, sortKey)
    const sortedRight = mergeSort(right, sortKey)

    // Merge the sorted halves
    return merge(sortedLeft, sortedRight, sortKey)
  }

  // Merge function for merge sort
  function merge(left, right, sortKey) {
    const result = []
    let leftIndex = 0
    let rightIndex = 0

    // Compare elements and merge in sorted order
    while (leftIndex < left.length && rightIndex < right.length) {
      const leftValue = getValueForSort(left[leftIndex], sortKey)
      const rightValue = getValueForSort(right[rightIndex], sortKey)

      if (sortConfig.direction === 'asc' ? leftValue <= rightValue : leftValue >= rightValue) {
        result.push(left[leftIndex])
        leftIndex++
      } else {
        result.push(right[rightIndex])
        rightIndex++
      }
    }

    // Add remaining elements
    while (leftIndex < left.length) {
      result.push(left[leftIndex])
      leftIndex++
    }

    while (rightIndex < right.length) {
      result.push(right[rightIndex])
      rightIndex++
    }

    return result
  }

  // Helper function to get sortable value
  function getValueForSort(item, key) {
    switch (key) {
      case 'itemName':
        return item.itemName.toLowerCase()
      case 'itemPrice':
        return parseFloat(item.itemPrice) || 0
      case 'itemCount':
        return parseInt(item.itemCount) || 0
      case 'itemCategory':
        return item.itemCategory.toLowerCase()
      case 'itemExpiration':
        return item.itemExpiration ? new Date(item.itemExpiration).getTime() : 0
      default:
        return item[key] || ''
    }
  }

  // Sort function using merge sort
  function handleSort(key) {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    setSortConfig({ key, direction })

    // Apply merge sort to filtered inventory
    const sorted = mergeSort([...filteredInventory], key)
    setFilteredInventory(sorted)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function getItems() {
    setLoading(true)
    const url = "http://localhost:5555/products"
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      })
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

  // Helper function to render sort icon
  function renderSortIcon(columnKey) {
    if (sortConfig.key !== columnKey) {
      return <span className={styles.sortIcon}>⇅</span>
    }
    return sortConfig.direction === 'asc' ?
      <FiArrowUp className={styles.sortIcon} /> :
      <FiArrowDown className={styles.sortIcon} />
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
              placeholder="Search by name, description, or category... "
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
                <th
                  className={`${styles.tableHeaderCell} ${styles.sortable}`}
                  onClick={() => handleSort('itemName')}
                >
                  Product {renderSortIcon('itemName')}
                </th>
                <th
                  className={`${styles.tableHeaderCell} ${styles.sortable}`}
                  onClick={() => handleSort('itemCategory')}
                >
                  Category {renderSortIcon('itemCategory')}
                </th>
                <th
                  className={`${styles.tableHeaderCell} ${styles.sortable}`}
                  onClick={() => handleSort('itemPrice')}
                >
                  Price {renderSortIcon('itemPrice')}
                </th>
                <th
                  className={`${styles.tableHeaderCell} ${styles.sortable}`}
                  onClick={() => handleSort('itemCount')}
                >
                  Stock {renderSortIcon('itemCount')}
                </th>
                <th
                  className={`${styles.tableHeaderCell} ${styles.sortable}`}
                  onClick={() => handleSort('itemExpiration')}
                >
                  Expiration {renderSortIcon('itemExpiration')}
                </th>
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
