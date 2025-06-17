import React from "react";
import { useForm } from "react-hook-form";
import { Box, Button } from "@chakra-ui/react";
import { postNotifications } from "./services/notificationService";
import PageHeader from "./components/PageHeader";
import styles from "./styles/Entry.module.css";

function Entry() {
  const deleteForm = useForm();

  async function dummySubmit() {
    const url = "http://localhost:5555/products";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          itemName:
            "Advil",
          itemDescription:
            "Ibuprofen is a nonsteroidal anti-inflammatory drug that is used to relieve pain, fever, and inflammation. This includes painful menstrual periods, migraines, and rheumatoid arthritis.",
          itemPrice: 10,
          itemExpiration: "2025-10-24T00:00:00.000Z",
          itemCount: 80,
          itemImage:
            "https://www.rosepharmacy.com/ph1/wp-content/uploads/2016/10/62550.png",
          itemCategory: "NSAID",
        }),
      });
      console.log(response);
    } catch (error) {
      console.error(error.message);
    }
  }


  // Base delete func to work with
  // Handle: id not found, check auth/accesslevel?
  // Better logging.. errors r ambiguous
  async function onDeleteSubmit(data) {
    const id = data.deleteId;
    console.log("Deleting ID: ", id);
    const url = `http://localhost:5555/products/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      console.log("Response: ", response);
    } catch (error) {
      console.error(error.message);
    }
  }

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
        <br />
        <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}>
          deleteId: <input {...deleteForm.register("deleteId")} />
          <Button type="submit">Delete</Button>
        </form>
        <Button
          type="submit"
          onClick={dummySubmit}
          className={styles.dummyButton}
        >
          Submit Dummy POST req
        </Button>
        <br />
        <Button
          type="submit"
          onClick={() => {
            postNotifications({
              title: "New Product Added",
              message: "Product was added successfully.",
              type: "product",
              userInvolved: "Usertest",
            });
          }}
          className={styles.notifyButton}
        >
          post dummy notif
        </Button>
      </div>
    </>
  );
}

export default Entry;
