import React from 'react';
import { FiPrinter, FiX } from 'react-icons/fi';
import styles from '../styles/Receipt.module.css';

const Receipt = ({
  transactionData,
  onClose,
  onPrint
}) => {
  const {
    transactionEmployee,
    transactCart,
    transactionSubtotal,
    transactionVAT,
    transactionDiscount,
    transactionTotal,
    transactionAmountPaid,
    transactionSeniorPwdDiscount,
    transactionPaymentMethod,
    transactionDate,
    transactionId
  } = transactionData;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateChange = () => {
    return transactionAmountPaid - transactionTotal;
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #000;
          }
          .receipt {
            max-width: 300px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .store-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .store-info {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .transaction-info {
            margin-bottom: 15px;
            font-size: 10px;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 15px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .item-name {
            flex: 1;
            padding-right: 10px;
          }
          .item-qty-price {
            text-align: right;
            white-space: nowrap;
          }
          .totals {
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .total-row.final {
            border-top: 1px solid #000;
            padding-top: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
          .discount-note {
            color: #666;
            font-style: italic;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="store-name">MyAvami</div>
            <div class="store-info">123 Store Address</div>
            <div class="store-info">City, Province 1234</div>
            <div class="store-info">Tel: (02) 123-4567</div>
          </div>
          
          <div class="transaction-info">
            <div>Receipt #: ${transactionId || 'N/A'}</div>
            <div>Date: ${formatDate(transactionDate || new Date())}</div>
            <div>Cashier: ${transactionEmployee}</div>
            <div>Payment: ${transactionPaymentMethod.toUpperCase()}</div>
          </div>
          
          <div class="items">
            ${transactCart.map(item => `
              <div class="item">
                <div class="item-name">${item.transactionCartItemName}</div>
                <div class="item-qty-price">${item.transactionCartItemCount} x ${formatPrice(item.transactionCartItemPrice || 0)}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatPrice(transactionSubtotal)}</span>
            </div>
            
            ${transactionDiscount > 0 ? `
              <div class="total-row discount-note">
                <span>Senior/PWD Discount (20%):</span>
                <span>-${formatPrice(transactionDiscount)}</span>
              </div>
            ` : ''}
            
            ${transactionVAT > 0 ? `
              <div class="total-row">
                <span>VAT (12%):</span>
                <span>${formatPrice(transactionVAT)}</span>
              </div>
            ` : ''}
            
            <div class="total-row final">
              <span>TOTAL:</span>
              <span>${formatPrice(transactionTotal)}</span>
            </div>
            
            <div class="total-row">
              <span>Amount Paid:</span>
              <span>${formatPrice(transactionAmountPaid)}</span>
            </div>
            
            <div class="total-row">
              <span>Change:</span>
              <span>${formatPrice(calculateChange())}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Thank you for your purchase!</div>
            <div>Please keep this receipt for your records</div>
            ${transactionSeniorPwdDiscount ? '<div class="discount-note">Senior Citizen/PWD Discount Applied</div>' : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    // Call the onPrint callback if provided
    if (onPrint) onPrint();
  };
  const expectedDiscount = transactionSeniorPwdDiscount ? transactionSubtotal * 0.20 : 0;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Transaction Receipt</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className={styles.receiptContent}>
          <div className={styles.receiptHeader}>
            <div className={styles.storeName}>MyAvami</div>
            <div className={styles.storeInfo}>08 Molave, Project 3</div>
            <div className={styles.storeInfo}>Quezon City, NCR</div>
            <div className={styles.storeInfo}>Contact: 0906 545 5025</div>
          </div>

          <div className={styles.transactionInfo}>
            <div className={styles.infoRow}>
              <span>Receipt #:</span>
              <span>{transactionId || 'N/A'}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Date:</span>
              <span>{formatDate(transactionDate || new Date())}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Cashier:</span>
              <span>{transactionEmployee}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Payment:</span>
              <span>{transactionPaymentMethod.toUpperCase()}</span>
            </div>
          </div>

          <div className={styles.itemsList}>
            {transactCart.map((item, index) => (
              <div key={index} className={styles.receiptItem}>
                <div className={styles.itemName}>
                  {item.transactionCartItemName}
                </div>
                <div className={styles.itemQtyPrice}>
                  {item.transactionCartItemCount} x {formatPrice(item.transactionCartItemPrice || 0)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>{formatPrice(transactionSubtotal)}</span>
            </div>

            {transactionDiscount > 0 && (
              <div className={styles.totalRow} style={{ color: '#38a169' }}>
                <span>Senior/PWD Discount (20%):</span>
                <span>-{formatPrice(expectedDiscount)}</span>
              </div>
            )}

            {transactionVAT > 0 && (
              <div className={styles.totalRow}>
                <span>VAT (12%):</span>
                <span>{formatPrice(transactionVAT)}</span>
              </div>
            )}

            <div className={styles.totalRow} style={{
              borderTop: '2px solid #000',
              paddingTop: '8px',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              <span>TOTAL:</span>
              <span>{formatPrice(transactionTotal)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>Amount Paid:</span>
              <span>{formatPrice(transactionAmountPaid)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>Change:</span>
              <span>{formatPrice(calculateChange())}</span>
            </div>
          </div>

          <div className={styles.receiptFooter}>
            <p>Thank you for your purchase!</p>
            <p>Please keep this receipt for your records</p>
            {transactionSeniorPwdDiscount && (
              <p style={{ color: '#38a169', fontStyle: 'italic' }}>
                Senior Citizen/PWD Discount Applied
              </p>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Close
          </button>
          <button
            className={styles.primaryButton}
            onClick={handlePrint}
          >
            <FiPrinter style={{ marginRight: '8px' }} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
