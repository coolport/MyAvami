import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FiSearch, FiEdit2, FiTrash2, FiX, FiArrowUp, FiArrowDown, FiRefreshCw } from "react-icons/fi"
import PageHeader from "./components/PageHeader"
import { printReorderForm } from "./services/reorderTemplate"
import {
  getProducts,
  getSuppliers,
  updateProduct,
  deleteProduct,
} from "./services/inventoryService"
import { getTransactions } from "./services/userService"
import { uploadImage } from "./services/uploadService"
import {
  formatPrice,
  formatDate,
  getStockStatus,
  getImageUrl,
  LOW_STOCK_THRESHOLD,
} from "./utils/format"
import type { Product, Supplier, Transaction } from "./types"
import styles from "./styles/Inventory.module.css"

interface InventoryItem extends Product {
  supplierNames: string[]
  /** First resolved supplier name (backward-compatible single-supplier field). */
  supplierName: string
  movement: 'Fast Moving' | 'Slow Moving'
}

interface EditFormValues {
  itemName: string
  itemBrandName: string
  itemDescription: string
  itemPrice: number | string
  itemCount: number | string
  itemCategory: string
  itemExpiration?: string
  itemImage: string
  supplierIds: string[]
}

interface SortConfig {
  key: SortKey | null
  direction: 'asc' | 'desc'
}

type SortKey =
  | 'itemName'
  | 'itemBrandName'
  | 'itemPrice'
  | 'itemCount'
  | 'itemCategory'
  | 'itemExpiration'
  | 'supplierName'
  | 'movement'

const MOVEMENT_SALES_THRESHOLD = 5 // sales in the past 24 hours

