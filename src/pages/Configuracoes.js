import React, { useState } from "react";
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
  Switch,
  useColorMode,
  HStack,
  Link,
  useClipboard, 
  InputGroup,
  InputRightElement,
  Avatar,
  Flex,
  SimpleGrid,
  Badge,
  IconButton,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { motion } from "framer-motion";
import { useAuth } from '../auth/AuthContext';
import axios from "axios";

const MotionBox = motion(Box);

const GlassCard = ({ children, gradient, ...props }) => (
  <MotionBox
    bg="rgba(255, 255, 255, 0.05)"
    backdropFilter="blur(20px)"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    p={6}
    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
    position="relative"
    overflow="hidden"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {gradient && (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={gradient}
        opacity={0.1}
        pointerEvents="none"
      />
    )}
    {children}
  </MotionBox>
);

function Configuracoes() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const { currentUser } = useAuth();
  
  const whatsappId = currentUser ? currentUser.uid : "Faça login para ver seu ID";
  
  const { onCopy, hasCopied } = useClipboard(whatsappId);

  const handleExportData = async () => {
    if (!currentUser) return;

    setIsExporting(true);
    try {
      const userId = currentUser.uid;
      
      const entradasResponse = await axios.get(`http://localhost:8080/api/entradas?userId=${userId}`);
      const saidasResponse = await axios.get(`http://localhost:8080/api/saidas?userId=${userId}`);
      
      const dataToExport = {
        metaData: {
            app: "FinanZas TCC Export",
            exportDate: new Date().toISOString(),
            userId: userId,
        },
        entradas: entradasResponse.data,
        saidas: saidasResponse.data,
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToExport, null, 2)
      )}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = `finanzas_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "📥 Exportação Concluída!",
        description: "Seus dados foram baixados em formato JSON.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });

    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "❌ Erro na Exportação",
        description: "Não foi possível buscar os dados do servidor. Verifique o backend.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSalvar = () => {
    toast({
      title: "✅ Configurações salvas!",
      description: "Suas informações foram atualizadas.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
    setSenha("");
  };

  const handleToggleColorMode = () => {
    toggleColorMode();
    toast({
      title: `🎨 Modo ${colorMode === 'light' ? 'Escuro' : 'Claro'} ativado`,
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Box w="100%" maxW="1200px" mx="auto">
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
      >
        <VStack align="start" spacing={1}>
          <Heading
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="black"
            bgGradient="linear(to-r, #a8edea, #fed6e3)"
            bgClip="text"
          >
            ⚙️ Configurações
          </Heading>
          <Text color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
            Personalize sua experiência no FinanZas
          </Text>
        </VStack>
      </MotionBox>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {currentUser && (
          <MotionBox variants={itemVariants} mb={6}>
            <GlassCard gradient="linear(to-br, #667eea, #764ba2)">
              <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                gap={6}
              >
                <Avatar
                  size="2xl"
                  name={currentUser?.email}
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  border="4px solid"
                  borderColor="whiteAlpha.300"
                  boxShadow="0 8px 24px rgba(102, 126, 234, 0.4)"
                />
                <VStack align={{ base: "center", md: "start" }} spacing={2} flex={1}>
                  <Heading size="lg" color="white">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                  </Heading>
                  <Text color="whiteAlpha.700" fontSize="md">
                    {currentUser?.email}
                  </Text>
                  <HStack spacing={2} mt={2}>
                    <Badge bgGradient="linear(to-r, #11998e, #38ef7d)" color="white" px={3} py={1} borderRadius="full">
                      ✓ Conta Ativa
                    </Badge>
                  </HStack>
                </VStack>
              </Flex>
            </GlassCard>
          </MotionBox>
        )}

        {currentUser && (
          <MotionBox variants={itemVariants} mb={6}>
            <GlassCard gradient="linear(to-br, #25d366, #128c7e)">
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <HStack>
                    <Text fontSize="3xl">💬</Text>
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color="white">
                        Integração WhatsApp Bot
                      </Heading>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        Gerencie suas finanças pelo WhatsApp
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme="green" fontSize="xs" px={3} py={1} borderRadius="full">
                    Disponível
                  </Badge>
                </HStack>

                <Divider borderColor="whiteAlpha.300" />

                <Box p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl">
                  <Text color="whiteAlpha.800" fontSize="sm" mb={3}>
                    📱 Use este comando no WhatsApp:
                  </Text>
                  <Box
                    p={3}
                    bg="rgba(0, 0, 0, 0.3)"
                    borderRadius="lg"
                    fontFamily="mono"
                    fontSize="sm"
                    color="green.300"
                  >
                    CONECTAR {'{SEU_ID}'}
                  </Box>
                </Box>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    🔑 Seu ID de Usuário (UID)
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      value={whatsappId}
                      isReadOnly
                      color="white"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      borderRadius="xl"
                      fontFamily="mono"
                      fontSize="sm"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Copiar ID"
                        icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                        onClick={onCopy}
                        colorScheme={hasCopied ? "green" : "whiteAlpha"}
                        size="sm"
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  as={Link}
                  href="https://wa.me/5511960428846"
                  target="_blank"
                  size="lg"
                  bg="white"
                  color="#25d366"
                  _hover={{ 
                    transform: "translateY(-2px)",
                    boxShadow: "xl"
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  leftIcon={<Text fontSize="xl">💬</Text>}
                >
                  Abrir WhatsApp
                </Button>
              </VStack>
            </GlassCard>
          </MotionBox>
        )}

        <MotionBox variants={itemVariants} mb={6}>
          <GlassCard gradient="linear(to-br, #4facfe, #00f2fe)">
            <VStack align="stretch" spacing={5}>
              <HStack>
                <Text fontSize="2xl">👤</Text>
                <Heading size="md" color="white">
                  Informações da Conta
                </Heading>
              </HStack>
              <FormControl>
                <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                  📝 Nome Completo
                </FormLabel>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  color="white"
                  bg="rgba(255, 255, 255, 0.1)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: 'whiteAlpha.500' }}
                  _hover={{ borderColor: 'whiteAlpha.400' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4facfe' }}
                  size="lg"
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                  📧 Email
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  color="white"
                  bg="rgba(255, 255, 255, 0.1)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: 'whiteAlpha.500' }}
                  _hover={{ borderColor: 'whiteAlpha.400' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4facfe' }}
                  size="lg"
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                  🔒 Nova Senha
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite uma nova senha"
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _placeholder={{ color: 'whiteAlpha.500' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4facfe' }}
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
                onClick={handleSalvar}
                size="lg"
                bgGradient="linear(to-r, #4facfe, #00f2fe)"
                color="white"
                _hover={{ 
                  bgGradient: "linear(to-r, #00f2fe, #4facfe)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(79, 172, 254, 0.4)"
                }}
                transition="all 0.3s"
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Text>💾</Text>}
              >
                Salvar Alterações
              </Button>
            </VStack>
          </GlassCard>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <MotionBox variants={itemVariants}>
            <GlassCard gradient="linear(to-br, #667eea, #764ba2)">
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Text fontSize="2xl">🎨</Text>
                  <Heading size="md" color="white">
                    Aparência
                  </Heading>
                </HStack>

                <Flex
                  p={4}
                  bg="rgba(255, 255, 255, 0.1)"
                  borderRadius="xl"
                  justify="space-between"
                  align="center"
                >
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="semibold">
                      {colorMode === 'dark' ? '🌙' : '☀️'} Modo {colorMode === 'dark' ? 'Escuro' : 'Claro'}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      Alterne entre temas
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="purple"
                    isChecked={colorMode === 'dark'}
                    onChange={handleToggleColorMode}
                  />
                </Flex>

                <Flex
                  p={4}
                  bg="rgba(255, 255, 255, 0.1)"
                  borderRadius="xl"
                  justify="space-between"
                  align="center"
                >
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="semibold">
                      ✨ Animações
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      Efeitos visuais
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="purple"
                    defaultChecked
                  />
                </Flex>
              </VStack>
            </GlassCard>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <GlassCard gradient="linear(to-br, #11998e, #38ef7d)">
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Text fontSize="2xl">🔔</Text>
                  <Heading size="md" color="white">
                    Notificações
                  </Heading>
                </HStack>

                <Flex
                  p={4}
                  bg="rgba(255, 255, 255, 0.1)"
                  borderRadius="xl"
                  justify="space-between"
                  align="center"
                >
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="semibold">
                      📧 Email
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      Resumos financeiros
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="green"
                    defaultChecked
                  />
                </Flex>

                <Flex
                  p={4}
                  bg="rgba(255, 255, 255, 0.1)"
                  borderRadius="xl"
                  justify="space-between"
                  align="center"
                >
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="semibold">
                      💬 WhatsApp
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      Alertas de metas
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="green"
                    defaultChecked
                  />
                </Flex>
              </VStack>
            </GlassCard>
          </MotionBox>
        </SimpleGrid>

        <MotionBox variants={itemVariants} mb={6}>
          <GlassCard gradient="linear(to-br, #fc4a1a, #f7b733)">
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Text fontSize="2xl">🔐</Text>
                <Heading size="md" color="white">
                  Segurança e Privacidade
                </Heading>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                
                <Box p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl" textAlign="center">
                  <Text fontSize="3xl" mb={2}>📥</Text>
                  <Text color="white" fontWeight="semibold" mb={1}>
                    Exportar Dados (JSON)
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.600" mb={3}>
                    Baixe um **backup completo** das suas entradas e saídas.
                  </Text>
                  <Button 
                    size="sm" 
                    colorScheme="orange" 
                    borderRadius="lg" 
                    w="full"
                    onClick={handleExportData}
                    isLoading={isExporting}  
                    loadingText="Baixando..."
                  >
                    Baixar
                  </Button>
                </Box>
              </SimpleGrid>
            </VStack>
          </GlassCard>
        </MotionBox>

        <MotionBox variants={itemVariants} mb={6}>
          <GlassCard gradient="linear(to-br, #f093fb, #f5576c)">
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Text fontSize="2xl">💬</Text>
                <Heading size="md" color="white">
                  Suporte e Ajuda
                </Heading>
              </HStack>
              <Text color="whiteAlpha.800" fontSize="sm">
                Nossa equipe está sempre pronta para ajudar você! Entre em contato através dos canais abaixo:
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Button
                  as={Link}
                  href="mailto:suporte@finanzas.com"
                  size="lg"
                  bg="rgba(255, 255, 255, 0.2)"
                  color="white"
                  _hover={{ 
                    bg: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  leftIcon={<Text fontSize="xl">📧</Text>}
                >
                  Email Suporte
                </Button>

                <Button
                  as={Link}
                  href="https://wa.me/5511960428846"
                  target="_blank"
                  size="lg"
                  bg="rgba(255, 255, 255, 0.2)"
                  color="white"
                  _hover={{ 
                    bg: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  leftIcon={<Text fontSize="xl">💬</Text>}
                >
                  WhatsApp
                </Button>
              </SimpleGrid>

              <Divider borderColor="whiteAlpha.300" />

              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <VStack align="start" spacing={0}>
                  <Text color="white" fontSize="sm" fontWeight="semibold">
                    📚 Central de Ajuda
                  </Text>
                  <Text color="whiteAlpha.600" fontSize="xs">
                    Tutoriais e FAQ
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  borderRadius="lg"
                >
                  Acessar →
                </Button>
              </HStack>
            </VStack>
          </GlassCard>
        </MotionBox>

        <MotionBox variants={itemVariants}>
          <GlassCard>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Text fontSize="2xl">ℹ️</Text>
                <Heading size="md" color="white">
                  Sobre o FinanZas
                </Heading>
              </HStack>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} textAlign="center">
                <Box>
                  <Text color="whiteAlpha.600" fontSize="xs" mb={1}>Versão</Text>
                  <Text color="white" fontWeight="bold">4.5.0</Text>
                </Box>
                <Box>
                  <Text color="whiteAlpha.600" fontSize="xs" mb={1}>Última Atualização</Text>
                  <Text color="white" fontWeight="bold">Out 2025</Text>
                </Box>
                <Box>
                  <Text color="whiteAlpha.600" fontSize="xs" mb={1}>Status</Text>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="md">✓ Online</Badge>
                </Box>
                <Box>
                  <Text color="whiteAlpha.600" fontSize="xs" mb={1}>Usuários</Text>
                  <Text color="white" fontWeight="bold">10K+</Text>
                </Box>
              </SimpleGrid>

              <Divider borderColor="whiteAlpha.300" />

              <HStack justify="center" spacing={4} flexWrap="wrap">
                <Link
                  color="whiteAlpha.700"
                  fontSize="sm"
                  _hover={{ color: "white", textDecoration: "underline" }}
                >
                  Termos de Uso
                </Link>
                <Text color="whiteAlpha.500">•</Text>
                <Link
                  color="whiteAlpha.700"
                  fontSize="sm"
                  _hover={{ color: "white", textDecoration: "underline" }}
                >
                  Política de Privacidade
                </Link>
                <Text color="whiteAlpha.500">•</Text>
                <Link
                  color="whiteAlpha.700"
                  fontSize="sm"
                  _hover={{ color: "white", textDecoration: "underline" }}
                >
                  Licenças
                </Link>
              </HStack>

              <Text textAlign="center" color="whiteAlpha.600" fontSize="xs" pt={2}>
                Made with 💜 by FinanZas Team
              </Text>
            </VStack>
          </GlassCard>
        </MotionBox>
      </motion.div>
    </Box>
  );
}

export default Configuracoes;