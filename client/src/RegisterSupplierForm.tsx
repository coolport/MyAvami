import { Box, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import styles from "./styles/Register.module.css";
import logo from "./assets/logo.png";
import { createSupplier } from "./services/inventoryService";
import { postNotifications } from "./services/notificationService";

interface SupplierFormValues {
  supplierName: string;
  supplierEmail: string;
  supplierAddress: string;
  supplierNumber: string;
  supplierContactPersonName: string;
  supplierContactPersonNumber: string;
}

function RegisterSupplierForm({ onClose }: { onClose?: () => void }) {
  const { register, handleSubmit, reset } = useForm<SupplierFormValues>();

  async function onSubmit(data: SupplierFormValues) {
    try {
      await createSupplier(data);

      await postNotifications({
        type: "supplier_registration",
        title: "Supplier Registered",
        message: `New supplier account created for ${data.supplierName} (${data.supplierEmail})`,
        userInvolved: data.supplierName,
        itemInvolved: `Supplier Account: ${data.supplierEmail}`
      });

      reset(); // Clear the form after successful registration
    } catch (error) {
      await postNotifications({
        type: "error",
        title: "Supplier Registration Failed",
        message: `Failed to register supplier ${data.supplierName}: ${(error as Error).message || 'Unknown error'}`,
        userInvolved: data.supplierName || "Unknown Supplier",
        itemInvolved: `Registration Attempt: ${data.supplierEmail}`
      });
    }
  }

  return (
    <>
      <Center>
        <Box width={"50%"} marginTop={50} color={"black"}>
          <div className={styles.container}>
            <div className={styles.registerBox}>
              <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <img src={logo} alt="MyAvami Logo" style={{ height: "60px" }} />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <Stack>
                  <Text color="gray.700">Supplier Name</Text>
                  <input
                    id="supplierName"
                    className={styles.input}
                    placeholder="Enter Supplier Name"
                    {...register("supplierName", { required: true })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Email Address</Text>
                  <input
                    id="supplierEmail"
                    className={styles.input}
                    type="email"
                    placeholder="Enter Email Address"
                    {...register("supplierEmail", {
                      required: true,
                      pattern: {
                        value: /.+\@.+\..+/,
                        message: "Please enter a valid email address"
                      }
                    })}
                    autoComplete="email"
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Address</Text>
                  <input
                    id="supplierAddress"
                    className={styles.input}
                    placeholder="Enter Supplier Address"
                    {...register("supplierAddress", { required: true })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Phone Number</Text>
                  <input
                    id="supplierNumber"
                    className={styles.input}
                    type="tel"
                    placeholder="Enter Phone Number"
                    {...register("supplierNumber", {
                      required: true,
                      maxLength: {
                        value: 12,
                        message: "Phone number must not exceed 12 digits"
                      },
                      pattern: {
                        value: /^\d+$/,
                        message: "Phone number must contain only digits"
                      }
                    })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Contact Person</Text>
                  <input
                    id="supplierContactPersonName"
                    className={styles.input}
                    placeholder="Enter Contact Person Name"
                    {...register("supplierContactPersonName", {
                      required: true,
                    })}
                    style={{ color: "black" }}
                  />

                  <Text color="gray.700">Contact Person No:</Text>
                  <input
                    id="supplierContactPersonNumber"
                    className={styles.input}
                    type="tel"
                    placeholder="Enter Contact Person Phone Number"
                    {...register("supplierContactPersonNumber", {
                      required: true,
                      maxLength: {
                        value: 12,
                        message: "Phone number must not exceed 12 digits"
                      },
                      pattern: {
                        value: /^\d+$/,
                        message: "Phone number must contain only digits"
                      }
                    })}
                    style={{ color: "black" }}
                  />

                  <button className={styles.button} type="submit">
                    Register Supplier
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

export default RegisterSupplierForm;
