import React from "react";
import { Link as RouterLink } from "react-router";
import { FiUser, FiBox } from "react-icons/fi";
import PageHeader from "./components/PageHeader";
import styles from "./styles/Registration.module.css";

function Registration() {
  return (
    <>
      <PageHeader title="Registration" />
      <div className={styles.container}>
        <div className={styles.grid}>
          <RouterLink to="/register" className={styles.featureCard}>
            <FiUser className={styles.featureIcon} />
            <p className={styles.featureLabel}>User</p>
          </RouterLink>
          <RouterLink to="/entry" className={styles.featureCard}>
            <FiBox className={styles.featureIcon} />
            <p className={styles.featureLabel}>Product</p>
          </RouterLink>
        </div>
      </div>
    </>
  );
}

export default Registration;
