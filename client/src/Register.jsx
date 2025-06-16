import { Box, Select, Button, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

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
          temp register (4admin)
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Text color="gray.">Username</Text>
              <input {...register("userUsername", { required: true })} style={{ color: "white" }} />

              <Text color="gray.700">Password</Text>
              <input {...register("userPassword", { required: true })} style={{ color: "white" }} />

              <Text color="gray.700">Full Name</Text>
              <input {...register("userFullName", { required: true })} style={{ color: "white" }} />

              Role
              <select {...register("userRole", { required: true })} >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" mt={4} colorScheme="blue">
                Register
              </Button>
            </Stack>
          </form>
        </Box>
      </Center>
    </>
  );
}

export default Register;
