import { useEffect, useState } from "react";
import styles from "./styles/FaqForm.module.css";

function FaqForm({ onClose }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5555/help");
      const data = await res.json();
      if (data.success) setFaqs(data.data);
      else setError(data.message || "Failed to fetch FAQs");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const url = editing
        ? `http://localhost:5555/help/${editing._id}`
        : "http://localhost:5555/help";
      const method = editing ? "PUT" : "POST";
      const body = JSON.stringify({
        helpQuestion: form.question,
        helpAnswer: form.answer,
      });
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save FAQ");
      setForm({ question: "", answer: "" });
      setEditing(null);
      fetchFaqs();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this FAQ?")) return;
    setError(null);
    try {
      const res = await fetch(`http://localhost:5555/help/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to delete FAQ");
      fetchFaqs();
    } catch (e) {
      setError(e.message);
    }
  }

  function startEdit(faq) {
    setEditing(faq);
    setForm({ question: faq.helpQuestion, answer: faq.helpAnswer });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ question: "", answer: "" });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 0,
          minWidth: 350,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.container}>
          <h2 className={styles.title}>Manage FAQs</h2>
          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Question:
                <input
                  type="text"
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  required
                  className={styles.input}
                  placeholder="Enter FAQ question"
                />
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Answer:
                <textarea
                  value={form.answer}
                  onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  required
                  className={styles.textarea}
                  placeholder="Enter FAQ answer"
                />
              </label>
            </div>
            <div className={styles.buttonRow}>
              <button type="submit" className={styles.button}>
                {editing ? "Update" : "Add"} FAQ
              </button>
              {editing && (
                <button type="button" onClick={cancelEdit} className={styles.button}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          <div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <ul className={styles.faqList}>
                {faqs.map(faq => (
                  <li key={faq._id} className={styles.faqItem}>
                    <div className={styles.faqQuestion}>{faq.helpQuestion}</div>
                    <div className={styles.faqAnswer}>{faq.helpAnswer}</div>
                    <div className={styles.faqActions}>
                      <button onClick={() => startEdit(faq)} className={styles.button}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(faq._id)} className={styles.button}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.buttonRow}>
            <button
              onClick={onClose}
              className={styles.button}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaqForm;