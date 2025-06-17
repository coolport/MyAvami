import { Box, Button, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

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
    <>
      <Center>
        <Box width={"50%"} marginTop={50} color={"black"}>
          temp login
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Text color="gray.700">Username</Text>
              <input {...register("username", { required: true })} style={{ color: "white" }} />

              <Text color="gray.700">Password</Text>
              <input {...register("password", { required: true })} style={{ color: "white" }} />

              <Button type="submit" mt={4} colorScheme="blue">
                Login
              </Button>
            </Stack>
          </form>
        </Box>
      </Center>
    </>
  );
}

export default Login;
