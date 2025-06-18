import { useState, useEffect } from "react";
import PageHeader from "./components/PageHeader";
import adrianDev from "./assets/adrian_dev.png";
import lantingDev from "./assets/lanting_dev.jpg";
import aidanDev from "./assets/aidan_dev.png";
import styles from "./styles/Help.module.css";

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
  const [helpData, setHelpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5555/help');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setHelpData(data.data);
        } else {
          throw new Error(data.message || 'API returned success: false');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <PageHeader title="Help" />
      <div className={styles.container}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>

        {loading && (
          <div className={styles.loadingMessage}>Loading FAQ...</div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            Error loading FAQ: {error}
          </div>
        )}

        {!loading && !error && helpData.length === 0 && (
          <div className={styles.noDataMessage}>
            No FAQ items available at the moment.
          </div>
        )}

        {!loading && !error && helpData.map((item) => (
          <FAQItem
            key={item._id}
            question={item.helpQuestion}
            answer={item.helpAnswer}
          />
        ))}
      </div>

      <div style={{
        textAlign: "center",
        fontWeight: 700,
        fontSize: "1.3rem",
        letterSpacing: "0.05em",
        margin: "32px 0 16px 0",
        color: "#3182ce"
      }}>
        Developers
      </div>
      <div className={styles.cardsContainer}>
        <FlipCard
          frontImage={adrianDev}
          frontText={
            <div>
              <div className={styles.devName}>Adrian D. Macabutas</div>
              <div className={styles.devRole}>Lead Frontend Developer</div>
            </div>
          }
          backText={
            <div className={styles.devContact}>
              <div className={styles.contactTitle}>Contact</div>
              <div><span className={styles.contactLabel}>Email:</span> qamacabutas01@ tip.edu.ph</div>
              <div><span className={styles.contactLabel}>Phone Number:</span> 0919-398-1893</div>
            </div>
          }
        />
        <FlipCard
          frontImage={aidanDev}
          frontText={
            <div>
              <div className={styles.devName}>Aidan Carl S. Alcayde</div>
              <div className={styles.devRole}>Lead Backend Developer</div>
            </div>
          }
          backText={
            <div className={styles.devContact}>
              <div className={styles.contactTitle}>Contact</div>
              <div><span className={styles.contactLabel}>Email:</span> qacsalcayde@tip.edu.ph</div>
              <div><span className={styles.contactLabel}>Phone Number:</span> 0917-234-5678</div>
            </div>
          }
        />
        <FlipCard
          frontImage={lantingDev}
          frontText={
            <div>
              <div className={styles.devName}>John Andrei S. Lanting</div>
              <div className={styles.devRole}>UI/UX Designer</div>
            </div>
          }
          backText={
            <div className={styles.devContact}>
              <div className={styles.contactTitle}>Contact</div>
              <div><span className={styles.contactLabelAlt}>Email:</span> qjaslanting@tip.edu.ph</div>
              <div><span className={styles.contactLabel}>Phone Number:</span> 0917-345-6789</div>
            </div>
          }
        />
      </div>
    </>
  );
}

export default Help;
