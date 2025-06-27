import { Box, Button, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import styles from "./styles/Register.module.css";
import logo from "./assets/logo.png";
import PageHeader from "./components/PageHeader";
import { postNotifications } from "./services/notificationService";

function RegisterProductForm() {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [supplierError, setSupplierError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Watch the image URL field to update preview
  const imageUrl = watch("productImageUrl");

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Update image preview when URL changes
  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await fetch("http://localhost:5555/supplier");
      const result = await response.json();

      if (response.ok && result.success) {
        setSuppliers(result.data);
        setSupplierError(null);
      } else {
        setSupplierError("Failed to load suppliers");
        console.error("Error fetching suppliers:", result.message);
      }
    } catch (error) {
      setSupplierError("Network error while fetching suppliers");
      console.error("Network error fetching suppliers:", error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type on frontend too
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (jpg, jpeg, png, gif, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    // Create preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5555/upload/image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Set the uploaded image URL in the form
        setValue('productImageUrl', result.data.url);
        setImagePreview(`http://localhost:5555${result.data.url}`);
        console.log('Image uploaded successfully:', result.data);
      } else {
        setUploadError(result.message || 'Failed to upload image');
        setImagePreview(null);
        setValue('productImageUrl', '');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Network error during upload');
      setImagePreview(null);
      setValue('productImageUrl', '');
    } finally {
      setUploadingImage(false);
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    }
  };

  async function onSubmit(data) {
    // Map form data to match backend schema
    const productData = {
      itemName: data.productName,
      itemBrandName: data.productBrandName || "Generic Brand",
      itemDescription: data.productDescription,
      itemPrice: parseFloat(data.productPrice),
      itemCount: parseInt(data.productQuantity),
      itemCategory: data.productCategory,
      itemImage: data.productImageUrl, // This will be the uploaded image URL
      supplierId: data.supplierId
    };

    const url = "http://localhost:5555/products";
    console.log("Product data:", productData);

    // Find selected supplier details for notification
    const selectedSupplier = suppliers.find(s => s._id === data.supplierId);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);

      if (response.ok) {
        console.log("Product registered successfully:", result);

        // Send success notification
        try {
          await postNotifications({
            type: "product_registration",
            title: "Product Registered",
            message: `New product "${data.productName}" registered with supplier ${selectedSupplier?.supplierName || 'Unknown'}`,
            userInvolved: "System",
            itemInvolved: `Product: ${data.productName}`
          });
        } catch (notificationError) {
          console.error("Failed to send registration notification:", notificationError);
        }

        reset(); // Clear the form after successful registration
        setImagePreview(null); // Clear image preview

      } else {
        console.error("Error response:", result);

        // Send error notification
        try {
          await postNotifications({
            type: "error",
            title: "Product Registration Failed",
            message: `Failed to register product ${data.productName}: ${result.message || 'Unknown error'}`,
            userInvolved: "System",
            itemInvolved: `Product Registration: ${data.productName}`
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
          message: `Failed to connect to server during product registration: ${error.message}`,
          userInvolved: "System",
          itemInvolved: "Product Registration"
        });
      } catch (notificationError) {
        console.error("Failed to send network error notification:", notificationError);
      }
    }
  }

  return (
    <>
      {/* <PageHeader /> */}
      <Center>
        <Box width={"50%"} marginTop={50} color={"black"}>
          <div className={styles.container}>
            <div className={styles.registerBox}>
              <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <img src={logo} alt="MyAvami Logo" style={{ height: "60px" }} />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <Stack spacing={4}>
                  <Text color="gray.700">Product Name *</Text>
                  <input
                    id="productName"
                    className={styles.input}
                    placeholder="Enter Product Name"
                    {...register("productName", { required: "Product name is required" })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Product Brand Name *</Text>
                  <input
                    id="productBrandName"
                    className={styles.input}
                    placeholder="Enter Product Brand Name"
                    {...register("productBrandName", { required: "Product brand name is required" })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Product Description *</Text>
                  <textarea
                    id="productDescription"
                    className={styles.input}
                    placeholder="Enter Product Description"
                    {...register("productDescription", { required: "Product description is required" })}
                    style={{ color: "black", minHeight: "80px", resize: "vertical" }}
                  />

                  <Text color="gray.700">Product Price *</Text>
                  <input
                    id="productPrice"
                    className={styles.input}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter Product Price"
                    {...register("productPrice", {
                      required: "Product price is required",
                      min: { value: 0, message: "Price must be positive" }
                    })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Product Quantity *</Text>
                  <input
                    id="productQuantity"
                    className={styles.input}
                    type="number"
                    min="0"
                    placeholder="Enter Product Quantity"
                    {...register("productQuantity", {
                      required: "Product quantity is required",
                      min: { value: 0, message: "Quantity must be positive" }
                    })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Product Category *</Text>
                  <input
                    id="productCategory"
                    className={styles.input}
                    placeholder="Enter Product Category"
                    {...register("productCategory", { required: "Product category is required" })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Product Image *</Text>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      style={{
                        padding: "8px",
                        border: "1px solid #cbd5e0",
                        borderRadius: "4px",
                        width: "100%",
                        backgroundColor: uploadingImage ? "#f7fafc" : "white"
                      }}
                    />
                    {uploadingImage && (
                      <Text fontSize="sm" color="blue.600" mt={1}>
                        Uploading image...
                      </Text>
                    )}
                    {uploadError && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {uploadError}
                      </Text>
                    )}
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Select an image file (max 5MB, jpg/png/gif/webp)
                    </Text>
                  </div>

                  {/* Hidden input to store the uploaded image URL */}
                  <input
                    type="hidden"
                    {...register("productImageUrl", { required: "Product image is required" })}
                  />

                  {imagePreview && (
                    <div style={{ marginTop: "10px" }}>
                      <Text fontSize="sm" color="gray.700" mb={2}>Image Preview:</Text>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "cover",
                          border: "1px solid #cbd5e0",
                          borderRadius: "4px"
                        }}
                        onError={() => setImagePreview(null)}
                      />
                    </div>
                  )}

                  <Text color="gray.700">Supplier *</Text>
                  {loadingSuppliers ? (
                    <div style={{ padding: "10px", textAlign: "center", color: "gray" }}>
                      Loading suppliers...
                    </div>
                  ) : supplierError ? (
                    <div style={{ padding: "10px", color: "red" }}>
                      {supplierError}
                      <button
                        type="button"
                        onClick={fetchSuppliers}
                        style={{ marginLeft: "10px", padding: "5px 10px", fontSize: "12px" }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <select
                      id="supplier"
                      className={styles.select}
                      {...register("supplierId", { required: "Please select a supplier" })}
                      style={{ color: "black" }}
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.supplierName} - {supplier.supplierEmail}
                        </option>
                      ))}
                    </select>
                  )}

                  {suppliers.length === 0 && !loadingSuppliers && !supplierError && (
                    <Text color="orange.500" fontSize="sm">
                      No suppliers available. Please add suppliers first.
                    </Text>
                  )}

                  <button
                    className={styles.button}
                    type="submit"
                    disabled={loadingSuppliers || suppliers.length === 0 || uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Register Product"}
                  </button>
                </Stack>
              </form>
            </div>
          </div>
        </Box>
      </Center>
    </>
  );
}

export default RegisterProductForm;
