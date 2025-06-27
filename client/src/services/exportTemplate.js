export const generateSalesReport = (salesData) => {
  const reportDate = new Date().toLocaleDateString();

  return `
SALES REPORT
Generated on: ${reportDate}
===========================================

SUMMARY STATISTICS
- Total Sales: ₱${salesData.totalSales.toLocaleString()}
- Last 7 Days Sales: ₱${salesData.recentSales.toLocaleString()}
- Total Transactions: ${salesData.totalTransactions}
- Average Transaction Value: ₱${salesData.avgTransactionValue.toFixed(2)}

DAILY SALES BREAKDOWN (Last 7 Days)
${salesData.dailySales.map(day =>
    `${day.date}: ₱${day.sales.toLocaleString()} (${day.transactions} transactions)`
  ).join('\n')}

===========================================
End of Sales Report
  `.trim();
};

export const generateInventoryReport = (inventoryData) => {
  const reportDate = new Date().toLocaleDateString();

  return `
INVENTORY REPORT
Generated on: ${reportDate}
===========================================

SUMMARY STATISTICS
- Total Inventory Value: ₱${inventoryData.totalInventoryValue.toLocaleString()}
- Total Items: ${inventoryData.totalItems}
- Low Stock Items: ${inventoryData.lowStockItems.length}
- Out of Stock Items: ${inventoryData.outOfStockItems.length}

CATEGORY DISTRIBUTION
${inventoryData.categoryData.map(cat =>
    `${cat.category}: ${cat.count} items (₱${cat.value.toLocaleString()})`
  ).join('\n')}

INVENTORY ALERTS
${inventoryData.expiringItems.length > 0 ? `
Expiring Soon (within 7 days):
${inventoryData.expiringItems.slice(0, 10).map(item =>
    `- ${item.itemName} (Expires: ${new Date(item.itemExpiration).toLocaleDateString()})`
  ).join('\n')}` : 'No items expiring soon.'}

${inventoryData.lowStockItems.length > 0 ? `
Low Stock Items (<10):
${inventoryData.lowStockItems.slice(0, 10).map(item =>
    `- ${item.itemName} (Stock: ${item.itemCount})`
  ).join('\n')}` : 'No low stock items.'}

${inventoryData.outOfStockItems.length > 0 ? `
Out of Stock Items:
${inventoryData.outOfStockItems.slice(0, 10).map(item =>
    `- ${item.itemName}`
  ).join('\n')}` : 'No out of stock items.'}

===========================================
End of Inventory Report
  `.trim();
};

export const generateEmployeeReport = (employeeData, notifications) => {
  const reportDate = new Date().toLocaleDateString();

  return `
EMPLOYEE REPORT
Generated on: ${reportDate}
===========================================

SUMMARY STATISTICS
- Total Employees: ${employeeData.totalEmployees}
- Administrators: ${employeeData.adminCount}
- Regular Employees: ${employeeData.employeeCount}
- Recent Notifications: ${notifications.length}

EMPLOYEE PERFORMANCE
${'Name'.padEnd(25)} ${'Role'.padEnd(12)} ${'Transactions'.padEnd(15)} ${'Total Sales'.padEnd(15)} ${'Avg Sale'.padEnd(12)}
${'-'.repeat(80)}
${employeeData.employeePerformance.map(emp =>
    `${emp.name.padEnd(25)} ${emp.role.padEnd(12)} ${emp.transactions.toString().padEnd(15)} ₱${emp.sales.toLocaleString().padEnd(14)} ₱${emp.avgSale.toFixed(2).padEnd(11)}`
  ).join('\n')}

===========================================
End of Employee Report
  `.trim();
};

export const exportToFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
