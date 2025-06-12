import { Flex, Button, Heading, Image, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router';
// import avamiLogo from '../assets/logo.png';
// import avamiLogoBlack from '../assets/logoBLACK.svg';
import avamiLogoWhite from '../assets/logowhite.png';
import Home from '../Home';

import { FiArrowLeft } from "react-icons/fi";
import { FiHome } from "react-icons/fi";

const PageHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <Flex
      height={"60px"}
      as="header"
      justify="space-between"

      //enables sticky behavior
      position="sticky"
      //stick to top of viewport
      top="0"
      //above content, functionality the same as like zindex 1k
      zIndex="sticky"

      align="center"
      p={2}
      bg="#0068A6"
    // boxShadow="md"
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
      {/* <Button variant="link" color="white" onClick={() => navigate(-1)}> */}
      {/*   ←  Back */}
      {/* </Button> */}

      <Heading size="md">{title}</Heading>
      <Button variant="ghost"
        _hover={{
          transform: 'translateY(-4px)',
          bg: 'transparent',
          color: 'white'
        }}
        onClick={() => { navigate("/") }}>
        <Image src={avamiLogoWhite}
          alt="Logo" height="2rem" />
      </Button>
    </Flex >
  );
};

export default PageHeader;
