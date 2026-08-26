import { Flex, Button, Heading, Image, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import avamiLogoWhite from '../assets/logowhite.png';

import { FiArrowLeft } from "react-icons/fi";

const PageHeader = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  return (
    <Flex
      height={"60px"}
      as="header"
      justify="space-between"

      //enables sticky behavior
      position="sticky"
      top="0"
      zIndex="sticky"

      align="center"
      p={2}
      bg="#0068A6"
    >
      <div>
        <Button variant="ghost"
          _hover={{
            transform: 'translateY(-4px)',
            bg: 'transparent',
            color: 'white'
          }}
          color="white" onClick={() => navigate(-1)} >
          <Icon boxSize="5" as={FiArrowLeft} />Back
        </Button>
      </div>

      <Heading size="md">{title}</Heading>
      <Button variant="ghost"
        _hover={{
          transform: 'translateY(-4px)',
          bg: 'transparent',
          color: 'white'
        }}
        onClick={() => { navigate("/home") }}>
        <Image src={avamiLogoWhite}
          alt="Logo" height="2rem" />
      </Button>
    </Flex >
  );
};

export default PageHeader;
