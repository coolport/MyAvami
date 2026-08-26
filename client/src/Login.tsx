import { useForm } from "react-hook-form";
import styles from "./styles/Login.module.css";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router";
import { login } from "./services/authService";

interface LoginFormValues {
  username: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginFormValues>();

  async function onSubmit(data: LoginFormValues) {
    try {
      const result = await login(data.username, data.password);

      if (result.success && result.user) {
        const role = result.user.role;

        if (role === "admin") {
          navigate("/home");
        } else if (role === "employee") {
          navigate("/homeemployee");
        }
      } else {
        console.error("Login FAILED:", result.message);
      }
    } catch (error) {
      console.error("Server error:", (error as Error).message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
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
