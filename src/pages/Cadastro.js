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
  HStack,
  InputGroup,
  InputRightElement,
  IconButton,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';

const MotionBox = motion(Box);

function CadastroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: '❌ Senhas não coincidem',
        description: 'Por favor, verifique suas senhas.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      toast({
        title: '⚠️ Senha fraca',
        description: 'Use no mínimo 8 caracteres, com letras e números.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      toast({
        title: '🎉 Conta criada com sucesso!',
        description: 'Bem-vindo ao FinanZas!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/');
    } catch (error) {
      let errorMessage = 'Não foi possível criar sua conta.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está cadastrado.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      }
      
      toast({
        title: '❌ Erro no cadastro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: '🎉 Bem-vindo ao FinanZas!',
        description: 'Cadastro com Google realizado.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: '❌ Erro no cadastro',
        description: 'Não foi possível cadastrar com o Google.',
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
        w={{ base: '90%', sm: '450px', md: '500px' }}
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
            bgGradient="linear(to-br, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1))"
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
                  filter="drop-shadow(0 0 20px rgba(56, 239, 125, 0.5))"
                />
              </MotionBox>
            </Center>

            <VStack spacing={2}>
              <Heading 
                as="h1" 
                size={{ base: 'xl', md: '2xl' }} 
                textAlign="center"
                bgGradient="linear(to-r, #11998e, #38ef7d)"
                bgClip="text"
                fontWeight="black"
              >
                Criar Conta no FinanZas
              </Heading>
              <Text color="whiteAlpha.700" textAlign="center" fontSize="sm">
                Comece sua jornada financeira hoje! 🚀
              </Text>
            </VStack>

            <Button
              onClick={handleGoogleSignup}
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
              Cadastrar com Google
            </Button>

            <HStack>
              <Divider borderColor="whiteAlpha.300" />
              <Text fontSize="sm" color="whiteAlpha.600" whiteSpace="nowrap">
                ou cadastre-se com email
              </Text>
              <Divider borderColor="whiteAlpha.300" />
            </HStack>

            <form onSubmit={handleCadastro}>
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
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #38ef7d' }}
                    size="lg"
                    borderRadius="xl"
                    required
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
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #38ef7d' }}
                      borderRadius="xl"
                      required
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

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    Confirmar Senha
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      color="white"
                      bg="rgba(255, 255, 255, 0.05)"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _hover={{ borderColor: 'whiteAlpha.400' }}
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #38ef7d' }}
                      borderRadius="xl"
                      required
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                        color="whiteAlpha.700"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Box w="100%" p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="xl">
                  <Text color="whiteAlpha.900" fontSize="sm" fontWeight="semibold" mb={2}>
                    ✨ Ao criar sua conta você terá:
                  </Text>
                  <List spacing={2}>
                    <ListItem fontSize="sm" color="whiteAlpha.700">
                      <ListIcon as={CheckCircleIcon} color="green.400" />
                      Dashboard completo e interativo
                    </ListItem>
                    <ListItem fontSize="sm" color="whiteAlpha.700">
                      <ListIcon as={CheckCircleIcon} color="green.400" />
                      Controle de entradas e saídas
                    </ListItem>
                    <ListItem fontSize="sm" color="whiteAlpha.700">
                      <ListIcon as={CheckCircleIcon} color="green.400" />
                      Metas financeiras inteligentes
                    </ListItem>
                    <ListItem fontSize="sm" color="whiteAlpha.700">
                      <ListIcon as={CheckCircleIcon} color="green.400" />
                      Relatórios detalhados em PDF
                    </ListItem>
                  </List>
                </Box>

                <Button 
                  type="submit" 
                  isLoading={loading}
                  size="lg"
                  w="100%"
                  bgGradient="linear(to-r, #11998e, #38ef7d)"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, #38ef7d, #11998e)",
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 8px 24px rgba(56, 239, 125, 0.4)' 
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  fontWeight="bold"
                >
                  Criar Conta Grátis
                </Button>
              </VStack>
            </form>

            <Center>
              <Text color="whiteAlpha.700" fontSize="sm">
                Já tem uma conta?{' '}
                <ChakraLink 
                  as={RouterLink} 
                  to="/login" 
                  color="green.300"
                  fontWeight="bold"
                  _hover={{ color: 'green.200', textDecoration: 'underline' }}
                >
                  Faça login
                </ChakraLink>
              </Text>
            </Center>

            <Center pt={4}>
              <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
                Ao criar uma conta, você concorda com nossos<br />
                Termos de Serviço e Política de Privacidade
              </Text>
            </Center>
          </VStack>
        </Box>
      </MotionBox>
    </Center>
  );
}

export default CadastroPage;