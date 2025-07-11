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
  const [transactions, setTransactions] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // New states for file upload in edit modal
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [uploadingEditImage, setUploadingEditImage] = useState(false)
  const [editUploadError, setEditUploadError] = useState(null)

  const editForm = useForm()

  useEffect(() => {
    console.log('Loading suppliers and transactions...')

    const loadBaseData = async () => {
      try {
        await fetchSuppliers()
        await fetchTransactions()
        console.log('Base data loaded successfully')
      } catch (error) {
        console.error('Error loading base data:', error)
      }
    }

    loadBaseData()
  }, [])

  useEffect(() => {
    if (suppliers.length > 0 && transactions.length > 0) {
      console.log('Base data ready, loading items...')
      getItems()
    }
  }, [suppliers, transactions])

  // Filter inventory based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = linearSearch(inventory, searchTerm)
      setFilteredInventory(filtered)
    } else {
      setFilteredInventory(inventory)
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
      case 'movement':
        return item.movement === 'Fast Moving' ? 1 : 0
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

  // Fetch transactions for movement calculation
  async function fetchTransactions() {
    try {
      const response = await fetch("http://localhost:5555/transactions", {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json = await response.json()
      if (json.data) {
        setTransactions(json.data)
      }
    } catch (e) {
      console.error("Failed to fetch transactions:", e)
    }
  }


  // Calculate item movement based on sales in past 24 hours
  function calculateItemMovement(itemName) {
    const now = new Date()
    // Fix: Actually use 24 hours (1 day), not 30 days
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    console.log(`Calculating movement for: ${itemName}`)
    console.log(`Time range: ${oneDayAgo.toISOString()} to ${now.toISOString()}`)
    console.log(`Total transactions available: ${transactions.length}`)

    let totalSales = 0

    // Filter transactions from the past 24 hours
    const recentTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate)
      const isInRange = transactionDate >= oneDayAgo && transactionDate <= now

      if (isInRange) {
        console.log(`Recent transaction found: ${transaction._id} at ${transactionDate.toISOString()}`)
      }

      return isInRange
    })

    console.log(`Recent transactions found: ${recentTransactions.length}`)

    // Count sales for this specific item
    recentTransactions.forEach(transaction => {
      if (transaction.transactCart && Array.isArray(transaction.transactCart)) {
        transaction.transactCart.forEach(cartItem => {
          if (cartItem.transactionCartItemName === itemName) {
            const itemCount = parseInt(cartItem.transactionCartItemCount) || 0
            totalSales += itemCount
            console.log(`Found sale: ${itemName} x${itemCount} in transaction ${transaction._id}`)
          }
        })
      }
    })

    console.log(`Total sales for ${itemName}: ${totalSales}`)
    const movement = totalSales >= 5 ? 'Fast Moving' : 'Slow Moving'
    console.log(`Movement status: ${movement}`)

    return movement
  }

  const refreshMovements = async () => {
    console.log('Refreshing movement calculations...')
    setLoading(true)

    try {
      // Reload transactions to get latest data
      await fetchTransactions()
      // Reload items to recalculate movements
      await getItems()
      showToast("Movement calculations refreshed", "success")
    } catch (error) {
      console.error('Error refreshing movements:', error)
      showToast("Failed to refresh movements", "error")
    } finally {
      setLoading(false)
    }
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

      console.log('Processing inventory items...')
      console.log(`Available transactions: ${transactions.length}`)
      console.log(`Available suppliers: ${suppliers.length}`)

      for (const x in data) {
        const item = data[x]

        // Handle both populated and non-populated supplier data for multiple suppliers
        let supplierNames = []
        let actualSupplierIds = []

        // Check if supplierIds exists (new format) or fall back to supplierId (old format)
        const supplierField = item.supplierIds || (item.supplierId ? [item.supplierId] : [])

        if (Array.isArray(supplierField) && supplierField.length > 0) {
          // Multiple suppliers case
          supplierField.forEach(supplierId => {
            if (typeof supplierId === 'object' && supplierId !== null) {
              // Already populated supplier object
              supplierNames.push(supplierId.supplierName || 'Unknown Supplier')
              actualSupplierIds.push(supplierId._id)
            } else if (typeof supplierId === 'string') {
              // Supplier ID string, need to find supplier data
              const supplier = suppliers.find(s => s._id === supplierId)
              supplierNames.push(supplier ? supplier.supplierName : 'Unknown Supplier')
              actualSupplierIds.push(supplierId)
            }
          })
        } else {
          // Fallback for old single supplier format or missing data
          let supplierName = 'Unknown Supplier'
          let actualSupplierId = item.supplierId

          if (typeof item.supplierId === 'object' && item.supplierId !== null) {
            supplierName = item.supplierId.supplierName || 'Unknown Supplier'
            actualSupplierId = item.supplierId._id
          } else if (typeof item.supplierId === 'string') {
            const supplier = suppliers.find(s => s._id === item.supplierId)
            supplierName = supplier ? supplier.supplierName : 'Unknown Supplier'
            actualSupplierId = item.supplierId
          }

          if (actualSupplierId) {
            supplierNames.push(supplierName)
            actualSupplierIds.push(actualSupplierId)
          }
        }

        // Calculate movement for this item
        const movement = calculateItemMovement(item.itemName)

        const itemWithSuppliers = {
          ...item,
          supplierNames: supplierNames,
          supplierIds: actualSupplierIds,
          // Keep original fields for backward compatibility
          supplierName: supplierNames[0] || 'Unknown Supplier',
          supplierId: actualSupplierIds[0] || item.supplierId,
          movement: movement
        }
        updatedArray.push(itemWithSuppliers)
      }

      console.log('Inventory processing complete')
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

  // Handle file upload for edit modal
  const handleEditFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setEditUploadError('Please select a valid image file (jpg, jpeg, png, gif, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditUploadError('File size must be less than 5MB');
      return;
    }

    setUploadingEditImage(true);
    setEditUploadError(null);

    // Create preview immediately
    const previewUrl = URL.createObjectURL(file);
    setEditImagePreview(previewUrl);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5555/upload/image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Set the uploaded image URL in the form
        editForm.setValue('itemImage', result.data.url);
        setEditImagePreview(`http://localhost:5555${result.data.url}`);
        console.log('Image uploaded successfully:', result.data);
      } else {
        setEditUploadError(result.message || 'Failed to upload image');
        setEditImagePreview(null);
        editForm.setValue('itemImage', editingItem.itemImage); // Reset to original
      }
    } catch (error) {
      console.error('Upload error:', error);
      setEditUploadError('Network error during upload');
      setEditImagePreview(null);
      editForm.setValue('itemImage', editingItem.itemImage); // Reset to original
    } finally {
      setUploadingEditImage(false);
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    }
  };

  function handleEdit(item) {
    setEditingItem(item)
    // Reset upload states
    setEditImagePreview(getImageUrl(item.itemImage))
    setUploadingEditImage(false)
    setEditUploadError(null)

    editForm.reset({
      itemName: item.itemName,
      itemBrandName: item.itemBrandName || '',
      itemDescription: item.itemDescription,
      itemPrice: item.itemPrice,
      itemExpiration: item.itemExpiration ? item.itemExpiration.split('T')[0] : '',
      itemCount: item.itemCount,
      itemImage: item.itemImage,
      itemCategory: item.itemCategory,
      supplierIds: item.supplierIds || [item.supplierId] // Handle both cases
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
        // Reset edit states
        setEditImagePreview(null)
        setUploadingEditImage(false)
        setEditUploadError(null)
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

  // Handle reorder functionality
  function handleReorder(item) {
    console.log('Handling reorder for item:', item.itemName)
    console.log('Item supplier data:', {
      supplierIds: item.supplierIds,
      supplierNames: item.supplierNames,
      legacy_supplierId: item.supplierId
    })

    // Handle multiple suppliers (new format)
    if (item.supplierIds && Array.isArray(item.supplierIds) && item.supplierIds.length > 0) {
      // Find all suppliers for this item
      const itemSuppliers = item.supplierIds.map(supplierId => {
        const supplier = suppliers.find(s => s._id === supplierId)
        if (!supplier) {
          console.warn(`Supplier with ID ${supplierId} not found`)
          return null
        }
        return supplier
      }).filter(supplier => supplier !== null) // Remove null entries

      if (itemSuppliers.length === 0) {
        showToast("No supplier information found for this item. Cannot generate reorder form.", "error")
        return
      }

      console.log(`Found ${itemSuppliers.length} suppliers for ${item.itemName}:`, itemSuppliers.map(s => s.supplierName))

      // Generate reorder forms for all suppliers
      printReorderForm(item, itemSuppliers, showToast)
      return
    }

    // Handle single supplier (legacy format)
    if (item.supplierId) {
      const supplier = suppliers.find(s => s._id === item.supplierId)

      if (!supplier) {
        showToast("Supplier information not found. Cannot generate reorder form.", "error")
        return
      }

      console.log(`Found single supplier for ${item.itemName}:`, supplier.supplierName)

      // Generate reorder form for single supplier
      printReorderForm(item, [supplier], showToast)
      return
    }

    // No supplier information found
    showToast("No supplier information available for this item. Cannot generate reorder form.", "error")
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

  // Check if item needs reordering (out of stock or low stock)
  function needsReorder(count, movement) {
    return count <= 10 || movement === 'Fast Moving'
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
              placeholder="Search by name or other attribute "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.totalItemsBox}>
              <p className={styles.totalItemsText}>
                Total Items: {filteredInventory.length}
              </p>
            </div>

            {/* Add refresh button */}
            <button
              className={`${styles.button} ${styles.refresh}`}
              onClick={refreshMovements}
              disabled={loading}
              title="Refresh movement calculations"
            >
              <FiRefreshCw className={loading ? styles.spinning : ''} />
              Refresh
            </button>
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
                  onClick={() => handleSort('movement')}
                >
                  Movement {renderSortIcon('movement')}
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
                  <td colSpan={8} className={styles.loadingCell}>
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      <span>Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
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
                        <div className={styles.supplierContainer}>
                          {item.supplierNames && item.supplierNames.length > 1 ? (
                            <div className={styles.multipleSuppliers}>
                              {item.supplierNames.slice(0, 2).map((name, index) => (
                                <span key={index} className={`${styles.badge} ${styles.blue}`}>
                                  {name}
                                </span>
                              ))}
                              {item.supplierNames.length > 2 && (
                                <span className={`${styles.badge} ${styles.gray}`}>
                                  +{item.supplierNames.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={`${styles.badge} ${styles.blue}`}>
                              {item.supplierName}
                            </span>
                          )}
                        </div>
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
                        <span className={`${styles.badge} ${styles.movement} ${item.movement === 'Fast Moving' ? styles.fastMoving : styles.slowMoving}`}>
                          {item.movement}
                        </span>
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
                          {/* Reorder button - only show for items that need reordering, AND THATS HNIGH MOVEMENT */}
                          {needsReorder(item.itemCount, item.movement) && (
                            <button
                              className={`${styles.button} ${styles.reorder}`}
                              onClick={() => handleReorder(item)}
                              title={
                                item.itemCount === 0
                                  ? "Item is out of stock - Generate urgent reorder form"
                                  : item.itemCount <= 10
                                    ? "Item is low in stock - Generate reorder form"
                                    : "Fast moving item - Generate proactive reorder form"
                              }
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
                  onClick={() => {
                    setEditingItem(null)
                    setEditImagePreview(null)
                    setUploadingEditImage(false)
                    setEditUploadError(null)
                  }}
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
                    Suppliers
                  </label>
                  <select
                    {...editForm.register("supplierIds", { required: true })}
                    multiple
                    className={`${styles.select} ${styles.multiSelect}`}
                    style={{ minHeight: "120px" }}
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplierName} - {supplier.supplierEmail}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
                    Hold Ctrl (Windows) or Cmd (Mac) while clicking to select multiple suppliers
                  </p>
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

                {/* NEW: File picker for image instead of URL input */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Product Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileUpload}
                    disabled={uploadingEditImage}
                    className={styles.input}
                    style={{
                      padding: "8px",
                      backgroundColor: uploadingEditImage ? "#f7fafc" : "white"
                    }}
                  />
                  {uploadingEditImage && (
                    <p style={{ fontSize: "14px", color: "#3182ce", marginTop: "4px" }}>
                      Uploading image...
                    </p>
                  )}
                  {editUploadError && (
                    <p style={{ fontSize: "14px", color: "#e53e3e", marginTop: "4px" }}>
                      {editUploadError}
                    </p>
                  )}
                  <p style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
                    Select an image file (max 5MB, jpg/png/gif/webp)
                  </p>
                </div>

                {/* Hidden input to store the uploaded image URL */}
                <input
                  type="hidden"
                  {...editForm.register("itemImage", { required: true })}
                />

                {/* Image Preview */}
                {editImagePreview && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Current Image:</label>
                    <img
                      src={editImagePreview}
                      alt="Product preview"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        objectFit: "cover",
                        border: "1px solid #cbd5e0",
                        borderRadius: "4px"
                      }}
                      onError={() => setEditImagePreview(null)}
                    />
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null)
                      setEditImagePreview(null)
                      setUploadingEditImage(false)
                      setEditUploadError(null)
                    }}
                    className={`${styles.modalButton} ${styles.secondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingEditImage}
                    className={`${styles.modalButton} ${styles.primary}`}
                  >
                    {uploadingEditImage ? "Uploading..." : "Save Changes"}
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
