import React from "react";
import { useForm } from "react-hook-form";
import { Box, Button } from "@chakra-ui/react";
import { postNotifications } from "./services/notificationService";
import PageHeader from "./components/PageHeader";
import styles from "./styles/Entry.module.css";

function Entry() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  async function submitForm(data) {
    // Map form field names to match backend schema
    const productData = {
      itemName: data.name,
      itemDescription: data.description,
      itemPrice: parseFloat(data.price),
      itemExpiration: data.expiration,
      itemCount: parseInt(data.quantity),
      itemImage: data.imageUrl,
      itemCategory: data.category
    };

    const url = "http://localhost:5555/products";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Product created successfully:", result);

        // Send success notification
        try {
          await postNotifications({
            type: "product_entry",
            title: "Product Added",
            message: `${productData.itemName} has been successfully added to inventory`,
            userInvolved: "System",
            itemInvolved: productData.itemName
          });
        } catch (notificationError) {
          console.error("Failed to send notification:", notificationError);
          // Don't block the success if notification fails
        }

        reset(); // Clear the form
      } else {
        console.error("Error creating product:", result.message);

        // Send error notification
        try {
          await postNotifications({
            type: "error",
            title: "Product Entry Failed",
            message: `Failed to add product: ${result.message}`,
            userInvolved: "System",
            itemInvolved: productData.itemName || "Unknown Product"
          });
        } catch (notificationError) {
          console.error("Failed to send error notification:", notificationError);
        }
      }
    } catch (error) {
      console.error("Network error:", error.message);

      // Send network error notification
      try {
        await postNotifications({
          type: "error",
          title: "Network Error",
          message: `Failed to connect to server: ${error.message}`,
          userInvolved: "System",
          itemInvolved: "Product Entry"
        });
      } catch (notificationError) {
        console.error("Failed to send network error notification:", notificationError);
      }
    }
  }

  return (
    <>
      <PageHeader title="Product Entry" />
      <div className={styles.formContainer}>
        <form className={styles.formRow} onSubmit={handleSubmit(submitForm)}>
          <div className={styles.formColumn}>
            <label className={styles.label} htmlFor="name">
              Name:
            </label>
            <input
              className={styles.input}
              id="name"
              type="text"
              placeholder="Enter product name"
              {...register("name", { required: "Product name is required" })}
            />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}

            <label className={styles.label} htmlFor="description">
              Description:
            </label>
            <input
              className={styles.input}
              id="description"
              type="text"
              placeholder="Enter product description"
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && <span className={styles.error}>{errors.description.message}</span>}

            <label className={styles.label} htmlFor="price">
              Price:
            </label>
            <input
              className={styles.input}
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price must be positive" }
              })}
            />
            {errors.price && <span className={styles.error}>{errors.price.message}</span>}

            <label className={styles.label} htmlFor="expiration">
              Expiration:
            </label>
            <input
              className={styles.input}
              id="expiration"
              type="date"
              placeholder="Select expiration date"
              {...register("expiration", { required: "Expiration date is required" })}
            />
            {errors.expiration && <span className={styles.error}>{errors.expiration.message}</span>}
          </div>

          <div className={styles.formColumn}>
            <label className={styles.label} htmlFor="quantity">
              Quantity:
            </label>
            <input
              className={styles.input}
              id="quantity"
              type="number"
              min="0"
              placeholder="Enter quantity"
              {...register("quantity", {
                required: "Quantity is required",
                min: { value: 0, message: "Quantity must be positive" }
              })}
            />
            {errors.quantity && <span className={styles.error}>{errors.quantity.message}</span>}

            <label className={styles.label} htmlFor="imageUrl">
              Image URL:
            </label>
            <input
              className={styles.input}
              id="imageUrl"
              type="text"
              placeholder="Enter image URL"
              {...register("imageUrl", { required: "Image URL is required" })}
            />
            {errors.imageUrl && <span className={styles.error}>{errors.imageUrl.message}</span>}

            <label className={styles.label} htmlFor="category">
              Category:
            </label>
            <input
              className={styles.input}
              id="category"
              type="text"
              placeholder="Enter category"
              {...register("category", { required: "Category is required" })}
            />
            {errors.category && <span className={styles.error}>{errors.category.message}</span>}

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
