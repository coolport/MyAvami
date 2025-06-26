import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSearch, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCreditCard, FiUser, FiTag, FiDollarSign } from "react-icons/fi";
import PageHeader from "./components/PageHeader";
import { postNotifications } from "./services/notificationService"; // Adjust path as needed
import styles from "./styles/Sale.module.css";

const Sale = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const checkoutForm = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchProducts() {
    setLoading(true);
    try {
      const url = "http://localhost:5555/products";
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const data = json.data;
      const updatedArray = [];

      for (const x in data) {
        updatedArray.push(data[x]);
      }
      setProducts(updatedArray);
    } catch (error) {
      console.error(error.message);
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  }

  const updateProductStock = async (productId, newStock) => {
    try {
      const response = await fetch(`http://localhost:5555/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemCount: newStock }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update stock: ${response.status}`);
      }

      // Update local products state
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

  const checkAndNotifyStockLevels = async (productId, productName, newStock) => {
    try {
      // Check if stock is at zero (out of stock)
      if (newStock === 0) {
        await postNotifications({
          type: "stock_alert",
          title: "Out of Stock Alert",
          message: `${productName} is now out of stock`,
          userInvolved: "System",
          itemInvolved: productName
        });
      }
      // Check if stock is low (10 or below, but not zero)
      else if (newStock <= 10) {
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

  const addToCart = (product) => {
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

  const removeFromCart = (id) => {
    const item = cart.find(item => item._id === id);
    setCart(cart.filter((item) => item._id !== id));
    showToast(`${item.itemName} removed from cart`);
  };

  const updateQuantity = (id, delta) => {
    const item = cart.find(item => item._id === id);
    const newQuantity = item.quantity + delta;

    if (newQuantity > item.itemCount) {
      showToast("Cannot exceed available stock", "error");
      return;
    }

    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );

  // Calculate VAT and total with Philippine tax system
  const calculateTaxAndTotal = () => {
    const isSeniorPwd = checkoutForm.watch("transactionSeniorPwdDiscount");

    // If Senior/PWD, apply 20% discount to subtotal and no VAT
    if (isSeniorPwd) {
      const discountedSubtotal = subtotal * 0.8; // 20% discount
      return {
        subtotal,
        discount: subtotal * 0.2,
        vat: 0,
        total: discountedSubtotal
      };
    }

    // Regular customer: apply 12% VAT
    const vat = subtotal * 0.12;
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
    p.itemCategory.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = () => {
    setShowCheckout(true);
    checkoutForm.reset({
      transactionEmployee: '',
      transactionPaymentMethod: 'cash',
      transactionSeniorPwdDiscount: false,
      transactionAmountPaid: ''
    });
  };

  const onCheckoutSubmit = async (data) => {
    const { total: finalTotal, vat, discount } = calculateTaxAndTotal();
    const amountPaid = parseFloat(data.transactionAmountPaid);

    // Validate amount paid
    if (amountPaid < finalTotal) {
      showToast("Amount paid cannot be less than the total", "error");
      return;
    }

    const transactionData = {
      transactionEmployee: data.transactionEmployee,
      transactCart: cart.map(item => ({
        transactionCartItemName: item.itemName,
        transactionCartItemID: item._id,
        transactionCartItemCount: item.quantity
      })),
      transactionSubtotal: subtotal,
      transactionVAT: vat,
      transactionDiscount: discount,
      transactionTotal: finalTotal,
      transactionAmountPaid: amountPaid,
      transactionSeniorPwdDiscount: data.transactionSeniorPwdDiscount,
      transactionPaymentMethod: data.transactionPaymentMethod
    };

    try {
      const response = await fetch("http://localhost:5555/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const transactionResult = await response.json();

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
              // Check and notify about stock levels after update
              await checkAndNotifyStockLevels(item._id, item.itemName, newStock);
            }
          }
        }

        setShowCheckout(false);
        setCart([]);
        checkoutForm.reset();
        showToast("Transaction completed successfully!");
      } else {
        throw new Error("Failed to process transaction");
      }
    } catch (error) {
      console.error("Transaction error:", error.message);
      showToast("Failed to process transaction", "error");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const getStockStatus = (count) => {
    if (count === 0) return { label: 'Out of Stock', color: '#e53e3e' };
    if (count <= 10) return { label: 'Low Stock', color: '#dd6b20' };
    return { label: 'In Stock', color: '#38a169' };
  };

  const calculateChange = () => {
    const amountPaid = parseFloat(checkoutForm.watch("transactionAmountPaid") || 0);
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
              placeholder="Search products by name or category..."
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
                return (
                  <div key={product._id} className={styles.productCard}>
                    <img
                      src={product.itemImage}
                      alt={product.itemName}
                      className={styles.productImage}
                    />
                    <h3 className={styles.productName}>
                      {product.itemName}
                    </h3>
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
                      disabled={product.itemCount === 0}
                    >
                      <FiPlus style={{ marginRight: '4px' }} />
                      Add to Cart
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
                      <span className={styles.quantity}>
                        {item.quantity}
                      </span>
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
              disabled={cart.length === 0}
            >
              <FiCreditCard style={{ marginRight: '8px' }} />
              Checkout
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
                  Employee Name *
                </label>
                <input
                  {...checkoutForm.register("transactionEmployee", { required: true })}
                  placeholder="Enter employee name"
                  className={styles.input}
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
                  <option value="card">Credit/Debit Card</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                </select>
              </div>

              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  {...checkoutForm.register("transactionSeniorPwdDiscount")}
                  className={styles.checkbox}
                />
                <label className={styles.label}>
                  Senior Citizen / PWD Discount (20% discount, VAT exempt)
                </label>
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  {/* <FiDollarSign style={{ marginRight: '4px' }} /> */}
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
                {checkoutForm.watch("transactionAmountPaid") && (
                  <div className={styles.changeIndicator}>
                    <p className={styles.changeText}>
                      Change: {formatPrice(calculateChange())}
                    </p>
                  </div>
                )}
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
    </>
  );
};

export default Sale;
