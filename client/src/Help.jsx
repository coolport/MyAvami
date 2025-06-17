import { useState } from "react";
import PageHeader from "./components/PageHeader";
import styles from "./styles/Help.module.css";
import adrianDev from "./assets/adrian_dev.png";
import lantingDev from "./assets/lanting_dev.jpg";
import aidanDev from "./assets/aidan_dev.png";

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.faqItem} ${open ? styles.open : ""}`}>
      <button
        className={styles.faqQuestion}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {question}
      </button>
      {open && (
        <div className={styles.faqAnswer}>
          {answer}
        </div>
      )}
    </div>
  );
}

function FlipCard({ frontImage, frontText, backText }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`${styles.flipCard} ${flipped ? styles.flipped : ""}`}
      onClick={e => {
        e.preventDefault();
        setFlipped(f => !f);
      }}
      tabIndex={0}
      onKeyPress={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped(f => !f);
        }
      }}
      role="button"
      aria-pressed={flipped}
    >
      <div className={styles.flipCardInner}>
        <div className={styles.flipCardFront}>
          <img src={frontImage} alt="Card front" className={styles.flipCardImg} />
          <div className={styles.flipCardOverlay}>
            {frontText}
          </div>
        </div>
        <div className={styles.flipCardBack}>
          <span>{backText}</span>
        </div>
      </div>
    </div>
  );
}

function Help() {
  return (
    <>
      <PageHeader title="Help" />
      <div className={styles.container}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <FAQItem
          question="How do I add a new product to the inventory?"
          answer="Go to the Entry page, fill out the product details, and click Submit. The product will be added to your inventory."
        />
        <FAQItem
          question="How do I view notifications?"
          answer="Click on the Notifications button on the home page to see all recent notifications."
        />
        {/* copy paste lang then edit to add more FAQs
        <FAQItem
          question="edit the question here"
          answer="edit the answer here"
        />
        */}
      </div>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: "1.3rem", letterSpacing: "0.05em", margin: "32px 0 16px 0", color: "#3182ce" }}>
        DEVELOPERS
      </div>
      <div className={styles.cardsContainer}>
        <FlipCard
          frontImage={adrianDev}
          frontText={
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Adrian D. Macabutas</div>
              <div style={{ fontSize: "0.95rem" }}>Lead Frontend Developer</div>
            </div>
          }
          backText={
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact</div>
              <div><span style={{ fontWeight: 600 }}>Email:</span> qamacabutas01@ tip.edu.ph</div>
              <div><span style={{ fontWeight: 600 }}>Phone Number:</span> 0919-398-1893</div>
            </div>
          }
        />
        <FlipCard
          frontImage={aidanDev}
          frontText={
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Aidan Carl S. Alcayde</div>
              <div style={{ fontSize: "0.95rem" }}>Lead Backend Developer</div>
            </div>
          }
          backText={
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact</div>
              <div><span style={{ fontWeight: 600 }}>Email:</span> qacsalcayde@tip.edu.ph</div>
              <div><span style={{ fontWeight: 600 }}>Phone Number:</span> 0917-234-5678</div>
            </div>
          }
        />
        <FlipCard
          frontImage={lantingDev}
          frontText={
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>John Andrei S. Lanting</div>
              <div style={{ fontSize: "0.95rem" }}>UI/UX Designer</div>
            </div>
          }
          backText={
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact</div>
              <div><span style={{ fontWeight: 500 }}>Email:</span> qjaslanting@tip.edu.ph</div>
              <div><span style={{ fontWeight: 600 }}>Phone Number:</span> 0917-345-6789</div>
            </div>
          }
        />
      </div>
    </>
  );
}

export default Help;