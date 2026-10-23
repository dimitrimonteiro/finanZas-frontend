import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Heading,
  Center,
  Image,
  Divider,
  Link as ChakraLink,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';

const MotionBox = motion(Box);

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: '🎉 Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: '❌ Erro no login',
        description: 'Verifique seu e-mail e senha.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: '🎉 Bem-vindo!',
        description: 'Login com Google bem-sucedido.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: '❌ Erro no login',
        description: 'Não foi possível autenticar com o Google.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
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
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-50%"
            left="-50%"
            width="200%"
            height="200%"
            bgGradient="linear(to-br, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))"
            transform="rotate(-12deg)"
            pointerEvents="none"
          />

          <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
            <Center>
              <MotionBox
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Image 
                  src="./finanzas_icon.png" 
                  boxSize={{ base: "80px", md: "100px" }} 
                  alt="FinanZas Icon"
                  filter="drop-shadow(0 0 20px rgba(102, 126, 234, 0.5))"
                />
              </MotionBox>
            </Center>

            <VStack spacing={2}>
              <Heading 
                as="h1" 
                size={{ base: 'xl', md: '2xl' }} 
                textAlign="center"
                bgGradient="linear(to-r, #667eea, #764ba2, #f093fb)"
                bgClip="text"
                fontWeight="black"
              >
                Bem-vindo ao FinanZas
              </Heading>
              <Text color="whiteAlpha.700" textAlign="center" fontSize="sm">
                Sua jornada financeira começa aqui 🚀
              </Text>
            </VStack>

            <Button
              onClick={handleGoogleLogin}
              isLoading={loading}
              size="lg"
              bg="white"
              color="gray.800"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s"
              borderRadius="xl"
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                  <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                  <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                  <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                </svg>
              }
            >
              Continuar com Google
            </Button>

            <HStack>
              <Divider borderColor="whiteAlpha.300" />
              <Text fontSize="sm" color="whiteAlpha.600" whiteSpace="nowrap">
                ou entre com email
              </Text>
              <Divider borderColor="whiteAlpha.300" />
            </HStack>

            <form onSubmit={handleEmailLogin}>
              <VStack spacing={4}>
                <FormControl>
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

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    Senha
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      color="white"
                      bg="rgba(255, 255, 255, 0.05)"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _hover={{ borderColor: 'whiteAlpha.400' }}
                      _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #764ba2' }}
                      borderRadius="xl"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        color="whiteAlpha.700"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button 
                  type="submit" 
                  isLoading={loading}
                  size="lg"
                  w="100%"
                  bgGradient="linear(to-r, #667eea, #764ba2)"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, #764ba2, #667eea)",
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)' 
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  fontWeight="bold"
                >
                  Entrar na Plataforma
                </Button>
              </VStack>
            </form>

            <Center>
              <ChakraLink
                as={RouterLink}
                to="/esqueci-senha"
                color="whiteAlpha.700"
                fontSize="sm"
                _hover={{ color: 'white', textDecoration: 'underline' }}
              >
                Esqueci minha senha
              </ChakraLink>
            </Center>

            <Center>
              <Text color="whiteAlpha.700" fontSize="sm">
                Não tem uma conta?{' '}
                <ChakraLink 
                  as={RouterLink} 
                  to="/cadastro" 
                  color="purple.300"
                  fontWeight="bold"
                  _hover={{ color: 'purple.200', textDecoration: 'underline' }}
                >
                  Cadastre-se gratuitamente
                </ChakraLink>
              </Text>
            </Center>

            <Center pt={4}>
              <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
                Ao continuar, você concorda com nossos<br />
                Termos de Serviço e Política de Privacidade
              </Text>
            </Center>
          </VStack>
        </Box>
      </MotionBox>
    </Center>
  );
}

export default LoginPage;