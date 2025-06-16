import { Box, Button, Center, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

function Login() {
  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    console.log(data);
  }

  return (
    <>
      <Center>
        <Box width={"50%"} marginTop={50} color={"black"}>
          temp login
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Text color="gray.700">Username</Text>
              <input {...register("username", { required: true })} />

              <Text color="gray.700">Password</Text>
              <input {...register("password", { required: true })} />

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
