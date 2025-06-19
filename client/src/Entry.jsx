import React from "react";
import { useForm } from "react-hook-form";
import { Box, Button } from "@chakra-ui/react";
import { postNotifications } from "./services/notificationService";
import PageHeader from "./components/PageHeader";
import styles from "./styles/Entry.module.css";

function Entry() {

  return (
    <>
      <PageHeader title="Product Entry" />
      <div className={styles.formContainer}>
        <form className={styles.formRow}>
          <div className={styles.formColumn}>
            <label className={styles.label} htmlFor="name">
              Name:
            </label>
            <input
              className={styles.input}
              id="name"
              name="name"
              type="text"
              placeholder="Enter product name"
            />

            <label className={styles.label} htmlFor="description">
              Description:
            </label>
            <input
              className={styles.input}
              id="description"
              name="description"
              type="text"
              placeholder="Enter product description"
            />

            <label className={styles.label} htmlFor="price">
              Price:
            </label>
            <input
              className={styles.input}
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price"
            />

            <label className={styles.label} htmlFor="expiration">
              Expiration:
            </label>
            <input
              className={styles.input}
              id="expiration"
              name="expiration"
              type="date"
              placeholder="Select expiration date"
            />
          </div>
          <div className={styles.formColumn}>
            <label className={styles.label} htmlFor="quantity">
              Quantity:
            </label>
            <input
              className={styles.input}
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              placeholder="Enter quantity"
            />

            <label className={styles.label} htmlFor="imageUrl">
              Image URL:
            </label>
            <input
              className={styles.input}
              id="imageUrl"
              name="imageUrl"
              type="text"
              placeholder="Enter image URL"
            />

            <label className={styles.label} htmlFor="category">
              Category:
            </label>
            <input
              className={styles.input}
              id="category"
              name="category"
              type="text"
              placeholder="Enter category"
            />

            <button className={styles.button} type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Entry;
