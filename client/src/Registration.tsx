import { useState } from "react";
import { FiUser, FiBox, FiTruck } from "react-icons/fi";
import PageHeader from "./components/PageHeader";
import ModalOverlay from "./components/ModalOverlay";
import styles from "./styles/Maintenance.module.css";
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

        {showRegisterUser && (
          <ModalOverlay onClose={() => setShowRegisterUser(false)}>
            <RegisterUserForm onClose={() => setShowRegisterUser(false)} />
          </ModalOverlay>
        )}

        {showRegisterProduct && (
          <ModalOverlay onClose={() => setShowRegisterProduct(false)}>
            <RegisterProductForm onClose={() => setShowRegisterProduct(false)} />
          </ModalOverlay>
        )}

        {showRegisterSupplier && (
          <ModalOverlay onClose={() => setShowRegisterSupplier(false)}>
            <RegisterSupplierForm onClose={() => setShowRegisterSupplier(false)} />
          </ModalOverlay>
        )}
      </div>
    </>
  );
}

export default Registration;
