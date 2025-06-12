import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSearch, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCreditCard, FiUser, FiTag, FiDollarSign } from "react-icons/fi";
import PageHeader from "./components/PageHeader";
import { postNotifications } from "./services/notificationService"; // Adjust path as needed

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

    const style = document.createElement('style');
    style.textContent = `
      .product-card {
        transition: all 0.2s ease !important;
      }
      
      .product-card:hover {
        border-color: #3182ce !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
      }
      
      .add-to-cart-btn {
        transition: all 0.2s ease !important;
      }
      
      .add-to-cart-btn:hover:not(:disabled) {
        background-color: #2c5aa0 !important;
        transform: scale(1.02) !important;
      }
      
      .cart-btn:hover {
        background-color: #2c5aa0 !important;
      }
      
      .secondary-btn:hover {
        background-color: #cbd5e0 !important;
      }
      
      .danger-btn:hover {
        background-color: #c53030 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Clean up style when component unmounts
      document.head.removeChild(style);
    };
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

  const total = cart.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );

  const filteredProducts = products.filter((p) =>
    p.itemName.toLowerCase().includes(search.toLowerCase()) ||
    p.itemCategory.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = () => {
    setShowCheckout(true);
    checkoutForm.reset({
      transactionEmployee: '',
      transactionPaymentMethod: 'cash',
      transactionDiscount: false,
      transactionAmountPaid: ''
    });
  };

  const onCheckoutSubmit = async (data) => {
    const finalTotal = data.transactionDiscount ? total * 0.9 : total;
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
      transactionTotal: finalTotal,
      transactionAmountPaid: amountPaid,
      transactionDiscount: data.transactionDiscount,
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
          await postNotifications({
            type: "sale",
            title: "Transaction Completed",
            message: `Sale completed by ${data.transactionEmployee}. Total: ${formatPrice(finalTotal)}. Payment: ${data.transactionPaymentMethod}`,
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
    if (count === 0) return { label: 'Out of Stock', className: 'stock-out', color: '#e53e3e' };
    if (count <= 10) return { label: 'Low Stock', className: 'stock-low', color: '#dd6b20' };
    return { label: 'In Stock', className: 'stock-in', color: '#38a169' };
  };

  const calculateChange = () => {
    const amountPaid = parseFloat(checkoutForm.watch("transactionAmountPaid") || 0);
    const finalTotal = checkoutForm.watch("transactionDiscount") ? total * 0.9 : total;
    return Math.max(0, amountPaid - finalTotal);
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    padding: '24px',
    gap: '32px',
    backgroundColor: '#ECF1EA',
    minHeight: '100vh',
    flexWrap: 'wrap'
  };

  const sectionStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const productCardStyle = {
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    width: '200px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  };

  const cartItemStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#ffffff'
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3182ce',
    color: '#ffffff'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e2e8f0',
    color: '#4a5568'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e53e3e',
    color: '#ffffff'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#2d3748',
    backgroundColor: '#ffffff',
    outline: 'none'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  };

  const modalContentStyle = {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    width: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid #e2e8f0'
  };

  return (
    <>
      <PageHeader title="Transact" />

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? '#e53e3e' : '#38a169',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          zIndex: 2000,
          fontWeight: '600'
        }}>
          {toast.message}
        </div>
      )}

      <div style={containerStyle}>
        {/* Products Section */}
        <div style={{
          ...sectionStyle,
          flex: '2',
          minWidth: '600px'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiTag />
            Products
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            gap: '12px'
          }}>
            <FiSearch style={{ color: '#718096', fontSize: '18px' }} />
            <input
              placeholder="Search products by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#718096'
            }}>
              Loading products...
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'flex-start'
            }}>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.itemCount);
                return (
                  <div
                    key={product._id}
                    className="product-card"
                    style={productCardStyle}
                  >
                    <img
                      src={product.itemImage}
                      alt={product.itemName}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        margin: '0 auto 12px',
                        display: 'block',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#2d3748'
                    }}>
                      {product.itemName}
                    </h3>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      color: '#718096',
                      backgroundColor: '#edf2f7',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      display: 'inline-block'
                    }}>
                      {product.itemCategory}
                    </p>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {formatPrice(product.itemPrice)}
                    </p>
                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: '12px',
                      color: stockStatus.color,
                      fontWeight: '600'
                    }}>
                      {stockStatus.label} ({product.itemCount})
                    </p>
                    <button
                      className="add-to-cart-btn"
                      style={{
                        ...primaryButtonStyle,
                        width: '100%',
                        opacity: product.itemCount === 0 ? 0.5 : 1,
                        cursor: product.itemCount === 0 ? 'not-allowed' : 'pointer'
                      }}
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
        <div style={{
          ...sectionStyle,
          flex: '1',
          minWidth: '350px',
          height: 'fit-content'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiShoppingCart />
            Cart ({cart.length})
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {cart.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#718096'
              }}>
                Your cart is empty
              </div>
            ) : (
              cart.map((item) => (
                <div key={item._id} style={cartItemStyle}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2d3748'
                      }}>
                        {item.itemName}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#718096'
                      }}>
                        {formatPrice(item.itemPrice)} each
                      </p>
                    </div>
                    <button
                      className="danger-btn"
                      style={dangerButtonStyle}
                      onClick={() => removeFromCart(item._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <button
                        className="secondary-btn"
                        style={secondaryButtonStyle}
                        onClick={() => updateQuantity(item._id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span style={{
                        minWidth: '40px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#2d3748'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        className="secondary-btn"
                        style={secondaryButtonStyle}
                        onClick={() => updateQuantity(item._id, 1)}
                        disabled={item.quantity >= item.itemCount}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {formatPrice(item.itemPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{
            borderTop: '2px solid #e2e8f0',
            paddingTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#2d3748'
              }}>
                Total:
              </span>
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#3182ce'
              }}>
                {formatPrice(total)}
              </span>
            </div>

            <button
              className="cart-btn"
              style={{
                ...primaryButtonStyle,
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                opacity: cart.length === 0 ? 0.5 : 1,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
              }}
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
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FiCreditCard />
              Complete Transaction
            </h2>

            <form
              onSubmit={checkoutForm.handleSubmit(onCheckoutSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '14px'
                }}>
                  <FiUser style={{ marginRight: '4px' }} />
                  Employee Name *
                </label>
                <input
                  {...checkoutForm.register("transactionEmployee", { required: true })}
                  placeholder="Enter employee name"
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
                  Payment Method *
                </label>
                <select
                  {...checkoutForm.register("transactionPaymentMethod", { required: true })}
                  style={inputStyle}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '14px'
                }}>
                  <FiDollarSign style={{ marginRight: '4px' }} />
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
                  style={inputStyle}
                />
                {checkoutForm.watch("transactionAmountPaid") && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f0fff4',
                    borderRadius: '4px',
                    border: '1px solid #9ae6b4'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#2f855a',
                      fontWeight: '600'
                    }}>
                      Change: {formatPrice(calculateChange())}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  {...checkoutForm.register("transactionDiscount")}
                  style={{ width: '16px', height: '16px' }}
                />
                <label style={{
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '14px'
                }}>
                  Apply 10% Discount
                </label>
              </div>

              <div style={{
                backgroundColor: '#f7fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  Order Summary
                </h3>
                {cart.map(item => (
                  <div key={item._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#4a5568'
                  }}>
                    <span>{item.itemName} x{item.quantity}</span>
                    <span>{formatPrice(item.itemPrice * item.quantity)}</span>
                  </div>
                ))}
                {checkoutForm.watch("transactionDiscount") && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#38a169',
                    fontWeight: '600'
                  }}>
                    <span>Discount (10%):</span>
                    <span>-{formatPrice(total * 0.1)}</span>
                  </div>
                )}
                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '8px',
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#2d3748'
                }}>
                  <span>Total:</span>
                  <span>{formatPrice(checkoutForm.watch("transactionDiscount") ? total * 0.9 : total)}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowCheckout(false)}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cart-btn"
                  style={primaryButtonStyle}
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
