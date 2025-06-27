import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  FiBox,
  FiShoppingCart,
  FiClock,
  FiTool,
  FiBarChart2,
  FiHelpCircle,
  FiBell,
  FiUserPlus,
  FiTrendingUp,
  FiDollarSign,
  FiAlertTriangle,
  FiUsers,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import DashboardHeader from './components/DashboardHeader';
import styles from './styles/Home.module.css';

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    products: [],
    transactions: [],
    users: [],
    notifications: [],
    loading: true
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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

        setDashboardData({
          products: productsData.data || [],
          transactions: transactionsData.data || [],
          users: usersData.data || [],
          notifications: notificationsData.data || [],
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate key metrics
  const getKeyMetrics = () => {
    const { products, transactions, users, notifications } = dashboardData;

    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Today's transactions
    const todayTransactions = transactions.filter(t => {
      const tDate = new Date(t.createdAt);
      return tDate.toDateString() === today.toDateString();
    });

    // Yesterday's transactions for comparison
    const yesterdayTransactions = transactions.filter(t => {
      const tDate = new Date(t.createdAt);
      return tDate.toDateString() === yesterday.toDateString();
    });

    // Recent transactions (last 7 days)
    const recentTransactions = transactions.filter(t => new Date(t.createdAt) >= last7Days);

    // Sales calculations
    const todaySales = todayTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
    const yesterdaySales = yesterdayTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
    const totalSales = transactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);

    // Inventory alerts
    const lowStockItems = products.filter(p => (p.itemCount || 0) < 10 && (p.itemCount || 0) > 0);
    const outOfStockItems = products.filter(p => (p.itemCount || 0) === 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.itemPrice || 0) * (p.itemCount || 0)), 0);

    // Trends
    const salesTrend = todaySales > yesterdaySales ? 'up' : 'down';
    const salesChange = yesterdaySales !== 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100) : 0;

    // Weekly sales data for mini chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.createdAt);
        return tDate.toDateString() === date.toDateString();
      });
      const dayTotal = dayTransactions.reduce((sum, t) => sum + (t.transactionTotal || 0), 0);
      weeklyData.push({
        day: date.getDate(),
        sales: dayTotal
      });
    }

    return {
      todaySales,
      yesterdaySales,
      totalSales,
      todayTransactions: todayTransactions.length,
      totalTransactions: transactions.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalInventoryValue,
      totalEmployees: users.length,
      unreadNotifications: notifications.length,
      salesTrend,
      salesChange: Math.abs(salesChange),
      weeklyData,
      criticalAlerts: lowStockItems.length + outOfStockItems.length
    };
  };

  const features = [
    { label: 'Inventory', icon: FiBox, path: '/inventory' },
    { label: 'Transact', icon: FiShoppingCart, path: '/sales' },
    { label: 'Transaction History', icon: FiClock, path: '/transacthistory' },
    { label: 'Notifications', icon: FiBell, path: '/notifications' },
    { label: 'Reports', icon: FiBarChart2, path: '/reports' },
    { label: 'Maintenance', icon: FiTool, path: '/maintenance' },
    { label: 'Help', icon: FiHelpCircle, path: '/help' },
    { label: 'Registration', icon: FiUserPlus, path: '/registration' },
  ];

  if (dashboardData.loading) {
    return (
      <>
        <DashboardHeader />
        <div className={styles.container}>
          <div className={styles.loading}>Loading dashboard...</div>
        </div>
      </>
    );
  }

  const metrics = getKeyMetrics();

  return (
    <>
      <DashboardHeader />
      <div className={styles.container}>
        {/* Key Metrics Overview */}
        <div className={styles.metricsSection}>
          <h2 className={styles.sectionTitle}>Today's Overview</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FiDollarSign className={styles.metricIcon} />
                <div className={styles.metricTrend}>
                  {metrics.salesTrend === 'up' ? (
                    <FiArrowUp className={`${styles.trendIcon} ${styles.trendUp}`} />
                  ) : (
                    <FiArrowDown className={`${styles.trendIcon} ${styles.trendDown}`} />
                  )}
                  <span className={styles.trendText}>{metrics.salesChange.toFixed(1)}%</span>
                </div>
              </div>
              <div className={styles.metricValue}>₱{metrics.todaySales.toLocaleString()}</div>
              <div className={styles.metricLabel}>Today's Sales</div>
              <div className={styles.metricSubtext}>vs ₱{metrics.yesterdaySales.toLocaleString()} yesterday</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FiActivity className={styles.metricIcon} />
                <div className={styles.miniChart}>
                  <ResponsiveContainer width="100%" height={30}>
                    <LineChart data={metrics.weeklyData}>
                      <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={styles.metricValue}>{metrics.todayTransactions}</div>
              <div className={styles.metricLabel}>Today's Transactions</div>
              <div className={styles.metricSubtext}>7-day trend</div>
            </div>

            <div className={`${styles.metricCard} ${metrics.criticalAlerts > 0 ? styles.alertCard : ''}`}>
              <div className={styles.metricHeader}>
                <FiAlertTriangle className={styles.metricIcon} />
                {metrics.criticalAlerts > 0 && <div className={styles.alertBadge}>{metrics.criticalAlerts}</div>}
              </div>
              <div className={styles.metricValue}>{metrics.lowStockCount + metrics.outOfStockCount}</div>
              <div className={styles.metricLabel}>Inventory Alerts</div>
              <div className={styles.metricSubtext}>
                {metrics.outOfStockCount} out of stock, {metrics.lowStockCount} low stock
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FiBox className={styles.metricIcon} />
              </div>
              <div className={styles.metricValue}>₱{metrics.totalInventoryValue.toLocaleString()}</div>
              <div className={styles.metricLabel}>Inventory Value</div>
              <div className={styles.metricSubtext}>{dashboardData.products.length} total items</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            {features.map((feature) => {
              const IconComponent = feature.icon;
              const hasAlert = feature.label === 'Notifications' && metrics.unreadNotifications > 0;
              const hasInventoryAlert = feature.label === 'Inventory' && metrics.criticalAlerts > 0;

              return (
                <RouterLink
                  key={feature.label}
                  to={feature.path}
                  className={`${styles.actionCard} ${(hasAlert || hasInventoryAlert) ? styles.hasAlert : ''}`}
                >
                  <div className={styles.actionIcon}>
                    <IconComponent />
                    {hasAlert && <span className={styles.notificationBadge}>{metrics.unreadNotifications}</span>}
                    {hasInventoryAlert && <span className={styles.alertBadge}>{metrics.criticalAlerts}</span>}
                  </div>
                  <span className={styles.actionLabel}>{feature.label}</span>
                </RouterLink>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Insights */}
        <div className={styles.insightsSection}>
          <div className={styles.insightCard}>
            <h3 className={styles.insightTitle}>
              <FiTrendingUp className={styles.insightIcon} />
              Business Insights
            </h3>
            <div className={styles.insightContent}>
              <div className={styles.insightItem}>
                <strong>Total Revenue:</strong> ₱{metrics.totalSales.toLocaleString()}
              </div>
              <div className={styles.insightItem}>
                <strong>Average Transaction:</strong> ₱{metrics.totalTransactions > 0 ? (metrics.totalSales / metrics.totalTransactions).toFixed(2) : '0.00'}
              </div>
              <div className={styles.insightItem}>
                <strong>Active Employees:</strong> {metrics.totalEmployees}
              </div>
            </div>
          </div>

          {metrics.criticalAlerts > 0 && (
            <div className={`${styles.insightCard} ${styles.alertInsight}`}>
              <h3 className={styles.insightTitle}>
                <FiAlertTriangle className={styles.insightIcon} />
                Attention Required
              </h3>
              <div className={styles.insightContent}>
                {metrics.outOfStockCount > 0 && (
                  <div className={styles.alertItem}>
                    <strong>{metrics.outOfStockCount}</strong> items are out of stock
                  </div>
                )}
                {metrics.lowStockCount > 0 && (
                  <div className={styles.alertItem}>
                    <strong>{metrics.lowStockCount}</strong> items are running low
                  </div>
                )}
                <RouterLink to="/inventory" className={styles.alertAction}>
                  Manage Inventory →
                </RouterLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
