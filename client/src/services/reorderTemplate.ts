// Reorder form template for generating printable supplier purchase requests.
import type { Product, Supplier } from '../types';

export const generateReorderFormHTML = (item: Product, suppliers: Supplier[]): string => {
  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const stockLevel = item.itemCount === 0 ? 'out_of_stock' : 'low_stock'
  const reorderQuantity = item.itemCount === 0 ? 100 : 50

  // Handle both single supplier (legacy) and multiple suppliers (new)
  const supplierList = Array.isArray(suppliers) ? suppliers : [suppliers]

  // Generate individual reorder forms for each supplier
  const supplierForms = supplierList.map((supplier, index) => {
    return `
      <div class="supplier-form">
        <div class="letterhead">
          <div class="pharmacy-name">AVAMI PHARMACY ANONAS</div>
          <div class="pharmacy-address">
            08 Molave, Project 3, Quezon City, 1102 Kalakhang Maynila<br>
            Contact: (02) 8xxx-xxxx | Email: avamipharmacy@gmail.com
          </div>
        </div>

        <div class="form-title">Product Reorder Request Form</div>
        ${supplierList.length > 1 ? `<div class="supplier-indicator">Supplier ${index + 1} of ${supplierList.length}</div>` : ''}

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
          ${supplierList.length > 1 ? `
          <div class="info-row">
            <span class="label">Total Suppliers:</span>
            <span class="value">${supplierList.length} suppliers available for this item</span>
          </div>
          ` : ''}
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
          ${supplier.supplierContactPersonName ? `
          <div class="info-row">
            <span class="label">Contact Person:</span>
            <span class="value">${supplier.supplierContactPersonName}</span>
          </div>
          ` : ''}
          ${supplier.supplierContactPersonNumber ? `
          <div class="info-row">
            <span class="label">Contact Person Phone:</span>
            <span class="value">${supplier.supplierContactPersonNumber}</span>
          </div>
          ` : ''}
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
          
          ${supplierList.length > 1 ? `
          <p><strong>Note:</strong> This request is being sent to ${supplierList.length} suppliers. Please respond promptly with your best offer including pricing and delivery terms.</p>
          ` : ''}
          
          <p>Please confirm the availability and provide us with:</p>
          <ul>
            <li>Unit price and total cost</li>
            <li>Expected delivery date</li>
            <li>Payment terms</li>
            <li>Any minimum order requirements</li>
            ${supplierList.length > 1 ? '<li>Competitive pricing information</li>' : ''}
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
          • This form serves as an official purchase request from Avami Pharmacy Anonas<br>
          ${supplierList.length > 1 ? '• Multiple suppliers may be contacted for competitive pricing<br>' : ''}
          • Response required within 24-48 hours for urgent orders</p>
        </div>
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reorder Form${supplierList.length > 1 ? 's' : ''}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 15px;
          line-height: 1.4;
          color: #333;
          font-size: 13px;
        }
        
        .supplier-form {
          width: 100%;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0;
          page-break-after: always;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .supplier-form:last-child {
          page-break-after: avoid;
        }
        
        .letterhead {
          text-align: center;
          border-bottom: 2px solid #2d5aa0;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        
        .pharmacy-name {
          font-size: 22px;
          font-weight: bold;
          color: #2d5aa0;
          margin-bottom: 4px;
        }
        
        .pharmacy-address {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .form-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 15px 0 10px 0;
          color: #2d5aa0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .supplier-indicator {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          color: #666;
          margin-bottom: 15px;
          padding: 6px 12px;
          background-color: #f0f4f8;
          border-radius: 4px;
        }
        
        .form-section {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f8f9fa;
          border-left: 3px solid #2d5aa0;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-weight: bold;
          font-size: 14px;
          color: #2d5aa0;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          padding: 3px 0;
          align-items: flex-start;
        }
        
        .label {
          font-weight: bold;
          color: #555;
          min-width: 140px;
          flex-shrink: 0;
        }
        
        .value {
          color: #333;
          flex: 1;
          text-align: left;
          padding-left: 15px;
          word-wrap: break-word;
        }
        
        .product-details {
          background-color: #fff3cd;
          border: 2px solid #ffc107;
          padding: 10px;
          margin: 12px 0;
          border-radius: 4px;
          page-break-inside: avoid;
        }
        
        .urgent-notice {
          background-color: #f8d7da;
          border: 2px solid #dc3545;
          padding: 10px;
          margin: 12px 0;
          border-radius: 4px;
          text-align: center;
          page-break-inside: avoid;
        }
        
        .urgent-text {
          color: #721c24;
          font-weight: bold;
          font-size: 14px;
        }
        
        .form-section p {
          margin: 6px 0;
        }
        
        .form-section ul {
          margin: 6px 0;
          padding-left: 20px;
        }
        
        .form-section li {
          margin-bottom: 3px;
        }
        
        .signature-section {
          margin-top: 25px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        
        .signature-box {
          width: 180px;
          text-align: center;
        }
        
        .signature-line {
          border-top: 2px solid #333;
          margin-bottom: 4px;
          height: 30px;
        }
        
        .signature-box div {
          font-size: 12px;
          margin-bottom: 2px;
        }
        
        .terms {
          margin-top: 20px;
          padding: 10px;
          background-color: #e9ecef;
          border-radius: 4px;
          font-size: 11px;
          color: #6c757d;
          page-break-inside: avoid;
        }
        
        .terms-title {
          font-weight: bold;
          margin-bottom: 6px;
          color: #495057;
        }
        
        .terms p {
          margin: 0;
          line-height: 1.3;
        }
        
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          body { 
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          
          .no-print { 
            display: none !important;
          }
          
          .supplier-form {
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: none;
            min-height: 0;
          }
          
          .supplier-form:last-child {
            page-break-after: avoid;
          }
          
          .form-section,
          .product-details,
          .urgent-notice,
          .signature-section,
          .terms {
            page-break-inside: avoid;
          }
          
          .letterhead {
            margin-bottom: 12px;
          }
          
          .pharmacy-name {
            font-size: 20px;
          }
          
          .form-title {
            font-size: 16px;
            margin: 12px 0 8px 0;
          }
          
          .section-title {
            font-size: 13px;
          }
          
          .signature-section {
            margin-top: 20px;
          }
          
          .signature-line {
            height: 25px;
          }
        }
        
        @media screen {
          .supplier-form {
            border: 1px solid #ddd;
            margin-bottom: 30px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        }
      </style>
    </head>
    <body>
      ${supplierForms}
      
      ${supplierList.length > 1 ? `
      <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: #2d5aa0; color: white; padding: 10px; border-radius: 5px; font-size: 14px; font-weight: bold; z-index: 1000;">
        📄 ${supplierList.length} Supplier Forms Generated<br>
        Use print dialog to select specific pages
      </div>
      ` : ''}
    </body>
    </html>
  `
}

export const printReorderForm = (
  item: Product,
  suppliers: Supplier[],
  showToast: (message: string, type?: string) => void
): void => {
  try {
    // Handle both single supplier and multiple suppliers
    const supplierList = Array.isArray(suppliers) ? suppliers : [suppliers]

    if (supplierList.length === 0) {
      showToast("No suppliers found for this item", "error")
      return
    }

    const printContent = generateReorderFormHTML(item, supplierList)

    // Create new window and print
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      showToast("Failed to generate reorder form", "error")
      return
    }

    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }

    // Show success message
    const supplierCount = supplierList.length
    const message = supplierCount > 1
      ? `Reorder forms generated for ${supplierCount} suppliers and sent to printer`
      : "Reorder form generated and sent to printer"

    showToast(message, "success")
  } catch (error) {
    console.error("Error printing reorder form:", error)
    showToast("Failed to generate reorder form", "error")
  }
}
