import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Heading,
  SimpleGrid,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Progress,
  Select,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";

const MotionBox = motion(Box);

const formatInputCurrency = (value) => {
  if (value === "" || value === null || isNaN(value)) return "";
  const numericValue = Number(value);
  const fixed = numericValue.toFixed(2);
  const parts = fixed.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1];
  return `${integerPart},${decimalPart}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

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

const categoriaConfig = {
  viagem: { icon: "✈️", gradient: "linear(to-br, #4facfe, #00f2fe)", color: "#4facfe" },
  reserva: { icon: "🛡️", gradient: "linear(to-br, #11998e, #38ef7d)", color: "#11998e" },
  compra: { icon: "🛍️", gradient: "linear(to-br, #fc4a1a, #f7b733)", color: "#fc4a1a" },
  investimento: { icon: "📈", gradient: "linear(to-br, #667eea, #764ba2)", color: "#667eea" },
  outros: { icon: "🎯", gradient: "linear(to-br, #f093fb, #f5576c)", color: "#f093fb" },
};

function Metas() {
  const [metas, setMetas] = useState([]);
  const [novaMeta, setNovaMeta] = useState({
    nomeMeta: "",
    valorObjetivo: "",
    valorAtual: "",
    dataLimite: "",
    categoria: "viagem",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [metaParaExcluir, setMetaParaExcluir] = useState(null);
  const [metaParaEditar, setMetaParaEditar] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { currentUser } = useAuth();
  const baseUrl = "http://localhost:8080/api/metas";

  const fetchMetas = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const response = await axios.get(`${baseUrl}?userId=${userId}`);
      setMetas(response.data);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "valorObjetivo" || name === "valorAtual") {
      const digits = value.replace(/\D/g, "");
      const newNumericValue = digits === "" ? "" : Number(digits) / 100;
      setNovaMeta((prev) => ({ ...prev, [name]: newNumericValue }));
      return;
    }

    setNovaMeta((prev) => ({ ...prev, [name]: value }));
  };

  const adicionarMeta = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    const { valorObjetivo, valorAtual, nomeMeta, dataLimite } = novaMeta;

    if (!nomeMeta || !dataLimite || valorObjetivo === "" || isNaN(valorObjetivo) || Number(valorObjetivo) <= 0) {
      toast({
        title: "⚠️ Preencha todos os campos",
        description: "Nome, Valor Objetivo e Data Limite são obrigatórios.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    
    if (Number(valorAtual) > Number(valorObjetivo)) {
      toast({
        title: "⚠️ Valor Atual inválido",
        description: "O valor economizado não pode ser maior que o objetivo.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const payload = {
      ...novaMeta,
      userId,
      valorObjetivo: Number(valorObjetivo), 
      valorAtual: Number(valorAtual) || 0,
    };

    try {
      if (metaParaEditar) {
        await axios.put(`${baseUrl}/${metaParaEditar.id}?userId=${userId}`, payload);
        toast({ 
          title: "✅ Meta editada!", 
          status: "success", 
          duration: 3000,
          position: "top-right",
        });
      } else {
        await axios.post(`${baseUrl}?userId=${userId}`, payload);
        toast({ 
          title: "🎉 Meta criada!", 
          status: "success", 
          duration: 3000,
          position: "top-right",
        });
      }

      setNovaMeta({ nomeMeta: "", valorObjetivo: "", valorAtual: "", dataLimite: "", categoria: "viagem" });
      setMostrarFormulario(false);
      setMetaParaEditar(null);
      fetchMetas();
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast({ 
        title: "❌ Erro ao salvar", 
        status: "error", 
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const iniciarEdicao = (meta) => {
    setNovaMeta({
      ...meta,
      valorObjetivo: Number(meta.valorObjetivo),
      valorAtual: Number(meta.valorAtual),
    });
    setMetaParaEditar(meta);
    setMostrarFormulario(true);
  };

  const confirmarExclusao = (id) => {
    setMetaParaExcluir(id);
    onOpen();
  };

  const excluirMeta = async () => {
    if (!currentUser || !metaParaExcluir) return;
    const userId = currentUser.uid;
    try {
      await axios.delete(`${baseUrl}/${metaParaExcluir}?userId=${userId}`);
      toast({ 
        title: "🗑️ Meta excluída", 
        status: "info", 
        duration: 3000,
        position: "top-right",
      });
      setMetaParaExcluir(null);
      onClose();
      fetchMetas();
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      toast({ 
        title: "❌ Erro ao excluir", 
        status: "error", 
        duration: 3000,
        position: "top-right",
      });
    }
  };
  
  const totalGeral = metas.reduce((acc, meta) => acc + Number(meta.valorObjetivo), 0);
  const totalAtual = metas.reduce((acc, meta) => acc + Number(meta.valorAtual), 0);
  const percentualGeral = totalGeral > 0 ? (totalAtual / totalGeral) * 100 : 0;

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
    <Box w="100%" maxW="1400px" mx="auto">
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
      >
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="black"
              bgGradient="linear(to-r, #fc4a1a, #f7b733)"
              bgClip="text"
            >
              Metas Financeiras
            </Heading>
            <Text color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
              Estabeleça e alcance seus objetivos
            </Text>
          </VStack>

          <Button
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              setNovaMeta({ nomeMeta: "", valorObjetivo: "", valorAtual: "", dataLimite: "", categoria: "viagem" });
              setMetaParaEditar(null);
            }}
            size="lg"
            bgGradient="linear(to-r, #fc4a1a, #f7b733)"
            color="white"
            _hover={{ 
              bgGradient: "linear(to-r, #f7b733, #fc4a1a)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(252, 74, 26, 0.4)"
            }}
            transition="all 0.3s"
            borderRadius="xl"
            leftIcon={<Text fontSize="xl">{mostrarFormulario ? "✖️" : "➕"}</Text>}
          >
            {mostrarFormulario ? "Cancelar" : "Nova Meta"}
          </Button>
        </Flex>

        <GlassCard gradient="linear(to-br, #fc4a1a, #f7b733)">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={6}>
            <VStack align="start" spacing={2} flex={1}>
              <Text color="whiteAlpha.800" fontSize="sm" fontWeight="semibold">
                💰 Progresso Total das Metas
              </Text>
              <Heading size="lg" color="white">
                {formatCurrency(totalAtual)} / {formatCurrency(totalGeral)}
              </Heading>
              <Text color="whiteAlpha.700" fontSize="sm">
                {metas.length} {metas.length === 1 ? 'meta ativa' : 'metas ativas'}
              </Text>
            </VStack>

            <CircularProgress
              value={percentualGeral}
              size="120px"
              thickness="8px"
              color={percentualGeral >= 100 ? "green.400" : "orange.400"}
              trackColor="whiteAlpha.200"
            >
              <CircularProgressLabel color="white" fontSize="2xl" fontWeight="bold">
                {percentualGeral.toFixed(0)}%
              </CircularProgressLabel>
            </CircularProgress>
          </Flex>

          <Progress
            value={Math.min(100, percentualGeral)}
            size="md"
            colorScheme={percentualGeral >= 100 ? "green" : "orange"}
            borderRadius="full"
            mt={4}
            bg="rgba(255, 255, 255, 0.1)"
          />
        </GlassCard>
      </MotionBox>

      <AnimatePresence>
        {mostrarFormulario && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            mb={8}
          >
            <GlassCard gradient="linear(to-br, #fc4a1a, #f7b733)">
              <VStack spacing={5} align="stretch">
                <Heading size="md" color="white">
                  {metaParaEditar ? "✏️ Editar Meta" : "➕ Criar Nova Meta"}
                </Heading>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    🎯 Nome da Meta
                  </FormLabel>
                  <Input
                    placeholder="Ex: Viagem para Europa, Reserva de Emergência..."
                    name="nomeMeta"
                    value={novaMeta.nomeMeta}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _placeholder={{ color: 'whiteAlpha.500' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px #f7b733' }}
                    size="lg"
                    borderRadius="xl"
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                      💰 Valor Objetivo
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" color="whiteAlpha.600">
                        R$
                      </InputLeftElement>
                      <Input
                        placeholder="0,00"
                        name="valorObjetivo"
                        type="text"
                        value={formatInputCurrency(novaMeta.valorObjetivo)}
                        onChange={handleChange}
                        color="white"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        _placeholder={{ color: 'whiteAlpha.500' }}
                        _hover={{ borderColor: 'whiteAlpha.400' }}
                        _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px #f7b733' }}
                        borderRadius="xl"
                        pl={12}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                      💵 Valor Já Economizado
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" color="whiteAlpha.600">
                        R$
                      </InputLeftElement>
                      <Input
                        placeholder="0,00"
                        name="valorAtual"
                        type="text"
                        value={formatInputCurrency(novaMeta.valorAtual)}
                        onChange={handleChange}
                        color="white"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        _placeholder={{ color: 'whiteAlpha.500' }}
                        _hover={{ borderColor: 'whiteAlpha.400' }}
                        _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px #f7b733' }}
                        borderRadius="xl"
                        pl={12}
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    🏷️ Categoria
                  </FormLabel>
                  <Select
                    name="categoria"
                    value={novaMeta.categoria}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px #f7b733' }}
                    size="lg"
                    borderRadius="xl"
                    icon={<Text>▼</Text>}
                  >
                    <option value="viagem" style={{backgroundColor: '#191919'}}>✈️ Viagem</option>
                    <option value="reserva" style={{backgroundColor: '#191919'}}>🛡️ Reserva de Emergência</option>
                    <option value="compra" style={{backgroundColor: '#191919'}}>🛍️ Compra Específica</option>
                    <option value="investimento" style={{backgroundColor: '#191919'}}>📈 Investimento</option>
                    <option value="outros" style={{backgroundColor: '#191919'}}>🎯 Outros</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    📅 Data Limite
                  </FormLabel>
                  <DatePicker
                    selected={novaMeta.dataLimite ? new Date(novaMeta.dataLimite.replace(/-/g, '/')) : null}
                    onChange={(date) =>
                      setNovaMeta({
                        ...novaMeta,
                        dataLimite: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={ptBR}
                    placeholderText="Selecione uma data"
                    customInput={
                      <Input
                        color="white"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        _placeholder={{ color: 'whiteAlpha.500' }}
                        size="lg"
                        borderRadius="xl"
                      />
                    }
                    calendarStartDay={1}
                    minDate={new Date()}
                  />
                </FormControl>

                <Button
                  onClick={adicionarMeta}
                  size="lg"
                  bg="white"
                  color="#fc4a1a"
                  _hover={{ 
                    transform: "translateY(-2px)",
                    boxShadow: "xl"
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  fontWeight="bold"
                  leftIcon={<Text>{metaParaEditar ? "💾" : "✅"}</Text>}
                >
                  {metaParaEditar ? "Salvar Alterações" : "Criar Meta"}
                </Button>
              </VStack>
            </GlassCard>
          </MotionBox>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <VStack spacing={6} align="stretch">
          {metas.length === 0 ? (
            <GlassCard>
              <VStack py={12} spacing={4}>
                <Text fontSize="6xl">🎯</Text>
                <Heading size="md" color="white">Nenhuma meta definida</Heading>
                <Text color="whiteAlpha.600" textAlign="center">
                  Crie sua primeira meta e comece a realizar seus sonhos!
                </Text>
                <Button
                  onClick={() => setMostrarFormulario(true)}
                  bgGradient="linear(to-r, #fc4a1a, #f7b733)"
                  color="white"
                  size="lg"
                  borderRadius="xl"
                >
                  ➕ Criar Primeira Meta
                </Button>
              </VStack>
            </GlassCard>
          ) : (
            metas.sort((a, b) => new Date(a.dataLimite) - new Date(b.dataLimite)).map((meta) => {
              const percentual = (Number(meta.valorAtual) / Number(meta.valorObjetivo)) * 100;
              const progressValue = Math.min(100, percentual);
              const config = categoriaConfig[meta.categoria] || categoriaConfig.outros;
              const diasRestantes = Math.ceil((new Date(meta.dataLimite) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <MotionBox
                  key={meta.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard gradient={config.gradient}>
                    <Flex justify="space-between" align="flex-start" mb={4} flexWrap="wrap" gap={4}>
                      <HStack spacing={3} flex={1}>
                        <Flex
                          w={14}
                          h={14}
                          bgGradient={config.gradient}
                          borderRadius="xl"
                          align="center"
                          justify="center"
                          fontSize="3xl"
                          flexShrink={0}
                          boxShadow={`0 4px 12px ${config.color}40`}
                        >
                          {config.icon}
                        </Flex>
                        <VStack align="start" spacing={1}>
                          <Text color="white" fontWeight="bold" fontSize="xl">
                            {meta.nomeMeta}
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            <Badge
                              bgGradient={config.gradient}
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="xs"
                            >
                              {config.icon} {meta.categoria.charAt(0).toUpperCase() + meta.categoria.slice(1)}
                            </Badge>
                            <Text fontSize="xs" color="whiteAlpha.600">
                              📅 até {formatDate(meta.dataLimite)}
                            </Text>
                            {diasRestantes > 0 && (
                              <Badge
                                colorScheme={diasRestantes < 30 ? "red" : diasRestantes < 90 ? "yellow" : "green"}
                                fontSize="xs"
                              >
                                {diasRestantes} dias restantes
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>

                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          bgGradient="linear(to-r, #667eea, #764ba2)"
                          color="white"
                          _hover={{ transform: "scale(1.05)" }}
                          onClick={() => iniciarEdicao(meta)}
                          borderRadius="lg"
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          bgGradient="linear(to-r, #ee0979, #ff6a00)"
                          color="white"
                          _hover={{ transform: "scale(1.05)" }}
                          onClick={() => confirmarExclusao(meta.id)}
                          borderRadius="lg"
                        >
                          🗑️
                        </Button>
                      </HStack>
                    </Flex>

                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between" align="baseline">
                        <Text color="white" fontSize="lg" fontWeight="semibold">
                          {formatCurrency(meta.valorAtual)}
                        </Text>
                        <Text color="whiteAlpha.700" fontSize="sm">
                          de {formatCurrency(meta.valorObjetivo)}
                        </Text>
                      </Flex>

                      <Progress
                        value={progressValue}
                        size="lg"
                        colorScheme={percentual >= 100 ? "green" : "orange"}
                        borderRadius="full"
                        bg="rgba(255, 255, 255, 0.1)"
                        hasStripe={percentual < 100}
                        isAnimated={percentual < 100}
                      />

                      <Flex justify="space-between" align="center">
                        <Text
                          fontSize="2xl"
                          fontWeight="black"
                          color={percentual >= 100 ? "#38ef7d" : config.color}
                        >
                          {progressValue.toFixed(1)}%
                        </Text>
                        {percentual >= 100 && (
                          <Badge
                            bgGradient="linear(to-r, #11998e, #38ef7d)"
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            🎉 Meta Alcançada!
                          </Badge>
                        )}
                      </Flex>
                    </VStack>
                  </GlassCard>
                </MotionBox>
              );
            })
          )}
        </VStack>
      </motion.div>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(10px)">
          <AlertDialogContent
            bg="rgba(26, 32, 44, 0.95)"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            mx={4}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
              🗑️ Confirmar Exclusão
            </AlertDialogHeader>

            <AlertDialogBody color="whiteAlpha.800">
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} borderRadius="xl">
                Cancelar
              </Button>
              <Button
                bgGradient="linear(to-r, #ee0979, #ff6a00)"
                color="white"
                onClick={excluirMeta}
                ml={3}
                borderRadius="xl"
                _hover={{ transform: "scale(1.05)" }}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Metas;