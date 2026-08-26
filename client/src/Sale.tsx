import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSearch, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCreditCard, FiUser, FiTag } from "react-icons/fi";
import PageHeader from "./components/PageHeader";
import { postNotifications } from "./services/notificationService";
import { getProducts, getSuppliers, updateProduct } from "./services/inventoryService";
import { createTransaction } from "./services/userService";
import { getSessionUser } from "./services/authService";
import {
  formatPrice,
  getStockStatus,
  getExpirationStatus,
  getImageUrl,
  LOW_STOCK_THRESHOLD,
} from "./utils/format";

// Sale pages render a friendlier fallback for products without an expiration date.
function formatExpirationDate(dateString: string | undefined) {
  if (!dateString) return "No expiration";
  return new Date(dateString).toLocaleDateString("en-PH");
}
import type { Product, SessionUser } from "./types";
import styles from "./styles/Sale.module.css";
import Receipt from './components/Receipt';

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutFormValues {
  transactionEmployee: string;
  transactionPaymentMethod: string;
  transactionSeniorPwdDiscount?: boolean;
  transactionAmountPaid: number | string;
}

interface ReceiptData {
  transactionEmployee: string;
  transactCart: Array<{
    transactionCartItemName: string;
    transactionCartItemID: string;
    transactionCartItemCount: number;
    transactionCartItemPrice?: number;
  }>;
  transactionSubtotal: number;
  transactionVAT: number;
  transactionDiscount: boolean;
  transactionTotal: number;
  transactionAmountPaid: number;
  transactionSeniorPwdDiscount: boolean;
  transactionPaymentMethod: string;
  transactionId: string;
  transactionDate: string;
}

const VAT_RATE = 0.12;
const SENIOR_PWD_DISCOUNT_RATE = 0.2;

