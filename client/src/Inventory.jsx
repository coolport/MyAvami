import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FiSearch, FiEdit2, FiTrash2, FiX, FiArrowUp, FiArrowDown, FiRefreshCw } from "react-icons/fi"
import PageHeader from "./components/PageHeader"
import { printReorderForm } from "./services/reorderTemplate"
import styles from "./styles/Inventory.module.css"

function Inventory() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const editForm = useForm()

  useEffect(() => {
    fetchSuppliers().then(() => {
      getItems()
    })
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInventory(inventory)
    } else {
      const filtered = linearSearch(inventory, searchTerm)
      setFilteredInventory(filtered)
    }
  }, [inventory, searchTerm])

  // Linear Search Algorithm
  function linearSearch(array, searchTerm) {
    const results = []
    const lowerSearchTerm = searchTerm.toLowerCase()

    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      const nameMatch = item.itemName.toLowerCase().includes(lowerSearchTerm)
      const brandMatch = item.itemBrandName ? item.itemBrandName.toLowerCase().includes(lowerSearchTerm) : false
      const descMatch = item.itemDescription.toLowerCase().includes(lowerSearchTerm)
      const categoryMatch = item.itemCategory.toLowerCase().includes(lowerSearchTerm)
      const supplierMatch = item.supplierName ? item.supplierName.toLowerCase().includes(lowerSearchTerm) : false

      if (nameMatch || brandMatch || descMatch || categoryMatch || supplierMatch) {
        results.push(item)
      }
    }

    return results
  }

  // Merge Sort Algorithm 
  function mergeSort(array, sortKey) {
    if (array.length <= 1) {
      return array
    }

    const middle = Math.floor(array.length / 2)
    const left = array.slice(0, middle)
    const right = array.slice(middle)

    const sortedLeft = mergeSort(left, sortKey)
    const sortedRight = mergeSort(right, sortKey)

    return merge(sortedLeft, sortedRight, sortKey)
  }

  function merge(left, right, sortKey) {
    const result = []
    let leftIndex = 0
    let rightIndex = 0

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

  function getValueForSort(item, key) {
    switch (key) {
      case 'itemName':
        return item.itemName.toLowerCase()
      case 'itemBrandName':
        return (item.itemBrandName || '').toLowerCase()
      case 'itemPrice':
        return parseFloat(item.itemPrice) || 0
      case 'itemCount':
        return parseInt(item.itemCount) || 0
      case 'itemCategory':
        return item.itemCategory.toLowerCase()
      case 'itemExpiration':
        return item.itemExpiration ? new Date(item.itemExpiration).getTime() : 0
      case 'supplierName':
        return (item.supplierName || '').toLowerCase()
      default:
        return item[key] || ''
    }
  }

  function handleSort(key) {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    setSortConfig({ key, direction })

    const sorted = mergeSort([...filteredInventory], key)
    setFilteredInventory(sorted)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
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
        const item = data[x]

        // Handle both populated and non-populated supplier data
        let supplierName = 'Unknown Supplier'
        let actualSupplierId = item.supplierId

        if (typeof item.supplierId === 'object' && item.supplierId !== null) {
          // Supplier is populated (object)
          supplierName = item.supplierId.supplierName || 'Unknown Supplier'
          actualSupplierId = item.supplierId._id
        } else if (typeof item.supplierId === 'string') {
          // Supplier is not populated (just ID)
          const supplier = suppliers.find(s => s._id === item.supplierId)
          supplierName = supplier ? supplier.supplierName : 'Unknown Supplier'
          actualSupplierId = item.supplierId
        }

        const itemWithSupplier = {
          ...item,
          supplierName: supplierName,
          supplierId: actualSupplierId // Keep the actual ID for editing
        }
        updatedArray.push(itemWithSupplier)
      }
      setInventory(updatedArray)
    } catch (e) {
      console.error(e)
      showToast("Failed to fetch inventory items", "error")
    } finally {
      setLoading(false)
    }
  }

  // Improved image URL handling
  function getImageUrl(imageUrl) {
    if (!imageUrl) return "https://via.placeholder.com/60?text=No+Image"

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    // If it's a relative path starting with /, prepend the server URL
    if (imageUrl.startsWith('/')) {
      return `http://localhost:5555${imageUrl}`
    }

    // If it doesn't start with /, add the leading slash
    return `http://localhost:5555/${imageUrl}`
  }

  function handleEdit(item) {
    setEditingItem(item)
    editForm.reset({
      itemName: item.itemName,
      itemBrandName: item.itemBrandName || '',
      itemDescription: item.itemDescription,
      itemPrice: item.itemPrice,
      itemExpiration: item.itemExpiration ? item.itemExpiration.split('T')[0] : '',
      itemCount: item.itemCount,
      itemImage: item.itemImage,
      itemCategory: item.itemCategory,
      supplierId: item.supplierId
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
        credentials: "include",
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
        credentials: "include",
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

  // NEW: Handle reorder functionality
  function handleReorder(item) {
    // Find the supplier data for this item
    const supplier = suppliers.find(s => s._id === item.supplierId)

    if (!supplier) {
      showToast("Supplier information not found. Cannot generate reorder form.", "error")
      return
    }

    // Call the printReorderForm function from the template
    printReorderForm(item, supplier, showToast)
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

  // NEW: Check if item needs reordering (out of stock or low stock)
  function needsReorder(count) {
    return count <= 10 // Out of stock (0) or low stock (<=10)
  }

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
              placeholder="Search by name, brand, description, category, or supplier..."
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
                  onClick={() => handleSort('supplierName')}
                >
                  Supplier {renderSortIcon('supplierName')}
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
                  <td colSpan={7} className={styles.loadingCell}>
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      <span>Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
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
                            src={getImageUrl(item.itemImage)}
                            alt={item.itemName}
                            className={styles.productImage}
                            onError={(e) => {
                              console.log('Image failed to load:', item.itemImage)
                              e.target.src = "https://via.placeholder.com/60?text=No+Image"
                            }}
                          />
                          <div className={styles.productInfo}>
                            <h3 className={styles.productName}>
                              {item.itemName}
                            </h3>
                            {item.itemBrandName && (
                              <p className={styles.productBrand}>
                                Brand: {item.itemBrandName}
                              </p>
                            )}
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
                        <span className={`${styles.badge} ${styles.blue}`}>
                          {item.supplierName}
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
                          {/* NEW: Reorder button - only show for items that need reordering */}
                          {needsReorder(item.itemCount) && (
                            <button
                              className={`${styles.button} ${styles.reorder}`}
                              onClick={() => handleReorder(item)}
                              title={item.itemCount === 0 ? "Item is out of stock - Generate urgent reorder form" : "Item is low in stock - Generate reorder form"}
                            >
                              <FiRefreshCw />
                              Reorder
                            </button>
                          )}
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
                    Brand Name
                  </label>
                  <input
                    {...editForm.register("itemBrandName")}
                    placeholder="Enter brand name"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Description *
                  </label>
                  <textarea
                    {...editForm.register("itemDescription", { required: true })}
                    placeholder="Enter description"
                    className={styles.input}
                    style={{ minHeight: "80px", resize: "vertical" }}
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
                      step="0.01"
                      min="0"
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
                      min="0"
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
                    Supplier *
                  </label>
                  <select
                    {...editForm.register("supplierId", { required: true })}
                    className={styles.select}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplierName} - {supplier.supplierEmail}
                      </option>
                    ))}
                  </select>
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
