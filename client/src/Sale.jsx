import React, { useEffect, useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Flex,
  Separator,
} from "@chakra-ui/react";
import PageHeader from "./components/PageHeader";
// import { Toaster, toaster } from "@/components/ui/toaster"
const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  // const toast = useToast();
  // <Toaster />

  // Fetch products using native fetch

  async function fetchProducts() {
    try {
      const url = "http://localhost:5555/products";
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }

      const updatedArray = []
      const json = await response.json()
      const data = json.data

      for (const x in data) {
        console.log(`data[${x}]`, data[x])
        updatedArray.push(data[x])
      }
      setProducts(updatedArray)
    } catch (error) {
      console.error(error.message)
    }

  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );

  const filteredProducts = products.filter((p) =>
    p.itemName.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <>
      <PageHeader title="Transact" />
      <Flex p={5} gap={8} wrap="wrap">
        {/* Inventory Section */}
        <Box w={{ base: "100%", md: "60%" }}>
          <Text fontSize="2xl" mb={3}>Inventory</Text>
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb={4}
          />
          <Flex wrap="wrap" gap={4}>
            {filteredProducts.map((product) => (
              <Box
                key={product._id}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                w="180px"
                textAlign="center"
              >
                <Image
                  src={product.itemImage}
                  alt={product.itemName}
                  boxSize="100px"
                  objectFit="contain"
                  mx="auto"
                />
                <Text fontWeight="bold">{product.itemName}</Text>
                <Text fontSize="sm">{product.itemCategory}</Text>
                <Text>₱{product.itemPrice}</Text>
                <Button
                  colorScheme="teal"
                  size="sm"
                  mt={2}
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* Cart Section */}
        <Box w={{ base: "100%", md: "35%" }}>
          <Text fontSize="2xl" mb={3}>Cart</Text>
          <VStack align="stretch" spacing={3}>
            {cart.length === 0 ? (
              <Text color="gray.500">Your cart is empty.</Text>
            ) : (
              cart.map((item) => (
                <Box
                  key={item._id}
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                >
                  <HStack justify="space-between">
                    <Text>{item.itemName}</Text>
                    <Text>₱{item.itemPrice} × {item.quantity}</Text>
                  </HStack>
                  <HStack justify="space-between" mt={2}>
                    <HStack>
                      <Button size="xs" onClick={() => updateQuantity(item._id, -1)}>-</Button>
                      <Text>{item.quantity}</Text>
                      <Button size="xs" onClick={() => updateQuantity(item._id, 1)}>+</Button>
                    </HStack>
                    <Button
                      colorScheme="red"
                      size="xs"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </Button>
                  </HStack>
                </Box>
              ))
            )}
          </VStack>

          <Separator my={4} />
          <Text fontWeight="bold">Total: ₱{total}</Text>
          <Button colorScheme="blue" mt={3} isDisabled={cart.length === 0}>
            Checkout
          </Button>
        </Box>
      </Flex>
    </>
  );
};

export default POS;
