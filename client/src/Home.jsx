import React from 'react';
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
} from 'react-icons/fi';
import DashboardHeader from './components/DashboardHeader';
import styles from './styles/Home.module.css';

const features = [
  { label: 'Inventory', icon: FiBox, path: '/inventory' },
  { label: 'Transact', icon: FiShoppingCart, path: '/sales' },
  { label: 'Transaction History', icon: FiClock, path: '/transacthistory' },
  { label: 'Notifications', icon: FiBell, path: '/notifications' },
  // { label: 'OldTransact', icon: FiShoppingCart, path: '/entry' },
  { label: 'Reports', icon: FiBarChart2, path: '/reports' },
  { label: 'Maintenance', icon: FiTool, path: '/maintenance' },
  { label: 'Help', icon: FiHelpCircle, path: '/help' },
  { label: 'Registration', icon: FiUserPlus, path: '/registration' },
];

const Homepage = () => {
  return (
    <>
      <DashboardHeader />
      <div className={styles.container}>
        <div className={styles.grid}>
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <RouterLink
                key={feature.label}
                to={feature.path}
                className={styles.featureCard}
              >
                <IconComponent className={styles.featureIcon} />
                <p className={styles.featureLabel}>{feature.label}</p>
              </RouterLink>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Homepage;
