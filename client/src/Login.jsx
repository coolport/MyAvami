import { Box, Button, Center, Stack } from "@chakra-ui/react"
import { useForm } from "react-hook-form"


function Login() {

  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    // const response = await
    console.log(data);
  }

  return (
    <>
      <Center>
        <Box width={"50%"} marginTop={50}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              username <input {...register("username",
                { required: true })}
              />
              password <input {...register("password",
                { required: true, })}
              />
            </Stack>
            <Button type="submit">Submit</Button>
          </form >
        </Box>
      </Center>
    </>
  )
}


export default Login
