import { Box, Button, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import styles from "./styles/Login.module.css";
import logo from "./assets/logo.png";

function Login() {
  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    try {
      const res = await fetch("http://localhost:5555/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userUsername: data.username,
          userPassword: data.password,
        }),
        // INCLUDE SESSION ID, ETC IN FRONTEND
        // alr being logged in node, but to make sure
        // this + session option "sameSite: lax" allows displaying of SID from client
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok) {
        console.log("Login SUCCESFUL:", result);
        // TODO: store session, redirect, or update auth state
      } else {
        console.error("Login FAILED:", result.message);
      }
    } catch (error) {
      console.error("Server error:", error.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <img src={logo} alt="MyAvami Logo" style={{ height: "60px" }} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className={styles.input}
            {...register("username", { required: true })}
            autoComplete="username"
          />

          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            {...register("password", { required: true })}
            autoComplete="current-password"
          />

          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
