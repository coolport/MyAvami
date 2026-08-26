import { Box, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import styles from "./styles/Register.module.css";
import logo from "./assets/logo.png";
import { createUser } from "./services/userService";
import { postNotifications } from "./services/notificationService";
import type { UserRole } from "./types";

interface UserFormValues {
  userUsername: string;
  userPassword: string;
  userFullName: string;
  userRole: UserRole;
}

function RegisterUserForm({ onClose }: { onClose?: () => void }) {
  const { register, handleSubmit, reset } = useForm<UserFormValues>();

  async function onSubmit(data: UserFormValues) {
    try {
      await createUser(data);

      await postNotifications({
        type: "user_registration",
        title: "User Registered",
        message: `New ${data.userRole} account created for ${data.userFullName} (${data.userUsername})`,
        userInvolved: data.userFullName,
        itemInvolved: `User Account: ${data.userUsername}`,
      });

      reset(); // Clear the form after successful registration
    } catch (error) {
      await postNotifications({
        type: "error",
        title: "Registration Failed",
        message: `Failed to register user ${data.userUsername}: ${(error as Error).message || "Unknown error"}`,
        userInvolved: data.userFullName || "Unknown User",
        itemInvolved: `Registration Attempt: ${data.userUsername}`,
      });
    }
  }

  return (
    <>
      <Center>
        <Box width={"50%"} marginTop={50} color={"black"}>
          <div className={styles.container}>
            <div className={styles.registerBox}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <img src={logo} alt="MyAvami Logo" style={{ height: "60px" }} />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <Stack>
                  <Text color="gray.">Username</Text>
                  <input
                    id="username"
                    className={styles.input}
                    placeholder="Enter Username"
                    {...register("userUsername", { required: true })}
                    autoComplete="username"
                    style={{ color: "black" }}
                  />
                  <Text color="gray.700">Password</Text>
                  <input
                    id="password"
                    className={styles.input}
                    type="password"
                    placeholder="Enter Password"
                    {...register("userPassword", { required: true })}
                    autoComplete="new-password"
                    style={{ color: "black" }}
                  />
                  <Text color="gray.700">Full Name</Text>
                  <input
                    id="fullname"
                    className={styles.input}
                    placeholder="Enter Full Name"
                    {...register("userFullName", { required: true })}
                    style={{ color: "black" }}
                  />
                  <label className={styles.label} htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className={styles.select}
                    {...register("userRole", { required: true })}
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">User</option>
                  </select>
                  <button className={styles.button} type="submit">
                    Register
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

export default RegisterUserForm;
