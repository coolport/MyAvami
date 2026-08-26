import { useState } from "react";
import styles from "./styles/Maintenance.module.css";
import PageHeader from "./components/PageHeader";
import ModalOverlay from "./components/ModalOverlay";
import { FiUsers, FiHelpCircle, FiTruck } from "react-icons/fi";
import EditUserForm from "./EditUserForm";
import FaqForm from "./FaqForm";
import EditSupplierForm from "./EditSupplierForm";

function Maintenance() {
  const [showEditUser, setShowEditUser] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [showEditSupplier, setShowEditSupplier] = useState(false);

  return (
    <>
      <PageHeader title="Maintenance" />
      <div className={styles.container}>
        <div className={styles.grid}>
          <div
            className={styles.featureCard}
            style={{ cursor: "pointer" }}
            onClick={() => setShowEditUser(true)}
          >
            <FiUsers className={styles.featureIcon} />
            <p className={styles.featureLabel}>Employee</p>
          </div>
          <div
            className={styles.featureCard}
            style={{ cursor: "pointer" }}
            onClick={() => setShowFaqForm(true)}
          >
            <FiHelpCircle className={styles.featureIcon} />
            <p className={styles.featureLabel}>FAQs</p>
          </div>
          <div
            className={styles.featureCard}
            style={{ cursor: "pointer" }}
            onClick={() => setShowEditSupplier(true)}
          >
            <FiTruck className={styles.featureIcon} />
            <p className={styles.featureLabel}>Suppliers</p>
          </div>
        </div>

        {showEditUser && (
          <ModalOverlay onClose={() => setShowEditUser(false)}>
            <EditUserForm />
          </ModalOverlay>
        )}

        {showFaqForm && (
          <ModalOverlay
            onClose={() => setShowFaqForm(false)}
            contentStyle={{
              padding: 32,
              boxShadow: "0 8px 32px rgba(49,130,206,0.18)",
              border: "2px solid #3182ce",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            <FaqForm onClose={() => setShowFaqForm(false)} />
          </ModalOverlay>
        )}

        {showEditSupplier && (
          <ModalOverlay onClose={() => setShowEditSupplier(false)}>
            <EditSupplierForm />
          </ModalOverlay>
        )}
      </div>
    </>
  );
}

export default Maintenance;
