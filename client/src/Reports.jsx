import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import styles from "./styles/Reports.module.css";
import PageHeader from './components/PageHeader';
import { exportToPDF } from './services/pdfExportTemplates';

const Reports = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Quick date range presets
  const datePresets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Year', days: 365 }
  ];

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [productsRes, transactionsRes, usersRes, notificationsRes] = await Promise.all([
          fetch('http://localhost:5555/products'),
          fetch('http://localhost:5555/transactions'),
          fetch('http://localhost:5555/users'),
          fetch('http://localhost:5555/notifications')
        ]);

        const [productsData, transactionsData, usersData, notificationsData] = await Promise.all([
          productsRes.json(),
          transactionsRes.json(),
          usersRes.json(),
          notificationsRes.json()
        ]);

        setProducts(productsData.data || []);
        setTransactions(transactionsData.data || []);
        setUsers(usersData.data || []);
        setNotifications(notificationsData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter transactions by date range
  const getFilteredTransactions = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle preset date range selection
  const handlePresetSelect = (days) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  // Sales Analytics with date filtering
  const getSalesAnalytics = () => {
    const filteredTransactions = getFilteredTransactions();
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    const totalSales = filteredTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
    const totalTransactions = filteredTransactions.length;
    const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Generate daily sales data for the selected range
    const dailySales = [];
    const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // If range is too large, group by weeks or months
    const groupBy = dayDiff > 90 ? 'month' : dayDiff > 30 ? 'week' : 'day';

    if (groupBy === 'day') {
      for (let i = 0; i <= dayDiff; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dayTransactions = filteredTransactions.filter(t => {
          const tDate = new Date(t.createdAt);
          return tDate.toDateString() === date.toDateString();
        });
        const dayTotal = dayTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
        dailySales.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: dayTotal,
          transactions: dayTransactions.length
        });
      }
    } else if (groupBy === 'week') {
      const weeks = Math.ceil(dayDiff / 7);
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(Math.min(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000, endDate.getTime()));

        const weekTransactions = filteredTransactions.filter(t => {
          const tDate = new Date(t.createdAt);
          return tDate >= weekStart && tDate <= weekEnd;
        });
        const weekTotal = weekTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
        dailySales.push({
          date: `Week ${i + 1}`,
          sales: weekTotal,
          transactions: weekTransactions.length
        });
      }
    } else {
      // Group by month
      const months = {};
      filteredTransactions.forEach(t => {
        const date = new Date(t.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (!months[monthKey]) {
          months[monthKey] = { date: monthLabel, sales: 0, transactions: 0 };
        }
        months[monthKey].sales += t.transactionTotal || 0;
        months[monthKey].transactions += 1;
      });
      dailySales.push(...Object.values(months));
    }

    return {
      totalSales,
      totalTransactions,
      avgTransactionValue,
      dailySales,
      dateRange: {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString()
      }
    };
  };

  // Inventory Analytics (unchanged as it's not date-dependent for current metrics)
  const getInventoryAnalytics = () => {
    const lowStockItems = products.filter(p => (p.itemCount || 0) < 10);
    const outOfStockItems = products.filter(p => (p.itemCount || 0) === 0);

    const today = new Date();
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringItems = products.filter(p => {
      if (!p.itemExpiration) return false;
      const expDate = new Date(p.itemExpiration);
      return expDate <= next7Days && expDate >= today;
    });

    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.itemPrice || 0) * (p.itemCount || 0)), 0);
    const totalItems = products.reduce((sum, p) => sum + (p.itemCount || 0), 0);

    // Category distribution
    const categoryDistribution = products.reduce((acc, p) => {
      const category = p.itemCategory || 'Unknown';
      if (!acc[category]) {
        acc[category] = { category, count: 0, value: 0 };
      }
      acc[category].count += p.itemCount || 0;
      acc[category].value += (p.itemPrice || 0) * (p.itemCount || 0);
      return acc;
    }, {});

    return {
      lowStockItems,
      outOfStockItems,
      expiringItems,
      totalInventoryValue,
      totalItems,
      categoryData: Object.values(categoryDistribution)
    };
  };

  // Employee Analytics with date filtering
  const getEmployeeAnalytics = () => {
    const filteredTransactions = getFilteredTransactions();

    const employeePerformance = users.reduce((acc, user) => {
      const userTransactions = filteredTransactions.filter(t => t.transactionEmployee === user.userUsername);
      const userSales = userTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);

      acc.push({
        name: user.userFullName || user.userUsername,
        username: user.userUsername,
        role: user.userRole,
        transactions: userTransactions.length,
        sales: userSales,
        avgSale: userTransactions.length > 0 ? userSales / userTransactions.length : 0
      });
      return acc;
    }, []);

    return {
      employeePerformance: employeePerformance.sort((a, b) => b.sales - a.sales),
      totalEmployees: users.length,
      adminCount: users.filter(u => u.userRole === 'admin').length,
      employeeCount: users.filter(u => u.userRole === 'employee').length,
      dateRange: {
        start: new Date(dateRange.startDate).toLocaleDateString(),
        end: new Date(dateRange.endDate).toLocaleDateString()
      }
    };
  };

  // Export Functions with date range
  const handleExport = async () => {
    try {
      const exportData = {
        dateRange: {
          start: dateRange.startDate,
          end: dateRange.endDate,
          startFormatted: new Date(dateRange.startDate).toLocaleDateString(),
          endFormatted: new Date(dateRange.endDate).toLocaleDateString()
        }
      };

      if (activeTab === 'sales') {
        const salesData = getSalesAnalytics();
        await exportToPDF('sales', { ...salesData, ...exportData }, {
          transactions: getFilteredTransactions()
        });
      } else if (activeTab === 'inventory') {
        const inventoryData = getInventoryAnalytics();
        await exportToPDF('inventory', { ...inventoryData, ...exportData }, {
          products
        });
      } else if (activeTab === 'employee') {
        const employeeData = getEmployeeAnalytics();
        await exportToPDF('employee', { ...employeeData, ...exportData }, {
          notifications,
          users,
          transactions: getFilteredTransactions()
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting report. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading reports...</div>;
  }

  const salesData = getSalesAnalytics();
  const inventoryData = getInventoryAnalytics();
  const employeeData = getEmployeeAnalytics();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <>
      <PageHeader title={"Reports"} />
      <div className={styles.reportsContainer}>
        <div className={styles.reportsHeader}>
          <h1>Business Reports Dashboard</h1>
          <div className={styles.headerControls}>
            <div className={styles.tabNavigation}>
              <button
                className={activeTab === 'sales' ? `${styles.tab} ${styles.active}` : styles.tab}
                onClick={() => setActiveTab('sales')}
              >
                Sales Reports
              </button>
              <button
                className={activeTab === 'inventory' ? `${styles.tab} ${styles.active}` : styles.tab}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory Reports
              </button>
              <button
                className={activeTab === 'employee' ? `${styles.tab} ${styles.active}` : styles.tab}
                onClick={() => setActiveTab('employee')}
              >
                Employee Reports
              </button>
            </div>
            <button className={styles.exportButton} onClick={handleExport}>
              Export PDF Report
            </button>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className={styles.dateControls}>
          <div className={styles.dateInputs}>
            <div className={styles.dateInput}>
              <label>From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                max={dateRange.endDate}
              />
            </div>
            <div className={styles.dateInput}>
              <label>To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                min={dateRange.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className={styles.datePresets}>
            {datePresets.map((preset, index) => (
              <button
                key={index}
                className={styles.presetButton}
                onClick={() => handlePresetSelect(preset.days)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'sales' && (
          <div className={styles.tabContent}>
            <div className={styles.dateRangeInfo}>
              <p>Showing data from {salesData.dateRange.start} to {salesData.dateRange.end}</p>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Sales</h3>
                <p className={styles.statValue}>₱{salesData.totalSales.toLocaleString()}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Transactions</h3>
                <p className={styles.statValue}>{salesData.totalTransactions}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Avg Transaction</h3>
                <p className={styles.statValue}>₱{salesData.avgTransactionValue.toFixed(2)}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Daily Average</h3>
                <p className={styles.statValue}>
                  ₱{(salesData.totalSales / Math.max(1, Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)))).toFixed(2)}
                </p>
              </div>
            </div>

            <div className={styles.chartContainer} id="sales-chart">
              <h3>Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [name === 'sales' ? `₱${value}` : value, name]} />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales (₱)" />
                  <Bar dataKey="transactions" fill="#82ca9d" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className={styles.tabContent}>
            <div className={styles.dateRangeInfo}>
              <p>Current inventory status (not date-filtered)</p>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Inventory Value</h3>
                <p className={styles.statValue}>₱{inventoryData.totalInventoryValue.toLocaleString()}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Items</h3>
                <p className={styles.statValue}>{inventoryData.totalItems}</p>
              </div>
              <div className={`${styles.statCard} ${styles.alert}`}>
                <h3>Low Stock Items</h3>
                <p className={styles.statValue}>{inventoryData.lowStockItems.length}</p>
              </div>
              <div className={`${styles.statCard} ${styles.danger}`}>
                <h3>Out of Stock</h3>
                <p className={styles.statValue}>{inventoryData.outOfStockItems.length}</p>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <div className={`${styles.chartContainer} ${styles.half}`} id="inventory-chart">
                <h3>Inventory by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) => `${category}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {inventoryData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={`${styles.alertsContainer} ${styles.half}`}>
                <h3>Inventory Alerts</h3>

                {inventoryData.expiringItems.length > 0 && (
                  <div className={styles.alertSection}>
                    <h4>Expiring Soon (7 days)</h4>
                    <ul>
                      {inventoryData.expiringItems.slice(0, 5).map(item => (
                        <li key={item._id}>
                          {item.itemName} - Expires: {new Date(item.itemExpiration).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {inventoryData.lowStockItems.length > 0 && (
                  <div className={styles.alertSection}>
                    <h4>Low Stock Items (&lt;10)</h4>
                    <ul>
                      {inventoryData.lowStockItems.slice(0, 5).map(item => (
                        <li key={item._id}>
                          {item.itemName} - Stock: {item.itemCount}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {inventoryData.outOfStockItems.length > 0 && (
                  <div className={`${styles.alertSection} ${styles.danger}`}>
                    <h4>Out of Stock</h4>
                    <ul>
                      {inventoryData.outOfStockItems.slice(0, 5).map(item => (
                        <li key={item._id}>{item.itemName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employee' && (
          <div className={styles.tabContent}>
            <div className={styles.dateRangeInfo}>
              <p>Showing performance data from {employeeData.dateRange.start} to {employeeData.dateRange.end}</p>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Employees</h3>
                <p className={styles.statValue}>{employeeData.totalEmployees}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Admins</h3>
                <p className={styles.statValue}>{employeeData.adminCount}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Employees</h3>
                <p className={styles.statValue}>{employeeData.employeeCount}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Active Sellers</h3>
                <p className={styles.statValue}>
                  {employeeData.employeePerformance.filter(emp => emp.transactions > 0).length}
                </p>
              </div>
            </div>

            <div className={styles.chartContainer} id="employee-chart">
              <h3>Employee Sales Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeData.employeePerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [name === 'sales' ? `₱${value}` : value, name]} />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales (₱)" />
                  <Bar dataKey="transactions" fill="#82ca9d" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.employeeTable}>
              <h3>Employee Performance Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Transactions</th>
                    <th>Total Sales</th>
                    <th>Avg Sale</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeData.employeePerformance.map(emp => (
                    <tr key={emp.username}>
                      <td>{emp.name}</td>
                      <td>{emp.role}</td>
                      <td>{emp.transactions}</td>
                      <td>₱{emp.sales.toLocaleString()}</td>
                      <td>₱{emp.avgSale.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;