function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  // File upload state for the edit modal
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [uploadingEditImage, setUploadingEditImage] = useState(false)
  const [editUploadError, setEditUploadError] = useState<string | null>(null)

  const editForm = useForm<EditFormValues>()

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        await fetchSuppliers()
        await fetchTransactions()
      } catch (error) {
        console.error('Error loading base data:', error)
      }
    }

    loadBaseData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (suppliers.length > 0 && transactions.length > 0) {
      getItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function linearSearch(array: InventoryItem[], searchTerm: string) {
    const results: InventoryItem[] = []
    const lowerSearchTerm = searchTerm.toLowerCase()

    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      const nameMatch = item.itemName.toLowerCase().includes(lowerSearchTerm)
      const brandMatch = item.itemBrandName ? item.itemBrandName.toLowerCase().includes(lowerSearchTerm) : false
      const descMatch = item.itemDescription.toLowerCase().includes(lowerSearchTerm)
      const categoryMatch = item.itemCategory.toLowerCase().includes(lowerSearchTerm)
      const supplierMatch = item.supplierName.toLowerCase().includes(lowerSearchTerm)

      if (nameMatch || brandMatch || descMatch || categoryMatch || supplierMatch) {
        results.push(item)
      }
    }

    return results
  }

  function getValueForSort(item: InventoryItem, key: SortKey): string | number {
    switch (key) {
      case 'itemName':
        return item.itemName.toLowerCase()
      case 'itemBrandName':
        return (item.itemBrandName || '').toLowerCase()
      case 'itemPrice':
        return parseFloat(String(item.itemPrice)) || 0
      case 'itemCount':
        return parseInt(String(item.itemCount)) || 0
      case 'itemCategory':
        return item.itemCategory.toLowerCase()
      case 'itemExpiration':
        return item.itemExpiration ? new Date(item.itemExpiration).getTime() : 0
      case 'supplierName':
        return item.supplierName.toLowerCase()
      case 'movement':
        return item.movement === 'Fast Moving' ? 1 : 0
    }
  }

  function handleSort(key: SortKey) {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    setSortConfig({ key, direction })

    const sorted = [...filteredInventory].sort((a, b) => {
      const leftValue = getValueForSort(a, key)
      const rightValue = getValueForSort(b, key)

      if (leftValue === rightValue) return 0

      const result = leftValue < rightValue ? -1 : 1
      return direction === 'asc' ? result : -result
    })
    setFilteredInventory(sorted)
  }

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchTransactions() {
    try {
      setTransactions(await getTransactions())
    } catch (e) {
      console.error("Failed to fetch transactions:", e)
    }
  }

  // Calculate item movement based on sales in the past 24 hours
  function calculateItemMovement(itemName: string): 'Fast Moving' | 'Slow Moving' {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    let totalSales = 0

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.transactionDate)
      const isInRange = transactionDate >= oneDayAgo && transactionDate <= now
      if (!isInRange) return

      transaction.transactCart?.forEach(cartItem => {
        if (cartItem.transactionCartItemName === itemName) {
          totalSales += parseInt(String(cartItem.transactionCartItemCount)) || 0
        }
      })
    })

    return totalSales >= MOVEMENT_SALES_THRESHOLD ? 'Fast Moving' : 'Slow Moving'
  }

  const refreshMovements = async () => {
    setLoading(true)

    try {
      await fetchTransactions()
      await getItems()
      showToast("Refreshed Inventory", "success")
    } catch (error) {
      console.error('Error refreshing movements:', error)
      showToast("Failed to refresh movements", "error")
    } finally {
      setLoading(false)
    }
  }

  async function fetchSuppliers() {
    try {
      setSuppliers(await getSuppliers())
    } catch (e) {
      console.error("Failed to fetch suppliers:", e)
    }
  }

  async function getItems() {
    setLoading(true)
    try {
      const data = await getProducts()
      const updatedArray: InventoryItem[] = data.map(item => {
        // Handle both populated supplier objects and raw id strings
        const supplierField = Array.isArray(item.supplierIds) ? item.supplierIds : []
        const supplierNames: string[] = []
        const actualSupplierIds: string[] = []

        supplierField.forEach(supplierRef => {
          if (typeof supplierRef === 'object' && supplierRef !== null) {
            supplierNames.push(supplierRef.supplierName || 'Unknown Supplier')
            actualSupplierIds.push(supplierRef._id)
          } else if (typeof supplierRef === 'string') {
            const supplier = suppliers.find(s => s._id === supplierRef)
            supplierNames.push(supplier ? supplier.supplierName : 'Unknown Supplier')
            actualSupplierIds.push(supplierRef)
          }
        })

        return {
          ...item,
          supplierNames,
          supplierIds: actualSupplierIds,
          supplierName: supplierNames[0] || 'Unknown Supplier',
          movement: calculateItemMovement(item.itemName),
        }
      })

      setInventory(updatedArray)
    } catch (e) {
      console.error(e)
      showToast("Failed to fetch inventory items", "error")
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload for edit modal
  const handleEditFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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
      const uploaded = await uploadImage(file);
      editForm.setValue('itemImage', uploaded.url);
      setEditImagePreview(getImageUrl(uploaded.url));
    } catch (error) {
      setEditUploadError((error as Error).message || 'Network error during upload');
      setEditImagePreview(null);
      if (editingItem) editForm.setValue('itemImage', editingItem.itemImage); // Reset to original
    } finally {
      setUploadingEditImage(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  function handleEdit(item: InventoryItem) {
    setEditingItem(item)
    setEditImagePreview(getImageUrl(item.itemImage))
    setUploadingEditImage(false)
    setEditUploadError(null)

    const ids = Array.isArray(item.supplierIds) ? item.supplierIds : []

    editForm.reset({
      itemName: item.itemName,
      itemBrandName: item.itemBrandName || '',
      itemDescription: item.itemDescription,
      itemPrice: item.itemPrice,
      itemExpiration: item.itemExpiration ? item.itemExpiration.split('T')[0] : '',
      itemCount: item.itemCount,
      itemImage: item.itemImage,
      itemCategory: item.itemCategory,
      supplierIds: ids.filter((id): id is string => typeof id === 'string'),
    })
  }

  async function onEditSubmit(data: EditFormValues) {
    if (!editingItem) return
    try {
      await updateProduct(editingItem._id, {
        ...data,
        itemPrice: Number(data.itemPrice),
        itemCount: Number(data.itemCount),
      })

      setEditingItem(null)
      setEditImagePreview(null)
      setUploadingEditImage(false)
      setEditUploadError(null)
      getItems()
      showToast("Inventory item updated successfully")
    } catch (error) {
      console.error("Edit error:", (error as Error).message)
      showToast("Failed to update inventory item", "error")
    }
  }

  function handleDelete(item: InventoryItem) {
    setDeleteConfirm(item)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    try {
      await deleteProduct(deleteConfirm._id)
      setDeleteConfirm(null)
      getItems()
      showToast("Inventory item deleted successfully")
    } catch (error) {
      console.error("Delete error:", (error as Error).message)
      showToast("Failed to delete inventory item", "error")
    }
  }

  // Handle reorder functionality
  function handleReorder(item: InventoryItem) {
    // Resolve all suppliers for this item
    const itemSuppliers = item.supplierIds
      .map(supplierId => suppliers.find(s => s._id === supplierId) ?? null)
      .filter((supplier): supplier is Supplier => supplier !== null)

    if (itemSuppliers.length > 0) {
      printReorderForm(item, itemSuppliers, showToast)
      return
    }

    showToast("No supplier information found for this item. Cannot generate reorder form.", "error")
  }

  // Check if item needs reordering (out of stock or low stock)
  function needsReorder(count: number, movement: string) {
    return count <= LOW_STOCK_THRESHOLD || movement === 'Fast Moving'
  }

  function renderSortIcon(columnKey: SortKey) {
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

            <button
              className={`${styles.button} ${styles.refresh}`}
              onClick={refreshMovements}
              disabled={loading}
              title="Refresh Inventory"
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
                filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.itemCount);
                  return (
                    <tr
                      key={item._id}
                      className={styles.tableRow}
                    >
                      <td className={styles.tableCell}>
                        <div className={styles.productCell}>
                          <img
                            src={getImageUrl(item.itemImage)}
                            alt={item.itemName}
                            className={styles.productImage}
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/60?text=No+Image"
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
                          {needsReorder(item.itemCount, item.movement) && (
                            <button
                              className={`${styles.button} ${styles.reorder}`}
                              onClick={() => handleReorder(item)}
                              title={
                                item.itemCount === 0
                                  ? "Item is out of stock - Generate urgent reorder form"
                                  : item.itemCount <= LOW_STOCK_THRESHOLD
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
