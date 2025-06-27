// pdfExportTemplates.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Utility function to add header to PDF
const addPDFHeader = (doc, title) => {
  const pageWidth = doc.internal.pageSize.width;
  const reportDate = new Date().toLocaleDateString();

  // Company/System name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Avami Pharmacy', pageWidth / 2, 20, { align: 'center' });

  // Report title
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 30, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${reportDate}`, pageWidth / 2, 40, { align: 'center' });

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 45, pageWidth - 20, 45);

  return 50; // Return Y position for next content
};

// Utility function to add chart to PDF
const addChartToPDF = async (doc, chartElementId, yPosition, title) => {
  const chartElement = document.getElementById(chartElementId);
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add title for chart
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, yPosition);

      // Add chart image
      doc.addImage(imgData, 'PNG', 20, yPosition + 5, imgWidth, imgHeight);

      return yPosition + imgHeight + 15;
    } catch (error) {
      console.error('Error capturing chart:', error);
      return yPosition;
    }
  }
  return yPosition;
};

// Sales Report PDF
export const generateSalesPDF = async (salesData, transactions) => {
  const doc = new jsPDF();
  let yPos = addPDFHeader(doc, 'SALES REPORT');

  // Summary Statistics Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, yPos);
  yPos += 10;

  const summaryData = [
    ['Total Sales', `₱${salesData.totalSales.toLocaleString()}`],
    ['Last 7 Days Sales', `₱${salesData.recentSales.toLocaleString()}`],
    ['Monthly Sales', `₱${salesData.monthlySales?.toLocaleString() || '0'}`],
    ['Total Transactions', salesData.totalTransactions.toString()],
    ['Average Transaction Value', `₱${salesData.avgTransactionValue.toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Daily Sales Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Sales Breakdown (Last 7 Days)', 20, yPos);
  yPos += 10;

  const dailySalesData = salesData.dailySales.map(day => [
    day.date,
    `₱${day.sales.toLocaleString()}`,
    day.transactions.toString()
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Sales Amount', 'Transactions']],
    body: dailySalesData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Recent Transactions Table (Top 10)
  if (transactions && transactions.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Transactions (Top 10)', 20, yPos);
    yPos += 10;

    const recentTransactions = transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.transactionEmployee || 'N/A',
        `₱${(t.transactionTotal || 0).toLocaleString()}`,
        t.transactionMethod || 'N/A'
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Employee', 'Amount', 'Method']],
      body: recentTransactions,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Add new page for charts if needed
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  // Try to add chart
  yPos = await addChartToPDF(doc, 'sales-chart', yPos, 'Daily Sales Chart');

  return doc;
};

// Inventory Report PDF
export const generateInventoryPDF = async (inventoryData, products) => {
  const doc = new jsPDF();
  let yPos = addPDFHeader(doc, 'INVENTORY REPORT');

  // Summary Statistics Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Summary', 20, yPos);
  yPos += 10;

  const summaryData = [
    ['Total Inventory Value', `₱${inventoryData.totalInventoryValue.toLocaleString()}`],
    ['Total Items in Stock', inventoryData.totalItems.toString()],
    ['Low Stock Items (<10)', inventoryData.lowStockItems.length.toString()],
    ['Out of Stock Items', inventoryData.outOfStockItems.length.toString()],
    ['Expiring Soon (7 days)', inventoryData.expiringItems.length.toString()]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [230, 126, 34] },
    styles: { fontSize: 10 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Category Distribution Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory by Category', 20, yPos);
  yPos += 10;

  const categoryData = inventoryData.categoryData.map(cat => [
    cat.category,
    cat.count.toString(),
    `₱${cat.value.toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Items Count', 'Total Value']],
    body: categoryData,
    theme: 'grid',
    headStyles: { fillColor: [230, 126, 34] },
    styles: { fontSize: 10 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Low Stock Items Table
  if (inventoryData.lowStockItems.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Low Stock Items (Stock < 10)', 20, yPos);
    yPos += 10;

    const lowStockData = inventoryData.lowStockItems.slice(0, 15).map(item => [
      item.itemName || 'N/A',
      item.itemCategory || 'N/A',
      item.itemCount?.toString() || '0',
      `₱${(item.itemPrice || 0).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Item Name', 'Category', 'Stock', 'Price']],
      body: lowStockData,
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60] },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Out of Stock Items Table
  if (inventoryData.outOfStockItems.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Out of Stock Items', 20, yPos);
    yPos += 10;

    const outOfStockData = inventoryData.outOfStockItems.slice(0, 15).map(item => [
      item.itemName || 'N/A',
      item.itemCategory || 'N/A',
      `₱${(item.itemPrice || 0).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Item Name', 'Category', 'Price']],
      body: outOfStockData,
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Expiring Items Table
  if (inventoryData.expiringItems.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Items Expiring Soon (Within 7 Days)', 20, yPos);
    yPos += 10;

    const expiringData = inventoryData.expiringItems.slice(0, 15).map(item => [
      item.itemName || 'N/A',
      item.itemCategory || 'N/A',
      item.itemCount?.toString() || '0',
      new Date(item.itemExpiration).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Item Name', 'Category', 'Stock', 'Expiry Date']],
      body: expiringData,
      theme: 'grid',
      headStyles: { fillColor: [241, 196, 15] },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Add chart if space available
  if (yPos < 200) {
    yPos = await addChartToPDF(doc, 'inventory-chart', yPos, 'Inventory Distribution Chart');
  }

  return doc;
};

// Employee Report PDF
export const generateEmployeePDF = async (employeeData, notifications, users) => {
  const doc = new jsPDF();
  let yPos = addPDFHeader(doc, 'EMPLOYEE REPORT');

  // Summary Statistics Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Summary', 20, yPos);
  yPos += 10;

  const summaryData = [
    ['Total Employees', employeeData.totalEmployees.toString()],
    ['Administrators', employeeData.adminCount.toString()],
    ['Regular Employees', employeeData.employeeCount.toString()],
    ['Recent Notifications', notifications.length.toString()]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [155, 89, 182] },
    styles: { fontSize: 10 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Employee Performance Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Sales Performance', 20, yPos);
  yPos += 10;

  const performanceData = employeeData.employeePerformance.map(emp => [
    emp.name,
    emp.role,
    emp.transactions.toString(),
    `₱${emp.sales.toLocaleString()}`,
    `₱${emp.avgSale.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Name', 'Role', 'Transactions', 'Total Sales', 'Avg Sale']],
    body: performanceData,
    theme: 'grid',
    headStyles: { fillColor: [155, 89, 182] },
    styles: { fontSize: 9 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Employee Details Table
  if (users && users.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Directory', 20, yPos);
    yPos += 10;

    const employeeDetails = users.map(user => [
      user.userFullName || user.userUsername,
      user.userUsername,
      user.userRole,
      user.userEmail || 'N/A',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Full Name', 'Username', 'Role', 'Email', 'Date Added']],
      body: employeeDetails,
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 8 }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Add chart if space available
  if (yPos < 200) {
    yPos = await addChartToPDF(doc, 'employee-chart', yPos, 'Employee Performance Chart');
  }

  return doc;
};

// Main export function
export const exportToPDF = async (reportType, data, additionalData = {}) => {
  let doc;
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  try {
    switch (reportType) {
      case 'sales':
        doc = await generateSalesPDF(data, additionalData.transactions);
        doc.save(`sales-report-${dateString}.pdf`);
        break;
      case 'inventory':
        doc = await generateInventoryPDF(data, additionalData.products);
        doc.save(`inventory-report-${dateString}.pdf`);
        break;
      case 'employee':
        doc = await generateEmployeePDF(data, additionalData.notifications, additionalData.users);
        doc.save(`employee-report-${dateString}.pdf`);
        break;
      default:
        console.error('Unknown report type');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF report. Please try again.');
  }
};
