import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Heading,
  Center,
  Image,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';

const MotionBox = motion(Box);

function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const toast = useToast();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setEnviado(true);
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        toast({
          title: '⚠️ E-mail inválido',
          description: 'Confira o endereço digitado.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      } else if (error.code === 'auth/too-many-requests') {
        toast({
          title: '⏳ Muitas tentativas',
          description: 'Aguarde alguns minutos e tente de novo.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top-right',
        });
      } else {
        setEnviado(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="80vh" w="100%">
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        w={{ base: '90%', sm: '400px', md: '450px' }}
      >
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          backdropFilter="blur(20px)"
          borderRadius="3xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          p={{ base: 6, md: 10 }}
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
        >
          <VStack spacing={6} align="stretch">
            <Center>
              <Image
                src="./finanzas_icon.png"
                boxSize={{ base: '80px', md: '100px' }}
                alt="FinanZas Icon"
                filter="drop-shadow(0 0 20px rgba(102, 126, 234, 0.5))"
              />
            </Center>

            <VStack spacing={2}>
              <Heading
                as="h1"
                size={{ base: 'lg', md: 'xl' }}
                textAlign="center"
                bgGradient="linear(to-r, #667eea, #764ba2, #f093fb)"
                bgClip="text"
                fontWeight="black"
              >
                Esqueceu a senha?
              </Heading>
              <Text color="whiteAlpha.700" textAlign="center" fontSize="sm">
                {enviado
                  ? 'Pronto! Verifique seu e-mail.'
                  : 'Informe seu e-mail e enviaremos um link para criar uma nova senha.'}
              </Text>
            </VStack>

            {enviado ? (
              <VStack spacing={4}>
                <Box p={4} bg="rgba(255, 255, 255, 0.08)" borderRadius="xl">
                  <Text color="whiteAlpha.900" fontSize="sm" textAlign="center">
                    📧 Se existir uma conta com <b>{email}</b>, enviamos um link para redefinir a senha.
                    Confira também a caixa de <b>spam</b>.
                  </Text>
                </Box>
                <Button
                  as={RouterLink}
                  to="/login"
                  size="lg"
                  w="100%"
                  bgGradient="linear(to-r, #667eea, #764ba2)"
                  color="white"
                  borderRadius="xl"
                  fontWeight="bold"
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  Voltar para o login
                </Button>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                      Email
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      color="white"
                      bg="rgba(255, 255, 255, 0.05)"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _hover={{ borderColor: 'whiteAlpha.400' }}
                      _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #764ba2' }}
                      size="lg"
                      borderRadius="xl"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    isLoading={loading}
                    size="lg"
                    w="100%"
                    bgGradient="linear(to-r, #667eea, #764ba2)"
                    color="white"
                    borderRadius="xl"
                    fontWeight="bold"
                    _hover={{ transform: 'translateY(-2px)' }}
                  >
                    Enviar link de recuperação
                  </Button>
                </VStack>
              </form>
            )}

            <Center>
              <ChakraLink
                as={RouterLink}
                to="/login"
                color="purple.300"
                fontSize="sm"
                _hover={{ color: 'purple.200', textDecoration: 'underline' }}
              >
                ← Voltar para o login
              </ChakraLink>
            </Center>
          </VStack>
        </Box>
      </MotionBox>
    </Center>
  );
}

export default EsqueciSenhaPage;