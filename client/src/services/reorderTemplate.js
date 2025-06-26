// ReorderFormTemplate.js
export const generateReorderFormHTML = (item, supplier) => {
  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const stockLevel = item.itemCount === 0 ? 'out_of_stock' : 'low_stock'
  const reorderQuantity = item.itemCount === 0 ? 100 : 50

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reorder Form</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.6;
          color: #333;
        }
        .letterhead {
          text-align: center;
          border-bottom: 3px solid #2d5aa0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .pharmacy-name {
          font-size: 28px;
          font-weight: bold;
          color: #2d5aa0;
          margin-bottom: 5px;
        }
        .pharmacy-address {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .form-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 30px 0;
          color: #2d5aa0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .form-section {
          margin-bottom: 25px;
          padding: 15px;
          background-color: #f8f9fa;
          border-left: 4px solid #2d5aa0;
        }
        .section-title {
          font-weight: bold;
          font-size: 18px;
          color: #2d5aa0;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 5px 0;
        }
        .label {
          font-weight: bold;
          color: #555;
          min-width: 150px;
        }
        .value {
          color: #333;
          flex: 1;
          text-align: left;
          padding-left: 20px;
        }
        .product-details {
          background-color: #fff3cd;
          border: 2px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .urgent-notice {
          background-color: #f8d7da;
          border: 2px solid #dc3545;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
          text-align: center;
        }
        .urgent-text {
          color: #721c24;
          font-weight: bold;
          font-size: 16px;
        }
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 200px;
          text-align: center;
        }
        .signature-line {
          border-top: 2px solid #333;
          margin-bottom: 5px;
          height: 40px;
        }
        .terms {
          margin-top: 30px;
          padding: 15px;
          background-color: #e9ecef;
          border-radius: 5px;
          font-size: 12px;
          color: #6c757d;
        }
        .terms-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #495057;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="letterhead">
        <div class="pharmacy-name">AVAMI PHARMACY ANONAS</div>
        <div class="pharmacy-address">
          08 Molave, Project 3, Quezon City, 1102 Kalakhang Maynila<br>
          Contact: (02) 8xxx-xxxx | Email: avamipharmacy@gmail.com
        </div>
      </div>

      <div class="form-title">Product Reorder Request Form</div>

      <div class="form-section">
        <div class="section-title">Order Information</div>
        <div class="info-row">
          <span class="label">Date of Request:</span>
          <span class="value">${currentDate}</span>
        </div>
        <div class="info-row">
          <span class="label">Request Type:</span>
          <span class="value">${stockLevel === 'out_of_stock' ? 'URGENT - Out of Stock' : 'Low Stock Replenishment'}</span>
        </div>
        <div class="info-row">
          <span class="label">Requested By:</span>
          <span class="value">Pharmacy Manager</span>
        </div>
      </div>

      ${stockLevel === 'out_of_stock' ? `
      <div class="urgent-notice">
        <div class="urgent-text">⚠️ URGENT REORDER REQUIRED ⚠️</div>
        <div>This product is completely out of stock and needs immediate replenishment</div>
      </div>
      ` : ''}

      <div class="form-section">
        <div class="section-title">Supplier Information</div>
        <div class="info-row">
          <span class="label">Supplier Name:</span>
          <span class="value">${supplier.supplierName}</span>
        </div>
        <div class="info-row">
          <span class="label">Contact Email:</span>
          <span class="value">${supplier.supplierEmail}</span>
        </div>
        <div class="info-row">
          <span class="label">Phone Number:</span>
          <span class="value">${supplier.supplierNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Address:</span>
          <span class="value">${supplier.supplierAddress}</span>
        </div>
      </div>

      <div class="product-details">
        <div class="section-title">Product Details & Order Request</div>
        <div class="info-row">
          <span class="label">Product Name:</span>
          <span class="value">${item.itemName}</span>
        </div>
        ${item.itemBrandName ? `
        <div class="info-row">
          <span class="label">Brand:</span>
          <span class="value">${item.itemBrandName}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="label">Category:</span>
          <span class="value">${item.itemCategory}</span>
        </div>
        <div class="info-row">
          <span class="label">Current Stock Level:</span>
          <span class="value">${item.itemCount} units ${stockLevel === 'out_of_stock' ? '(OUT OF STOCK)' : '(LOW STOCK)'}</span>
        </div>
        <div class="info-row">
          <span class="label">Requested Quantity:</span>
          <span class="value">${reorderQuantity} units</span>
        </div>
        <div class="info-row">
          <span class="label">Expected Delivery:</span>
          <span class="value">Within 3-5 business days</span>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">Order Details</div>
        <p><strong>Dear ${supplier.supplierName},</strong></p>
        <p>We would like to place an order for <strong>${reorderQuantity} units</strong> of <strong>${item.itemName}</strong>${item.itemBrandName ? ` (${item.itemBrandName})` : ''}. 
        ${stockLevel === 'out_of_stock' ?
      'This is an urgent request as we are currently out of stock for this essential item.' :
      'Our current inventory is running low and we need to replenish our stock to meet customer demand.'
    }</p>
        
        <p>Please confirm the availability and provide us with:</p>
        <ul>
          <li>Unit price and total cost</li>
          <li>Expected delivery date</li>
          <li>Payment terms</li>
          <li>Any minimum order requirements</li>
        </ul>

        <p>We appreciate your prompt response and look forward to continuing our business relationship.</p>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div><strong>Pharmacy Manager</strong></div>
          <div>Avami Pharmacy Anonas</div>
          <div>Date: ${currentDate}</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div><strong>Supplier Representative</strong></div>
          <div>${supplier.supplierName}</div>
          <div>Date: _______________</div>
        </div>
      </div>

      <div class="terms">
        <div class="terms-title">Terms and Conditions:</div>
        <p>• All orders are subject to supplier confirmation and availability<br>
        • Payment terms to be confirmed upon order acceptance<br>
        • Delivery charges may apply based on order value and location<br>
        • Products must meet quality standards and expiration date requirements<br>
        • This form serves as an official purchase request from Avami Pharmacy Anonas</p>
      </div>
    </body>
    </html>
  `
}

export const printReorderForm = (item, supplier, showToast) => {
  try {
    const printContent = generateReorderFormHTML(item, supplier)

    // Create new window and print
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }

    // Show success message
    showToast("Reorder form generated and sent to printer", "success")
  } catch (error) {
    console.error("Error printing reorder form:", error)
    showToast("Failed to generate reorder form", "error")
  }
}
