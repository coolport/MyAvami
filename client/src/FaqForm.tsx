import { useEffect, useState } from "react";
import styles from "./styles/FaqForm.module.css";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "./services/helpService";
import type { Faq } from "./types";

function FaqForm({ onClose }: { onClose: () => void }) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    setLoading(true);
    setError(null);
    try {
      setFaqs(await getFaqs());
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateFaq(editing._id, {
          helpQuestion: form.question,
          helpAnswer: form.answer,
        });
      } else {
        await createFaq({
          helpQuestion: form.question,
          helpAnswer: form.answer,
        });
      }
      setForm({ question: "", answer: "" });
      setEditing(null);
      fetchFaqs();
    } catch (e) {
      setError((e as Error).message || "Failed to save FAQ");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this FAQ?")) return;
    setError(null);
    try {
      await deleteFaq(id);
      fetchFaqs();
    } catch (e) {
      setError((e as Error).message || "Failed to delete FAQ");
    }
  }

  function startEdit(faq: Faq) {
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
