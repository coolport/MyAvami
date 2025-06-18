
import React from 'react';
import { Link as RouterLink } from 'react-router';
import {
  FiShoppingCart,
  FiClock,
  FiBell,
} from 'react-icons/fi';
import DashboardHeader from './components/DashboardHeader';
import styles from './styles/Home.module.css';

const features = [
  { label: 'Transact', icon: FiShoppingCart, path: '/sales' },
  { label: 'Transaction History', icon: FiClock, path: '/transacthistory' },
  { label: 'Notifications', icon: FiBell, path: '/notifications' },
  { label: 'Help', icon: FiBell, path: '/help' },
];

const HomepageEmployee = () => {
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

export default HomepageEmployee;
