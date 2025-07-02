import React, { useState } from "react";
import { FiUser, FiBox, FiTruck } from "react-icons/fi";
import PageHeader from "./components/PageHeader";
// import styles from "./styles/Registration.module.css";
import styles from "./styles/Maintenance.module.css";
// You'll need to create these form components
import RegisterUserForm from "./RegisterUserForm";
import RegisterProductForm from "./RegisterProductForm";
import RegisterSupplierForm from "./RegisterSupplierForm";

function Registration() {
  const [showRegisterUser, setShowRegisterUser] = useState(false);
  const [showRegisterProduct, setShowRegisterProduct] = useState(false);
  const [showRegisterSupplier, setShowRegisterSupplier] = useState(false);

  return (
    <>
      <PageHeader title="Registration" />
      <div className={styles.container}>
        <div className={styles.grid}>
          <div
            className={styles.featureCard}
            style={{ cursor: "pointer" }}
            onClick={() => setShowRegisterUser(true)}
          >
            <FiUser className={styles.featureIcon} />
            <p className={styles.featureLabel}>User</p>
          </div>
          <div
            className={styles.featureCard}
            style={{ cursor: "pointer" }}
            onClick={() => setShowRegisterProduct(true)}
          >
            <FiBox className={styles.featureIcon} />
            <p className={styles.featureLabel}>Product</p>
          </div>
          <div
            className={styles.featureCard}
            style={{ cursor: "pointer" }}
            onClick={() => setShowRegisterSupplier(true)}
          >
            <FiTruck className={styles.featureIcon} />
            <p className={styles.featureLabel}>Supplier</p>
          </div>
        </div>

        {/* Register User Modal */}
        {showRegisterUser && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowRegisterUser(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                minWidth: 350,
                maxWidth: "95vw",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <RegisterUserForm onClose={() => setShowRegisterUser(false)} />
            </div>
          </div>
        )}

        {/* Register Product Modal */}
        {showRegisterProduct && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowRegisterProduct(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                minWidth: 350,
                maxWidth: "95vw",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <RegisterProductForm onClose={() => setShowRegisterProduct(false)} />
            </div>
          </div>
        )}

        {/* Register Supplier Modal */}
        {showRegisterSupplier && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowRegisterSupplier(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                minWidth: 350,
                maxWidth: "95vw",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <RegisterSupplierForm onClose={() => setShowRegisterSupplier(false)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Registration;
