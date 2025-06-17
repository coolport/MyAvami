import { useState } from "react";
import styles from "./styles/Maintenance.module.css";
import PageHeader from "./components/PageHeader";
import { FiUsers, FiHelpCircle } from "react-icons/fi";
import EditUserForm from "./EditUserForm";
import FaqForm from "./FaqForm";

function Maintenance() {
  const [showEditUser, setShowEditUser] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);

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
        </div>
        {showEditUser && (
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
            onClick={() => setShowEditUser(false)}
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
              <EditUserForm />
            </div>
          </div>
        )}
        {showFaqForm && (
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
            onClick={() => setShowFaqForm(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 32,
                minWidth: 350,
                maxWidth: "95vw",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 8px 32px rgba(49,130,206,0.18)",
                border: "2px solid #3182ce",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <FaqForm onClose={() => setShowFaqForm(false)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Maintenance;