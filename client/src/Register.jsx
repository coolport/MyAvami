import { Box, Button, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import styles from "./styles/Register.module.css";
import logo from "./assets/logo.png";

function Register() {
  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    const url = "http://localhost:5555/users";
    console.log(data);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      console.log(response);

      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);

      if (!response.ok) {
        console.error("Error response:", result);
      }

    } catch (error) {
      console.error("ERROR", error.message);
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
                <Stack spacing={4}>
                  <Text color="gray.">Username</Text>
                  <input
                    id="username"
                    className={styles.input}
                    placeholder="Enter your username"
                    {...register("userUsername", { required: true })}
                    autoComplete="username"
                    style={{ color: "white" }}
                  />

                  <Text color="gray.700">Password</Text>
                  <input
                    id="password"
                    className={styles.input}
                    type="password"
                    placeholder="Enter your password"
                    {...register("userPassword", { required: true })}
                    autoComplete="new-password"
                    style={{ color: "white" }}
                  />

                  <Text color="gray.700">Full Name</Text>
                  <input
                    id="fullname"
                    className={styles.input}
                    placeholder="Enter your full name"
                    {...register("userFullName", { required: true })}
                    style={{ color: "white" }}
                  />

                  <Text color="gray.700">Email</Text>
                  <input
                    id="email"
                    className={styles.input}
                    type="email"
                    placeholder="Enter your email"
                    {...register("userEmail", { required: true })}
                    autoComplete="email"
                    style={{ color: "white" }}
                  />

                  <label className={styles.label} htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className={styles.select}
                    {...register("role", { required: true })}
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
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

export default Register;