const Sale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<ReceiptData | null>(null);

  const checkoutForm = useForm<CheckoutFormValues>();

  useEffect(() => {
    fetchSuppliers().then(() => {
      fetchProducts();
    });
    getCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentUser = async () => {
    setCurrentUser(await getSessionUser());
  };

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchSuppliers() {
    try {
      await getSuppliers();
    } catch (e) {
      console.error("Failed to fetch suppliers:", e);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch (error) {
      console.error((error as Error).message);
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  }

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      await updateProduct(productId, { itemCount: newStock });

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === productId
            ? { ...product, itemCount: newStock }
            : product
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating product stock:", error);
      return false;
    }
  };

  const checkAndNotifyStockLevels = async (productId: string, productName: string, newStock: number) => {
    try {
      if (newStock === 0) {
        await postNotifications({
          type: "stock_alert",
          title: "Out of Stock Alert",
          message: `${productName} is now out of stock`,
          userInvolved: "System",
          itemInvolved: productName
        });
      } else if (newStock <= LOW_STOCK_THRESHOLD) {
        await postNotifications({
          type: "stock_alert",
          title: "Low Stock Alert",
          message: `${productName} is running low in stock (${newStock} remaining)`,
          userInvolved: "System",
          itemInvolved: productName
        });
      }
    } catch (notificationError) {
      console.error("Failed to send stock notification:", notificationError);
    }
  };

  const addToCart = (product: Product) => {
    if (product.itemCount === 0) {
      showToast("This item is out of stock", "error");
      return;
    }

    const exists = cart.find((item) => item._id === product._id);
    if (exists) {
      if (exists.quantity >= product.itemCount) {
        showToast("Cannot add more items than available in stock", "error");
        return;
      }
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    showToast(`${product.itemName} added to cart`);
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(item => item._id === id);
    if (!item) return;
    setCart(cart.filter((item) => item._id !== id));
    showToast(`${item.itemName} removed from cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find(item => item._id === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;

    if (newQuantity > item.itemCount) {
      showToast("Cannot exceed available stock", "error");
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const updateQuantityDirect = (id: string, newQuantity: string | number) => {
    const item = cart.find(item => item._id === id);
    if (!item) return;
    const quantity = parseInt(String(newQuantity)) || 1;

    if (quantity > item.itemCount) {
      showToast("Cannot exceed available stock", "error");
      return;
    }

    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );

  // Senior/PWD customers get a 20% discount and are VAT-exempt; regular sales add 12% VAT.
  const calculateTaxAndTotal = () => {
    const isSeniorPwd = checkoutForm.watch("transactionSeniorPwdDiscount");

    if (isSeniorPwd) {
      const discountedSubtotal = subtotal * (1 - SENIOR_PWD_DISCOUNT_RATE);
      return {
        subtotal,
        discount: subtotal * SENIOR_PWD_DISCOUNT_RATE,
        vat: 0,
        total: discountedSubtotal
      };
    }

    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

    return {
      subtotal,
      discount: 0,
      vat,
      total
    };
  };

  const filteredProducts = products.filter((p) =>
    p.itemName.toLowerCase().includes(search.toLowerCase()) ||
    p.itemCategory.toLowerCase().includes(search.toLowerCase()) ||
    (p.itemBrandName && p.itemBrandName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCheckout = () => {
    if (!currentUser) {
      showToast("Please log in to complete transactions", "error");
      return;
    }
    setShowCheckout(true);
    checkoutForm.reset({
      transactionEmployee: currentUser.username || 'Unknown User',
      transactionPaymentMethod: 'cash',
      transactionSeniorPwdDiscount: false,
      transactionAmountPaid: ''
    });
  };

  const onCheckoutSubmit = async (data: CheckoutFormValues) => {
    const seniorPwdDiscount = Boolean(data.transactionSeniorPwdDiscount);

    const { total: finalTotal, vat } = calculateTaxAndTotal();
    const amountPaid = parseFloat(String(data.transactionAmountPaid)) || 0;

    if (amountPaid < finalTotal) {
      showToast("Amount paid cannot be less than the total", "error");
      return;
    }

    const transactionData = {
      transactionEmployee: data.transactionEmployee,
      transactCart: cart.map(item => ({
        transactionCartItemName: item.itemName,
        transactionCartItemID: item._id,
        transactionCartItemCount: item.quantity,
        transactionCartItemPrice: item.itemPrice
      })),
      transactionSubtotal: subtotal,
      transactionVAT: vat,
      transactionDiscount: seniorPwdDiscount,
      transactionTotal: finalTotal,
      transactionAmountPaid: amountPaid,
      transactionSeniorPwdDiscount: seniorPwdDiscount,
      transactionPaymentMethod: data.transactionPaymentMethod
    };

    try {
      const transactionResult = await createTransaction({
        transactionEmployee: transactionData.transactionEmployee,
        transactCart: transactionData.transactCart,
        transactionDiscount: seniorPwdDiscount,
        transactionTotal: finalTotal,
        transactionAmountPaid: amountPaid,
        transactionPaymentMethod: data.transactionPaymentMethod
      });

      // Send notification about the completed transaction
      try {
        const customerType = data.transactionSeniorPwdDiscount ? " (Senior/PWD)" : "";
        await postNotifications({
          type: "sale",
          title: "Transaction Completed",
          message: `Sale completed by ${data.transactionEmployee}${customerType}. Total: ${formatPrice(finalTotal)}. Payment: ${data.transactionPaymentMethod}`,
          userInvolved: data.transactionEmployee,
          itemInvolved: cart.map(item => `${item.itemName} (${item.quantity})`).join(", ")
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don't block the transaction if notification fails
      }

      // Update stock for each item in the cart
      for (const item of cart) {
        const currentProduct = products.find(p => p._id === item._id);
        if (currentProduct) {
          const newStock = currentProduct.itemCount - item.quantity;
          const stockUpdated = await updateProductStock(item._id, newStock);

          if (stockUpdated) {
            await checkAndNotifyStockLevels(item._id, item.itemName, newStock);
          }
        }
      }

      // Prepare transaction data for receipt
      setLastTransaction({
        ...transactionData,
        transactionId: transactionResult?._id || 'N/A',
        transactionDate: new Date().toISOString()
      });
      setShowCheckout(false);
      setShowReceipt(true);

      // Clear cart and form
      setCart([]);
      checkoutForm.reset();
      showToast("Transaction completed successfully!");
    } catch (error) {
      console.error("Transaction error:", (error as Error).message);
      showToast("Failed to process transaction", "error");
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setLastTransaction(null);
  };

  const calculateChange = () => {
    const amountPaid = parseFloat(checkoutForm.watch("transactionAmountPaid") as unknown as string) || 0;
    const { total: finalTotal } = calculateTaxAndTotal();
    return Math.max(0, amountPaid - finalTotal);
  };

  const { subtotal: displaySubtotal, vat, discount, total } = calculateTaxAndTotal();

  return (
    <>
      <PageHeader title="Transact" />

      {/* Toast Notification */}
      {toast && (
        <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
          {toast.message}
        </div>
      )}

      <div className={styles.container}>
        {/* Products Section */}
        <div className={styles.productsSection}>
          <h2 className={styles.sectionHeader}>
            <FiTag />
            Products
          </h2>

          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              placeholder="Search products by name, brand, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              Loading products...
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.itemCount);
                const expirationStatus = getExpirationStatus(product.itemExpiration);
                return (
                  <div key={product._id} className={styles.productCard}>
                    <img
                      src={getImageUrl(product.itemImage, "large")}
                      alt={product.itemName}
                      className={styles.productImage}
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/200x150?text=No+Image";
                      }}
                    />
                    <h3 className={styles.productName}>
                      {product.itemName}
                    </h3>
                    <p
                      className={styles.productExpiration}
                      style={{
                        color: expirationStatus.color,
                        fontWeight: expirationStatus.isExpired || expirationStatus.isNearExpiry ? 'bold' : 'normal'
                      }}
                    >
                      {expirationStatus.isExpired ? '⚠️ EXPIRED: ' :
                        expirationStatus.isNearExpiry ? '⏰ Expires: ' : 'Expires: '}
                      {formatExpirationDate(product.itemExpiration)}
                    </p>
                    {product.itemBrandName && (
                      <p className={styles.productBrand}>
                        {product.itemBrandName}
                      </p>
                    )}
                    <p className={styles.productCategory}>
                      {product.itemCategory}
                    </p>
                    <p className={styles.productPrice}>
                      {formatPrice(product.itemPrice)}
                    </p>
                    <p
                      className={styles.stockStatus}
                      style={{ color: stockStatus.color }}
                    >
                      {stockStatus.label} ({product.itemCount})
                    </p>
                    <button
                      className={styles.addToCartButton}
                      onClick={() => addToCart(product)}
                      disabled={product.itemCount === 0 || expirationStatus.isExpired}
                    >
                      <FiPlus style={{ marginRight: '4px' }} />
                      {expirationStatus.isExpired ? 'Expired' : 'Add to Cart'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className={styles.cartSection}>
          <h2 className={styles.sectionHeader}>
            <FiShoppingCart />
            Cart ({cart.length})
          </h2>

          <div className={styles.cartItems}>
            {cart.length === 0 ? (
              <div className={styles.emptyState}>
                Your cart is empty
              </div>
            ) : (
              cart.map((item) => (
                <div key={item._id} className={styles.cartItem}>
                  <div className={styles.cartItemHeader}>
                    <div>
                      <h4 className={styles.cartItemName}>
                        {item.itemName}
                      </h4>
                      {item.itemBrandName && (
                        <p className={styles.cartItemBrand}>
                          {item.itemBrandName}
                        </p>
                      )}
                      <p className={styles.cartItemExpiration}>
                        Expires: {formatExpirationDate(item.itemExpiration)}
                      </p>
                      <p className={styles.cartItemPrice}>
                        {formatPrice(item.itemPrice)} each
                      </p>
                    </div>
                    <button
                      className={styles.dangerButton}
                      onClick={() => removeFromCart(item._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className={styles.cartItemControls}>
                    <div className={styles.quantityControls}>
                      <button
                        className={styles.secondaryButton}
                        onClick={() => updateQuantity(item._id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.itemCount}
                        value={item.quantity}
                        onChange={(e) => updateQuantityDirect(item._id, e.target.value)}
                        className={styles.quantityInput}
                      />
                      <button
                        className={styles.secondaryButton}
                        onClick={() => updateQuantity(item._id, 1)}
                        disabled={item.quantity >= item.itemCount}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <p className={styles.cartItemTotal}>
                      {formatPrice(item.itemPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.cartTotal}>
            <div className={styles.totalBreakdown}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Subtotal:</span>
                <span className={styles.totalAmount}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Senior/PWD Discount (20%):</span>
                  <span className={styles.totalAmount} style={{ color: '#38a169' }}>
                    -{formatPrice(discount)}
                  </span>
                </div>
              )}

              {vat > 0 && (
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>VAT (12%):</span>
                  <span className={styles.totalAmount}>
                    {formatPrice(vat)}
                  </span>
                </div>
              )}

              <div className={styles.totalRow} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontWeight: 'bold' }}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              className={styles.checkoutButton}
              onClick={handleCheckout}
              disabled={cart.length === 0 || !currentUser}
            >
              <FiCreditCard style={{ marginRight: '8px' }} />
              {!currentUser ? 'Please Login' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalHeader}>
              <FiCreditCard />
              Complete Transaction
            </h2>

            <form
              onSubmit={checkoutForm.handleSubmit(onCheckoutSubmit)}
              className={styles.form}
            >
              <div className={styles.formField}>
                <label className={styles.label}>
                  <FiUser style={{ marginRight: '4px' }} />
                  Employee
                </label>
                <input
                  {...checkoutForm.register("transactionEmployee")}
                  readOnly
                  className={`${styles.input} ${styles.readOnly}`}
                  style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Payment Method *
                </label>
                <select
                  {...checkoutForm.register("transactionPaymentMethod", { required: true })}
                  className={styles.select}
                >
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                </select>
              </div>

              <div className={styles.checkboxContainer}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    {...checkoutForm.register("transactionSeniorPwdDiscount")}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    Senior Citizen / PWD Discount (20% discount, VAT exempt)
                  </span>
                </label>
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Amount Paid *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...checkoutForm.register("transactionAmountPaid", {
                    required: true,
                    min: 0,
                    valueAsNumber: true
                  })}
                  placeholder="Enter amount paid"
                  className={styles.input}
                />
                {checkoutForm.watch("transactionAmountPaid") ? (
                  <div className={styles.changeIndicator}>
                    <p className={styles.changeText}>
                      Change: {formatPrice(calculateChange())}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className={styles.orderSummary}>
                <h3 className={styles.orderSummaryTitle}>
                  Order Summary
                </h3>
                {cart.map(item => (
                  <div key={item._id} className={styles.orderItem}>
                    <span>{item.itemName} x{item.quantity}</span>
                    <span>{formatPrice(item.itemPrice * item.quantity)}</span>
                  </div>
                ))}

                <div className={styles.orderItem} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                  <span>Subtotal:</span>
                  <span>{formatPrice(displaySubtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className={styles.orderItem} style={{ color: '#38a169' }}>
                    <span>Senior/PWD Discount (20%):</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                {vat > 0 && (
                  <div className={styles.orderItem}>
                    <span>VAT (12%):</span>
                    <span>{formatPrice(vat)}</span>
                  </div>
                )}

                <div className={styles.orderTotal}>
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowCheckout(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                >
                  Complete Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <Receipt
          transactionData={lastTransaction}
          onClose={handleReceiptClose}
        />
      )}
    </>
  );
};

export default Sale;
