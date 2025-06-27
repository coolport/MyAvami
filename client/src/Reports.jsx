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

  // Sales Analytics
  const getSalesAnalytics = () => {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentTransactions = transactions.filter(t => new Date(t.createdAt) >= last7Days);
    const monthlyTransactions = transactions.filter(t => new Date(t.createdAt) >= last30Days);

    const totalSales = transactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
    const recentSales = recentTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
    const monthlySales = monthlyTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);

    // Daily sales for the last 7 days
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayTransactions = transactions.filter(t => {
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

    return {
      totalSales,
      recentSales,
      monthlySales,
      dailySales,
      totalTransactions: transactions.length,
      recentTransactions: recentTransactions.length,
      avgTransactionValue: transactions.length > 0 ? totalSales / transactions.length : 0
    };
  };

  // Inventory Analytics
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

  // Employee Analytics
  const getEmployeeAnalytics = () => {
    const employeePerformance = users.reduce((acc, user) => {
      const userTransactions = transactions.filter(t => t.transactionEmployee === user.userUsername);
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
      employeeCount: users.filter(u => u.userRole === 'employee').length
    };
  };

  // Export Functions
  const handleExport = async () => {
    try {
      if (activeTab === 'sales') {
        const salesData = getSalesAnalytics();
        await exportToPDF('sales', salesData, { transactions });
      } else if (activeTab === 'inventory') {
        const inventoryData = getInventoryAnalytics();
        await exportToPDF('inventory', inventoryData, { products });
      } else if (activeTab === 'employee') {
        const employeeData = getEmployeeAnalytics();
        await exportToPDF('employee', employeeData, { notifications, users });
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
      <PageHeader />
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

        {activeTab === 'sales' && (
          <div className={styles.tabContent}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Sales</h3>
                <p className={styles.statValue}>₱{salesData.totalSales.toLocaleString()}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Last 7 Days</h3>
                <p className={styles.statValue}>₱{salesData.recentSales.toLocaleString()}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Transactions</h3>
                <p className={styles.statValue}>{salesData.totalTransactions}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Avg Transaction</h3>
                <p className={styles.statValue}>₱{salesData.avgTransactionValue.toFixed(2)}</p>
              </div>
            </div>

            <div className={styles.chartContainer} id="sales-chart">
              <h3>Daily Sales (Last 7 Days)</h3>
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
                <h3>Recent Notifications</h3>
                <p className={styles.statValue}>{notifications.length}</p>
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
