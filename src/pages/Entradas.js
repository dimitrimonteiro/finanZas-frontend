import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Select,
  Switch,
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
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Divider,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from '../auth/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MonthNavigator from "../components/MonthNavigator";
import { ptBR } from "date-fns/locale";

const MotionBox = motion(Box);

const formatInputCurrency = (value) => {
  if (!value && value !== 0) return '';
  const numericValue = Number(value);
  const fixed = numericValue.toFixed(2);
  const parts = fixed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];
  return `${integerPart},${decimalPart}`;
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
  salario: { icon: "💼", label: "Salário", gradient: "linear(to-r, #667eea, #764ba2)", color: "#667eea" },
  freelance: { icon: "💻", label: "Freelance", gradient: "linear(to-r, #4facfe, #00f2fe)", color: "#4facfe" },
  investimento: { icon: "📈", label: "Investimento", gradient: "linear(to-r, #11998e, #38ef7d)", color: "#11998e" },
  presente: { icon: "🎁", label: "Presente", gradient: "linear(to-r, #f093fb, #f5576c)", color: "#f093fb" },
  reembolso: { icon: "↩️", label: "Reembolso", gradient: "linear(to-r, #fc4a1a, #f7b733)", color: "#fc4a1a" },
  outros: { icon: "💰", label: "Outros", gradient: "linear(to-r, #a8edea, #fed6e3)", color: "#a8edea" },
};

function Entradas() {
  const [entradas, setEntradas] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [novaEntrada, setNovaEntrada] = useState({
    descricao: "",
    valor: "",
    data: "",
    categoria: "outros",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [entradaParaExcluir, setEntradaParaExcluir] = useState(null);
  const [entradaParaEditar, setEntradaParaEditar] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchEntradas = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const response = await axios.get(`http://localhost:8080/api/entradas?userId=${userId}`);
      
  const entradasDoMes = response.data.filter(entrada => {
        const dataEntrada = new Date(entrada.data);
        return dataEntrada.getMonth() === selectedMonth && dataEntrada.getFullYear() === selectedYear;
      });
      setEntradas(entradasDoMes);
    } catch (error) {
      console.error("Erro ao buscar entradas:", error);
      toast({
        title: "❌ Erro ao carregar",
        description: "Não foi possível conectar ao servidor.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

useEffect(() => {
    fetchEntradas();
  }, [currentUser, selectedMonth, selectedYear]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'valor') {
      const digits = value.replace(/\D/g, '');
      const newNumericValue = digits === '' ? '' : (Number(digits) / 100);
      setNovaEntrada({ ...novaEntrada, valor: newNumericValue });
      return;
    }

    setNovaEntrada({
      ...novaEntrada,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const adicionarEntrada = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    if (novaEntrada.valor === '' || isNaN(novaEntrada.valor) || Number(novaEntrada.valor) <= 0) {
      toast({ 
        title: "⚠️ Valor inválido", 
        description: "O valor deve ser maior que zero.",
        status: "warning", 
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    
    const payload = { 
      ...novaEntrada, 
      userId,
      valor: Number(novaEntrada.valor),
    };

    try {
      if (entradaParaEditar) {
        await axios.put(`http://localhost:8080/api/entradas/${entradaParaEditar.id}?userId=${userId}`, payload);
        toast({ 
          title: "✅ Entrada editada!", 
          status: "success", 
          duration: 3000,
          position: "top-right",
        });
      } else {
        await axios.post(`http://localhost:8080/api/entradas?userId=${userId}`, payload);
        toast({ 
          title: "🎉 Entrada adicionada!", 
          status: "success", 
          duration: 3000,
          position: "top-right",
        });
      }
      setNovaEntrada({ descricao: "", valor: "", data: "", categoria: "outros" });
      setMostrarFormulario(false);
      setEntradaParaEditar(null);
      fetchEntradas();
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      toast({ 
        title: "❌ Erro ao salvar", 
        status: "error", 
        duration: 3000,
        position: "top-right",
      });
    }
  };

const iniciarEdicao = (entrada) => {
    setNovaEntrada({
      ...entrada,
      valor: Number(entrada.valor),
      categoria: entrada.categoria || "outros",
    });
    setEntradaParaEditar(entrada);
    setMostrarFormulario(true);
  };

  const confirmarExclusao = (id) => {
    setEntradaParaExcluir(id);
    onOpen();
  };

  const excluirEntrada = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    try {
      await axios.delete(`http://localhost:8080/api/entradas/${entradaParaExcluir}?userId=${userId}`);
      toast({ 
        title: "🗑️ Entrada excluída", 
        status: "info", 
        duration: 3000,
        position: "top-right",
      });
      setEntradaParaExcluir(null);
      onClose();
      fetchEntradas();
    } catch (error) {
      console.error("Erro ao excluir entrada:", error);
      toast({ 
        title: "❌ Erro ao excluir", 
        status: "error", 
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const totalEntradas = entradas.reduce((acc, e) => acc + Number(e.valor), 0);
const totalSalarios = entradas.filter(e => e.categoria === "salario").reduce((acc, e) => acc + Number(e.valor), 0);
  const totalOutros = totalEntradas - totalSalarios;

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
              bgGradient="linear(to-r, #11998e, #38ef7d)"
              bgClip="text"
            >
              Entradas
            </Heading>
            <Text color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
              Gerencie suas fontes de renda
            </Text>
          </VStack>

          <Button
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              setNovaEntrada({ descricao: "", valor: "", data: "", categoria: "outros" });
              setEntradaParaEditar(null);
            }}
            size="lg"
            bgGradient="linear(to-r, #11998e, #38ef7d)"
            color="white"
            _hover={{ 
              bgGradient: "linear(to-r, #38ef7d, #11998e)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(56, 239, 125, 0.4)"
            }}
            transition="all 0.3s"
            borderRadius="xl"
            leftIcon={<Text fontSize="xl">{mostrarFormulario ? "✖️" : "➕"}</Text>}
          >
            {mostrarFormulario ? "Cancelar" : "Nova Entrada"}
          </Button>
        </Flex>

        <MonthNavigator
                  month={selectedMonth}
                  year={selectedYear}
                  onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
                  gradient="linear(to-r, #11998e, #38ef7d)"
        />

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <GlassCard gradient="linear(to-br, #11998e, #38ef7d)">
            <Stat>
              <StatLabel color="whiteAlpha.800" fontSize="sm">Total de Entradas</StatLabel>
              <StatNumber fontSize="3xl" color="white">{formatCurrency(totalEntradas)}</StatNumber>
              <StatHelpText color="green.300" mb={0}>
                {entradas.length} {entradas.length === 1 ? 'registro' : 'registros'} este mês
              </StatHelpText>
            </Stat>
          </GlassCard>

          <GlassCard gradient="linear(to-br, #667eea, #764ba2)">
            <Stat>
              <StatLabel color="whiteAlpha.800" fontSize="sm">💼 Salários</StatLabel>
              <StatNumber fontSize="3xl" color="white">{formatCurrency(totalSalarios)}</StatNumber>
          <StatHelpText color="purple.300" mb={0}>
                {entradas.filter(e => e.categoria === "salario").length} recebimento(s)
              </StatHelpText>
            </Stat>
          </GlassCard>

          <GlassCard gradient="linear(to-br, #fc4a1a, #f7b733)">
            <Stat>
              <StatLabel color="whiteAlpha.800" fontSize="sm">💎 Outras Fontes</StatLabel>
              <StatNumber fontSize="3xl" color="white">{formatCurrency(totalOutros)}</StatNumber>
              <StatHelpText color="orange.300" mb={0}>
                Freelances, extras, etc
              </StatHelpText>
            </Stat>
          </GlassCard>
        </SimpleGrid>
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
            <GlassCard gradient="linear(to-br, #11998e, #38ef7d)">
              <VStack spacing={5} align="stretch">
                <Heading size="md" color="white">
                  {entradaParaEditar ? "✏️ Editar Entrada" : "➕ Nova Entrada"}
                </Heading>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    📝 Descrição
                  </FormLabel>
                  <Input
                    placeholder="Ex: Salário, Freelance, Investimento..."
                    name="descricao"
                    value={novaEntrada.descricao}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _placeholder={{ color: 'whiteAlpha.500' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #38ef7d' }}
                    size="lg"
                    borderRadius="xl"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    💵 Valor
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" color="whiteAlpha.600">
                      R$
                    </InputLeftElement>
                    <Input
                      placeholder="0,00"
                      name="valor"
                      type="text"
                      value={formatInputCurrency(novaEntrada.valor)}
                      onChange={handleChange}
                      color="white"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _hover={{ borderColor: 'whiteAlpha.400' }}
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #38ef7d' }}
                      borderRadius="xl"
                      pl={12}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    📅 Data
                  </FormLabel>
                  <DatePicker
                    selected={novaEntrada.data ? new Date(novaEntrada.data) : null}
                    onChange={(date) =>
                      setNovaEntrada({
                        ...novaEntrada,
                        data: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={ptBR}
                    placeholderText="Selecione uma data"
                    withPortal
                    portalId="finanzas-datepicker-portal"
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
                  />
                </FormControl>

        <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    🏷️ Categoria
                  </FormLabel>
                  <Select
                    name="categoria"
                    value={novaEntrada.categoria}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #38ef7d' }}
                    size="lg"
                    borderRadius="xl"
                  >
                    {Object.entries(categoriaConfig).map(([key, cfg]) => (
                      <option key={key} value={key} style={{ backgroundColor: '#191919' }}>
                        {cfg.icon} {cfg.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  onClick={adicionarEntrada}
                  size="lg"
                  bg="white"
                  color="#11998e"
                  _hover={{ 
                    transform: "translateY(-2px)",
                    boxShadow: "xl"
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  fontWeight="bold"
                  leftIcon={<Text>{entradaParaEditar ? "💾" : "✅"}</Text>}
                >
                  {entradaParaEditar ? "Salvar Alterações" : "Adicionar Entrada"}
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
        <VStack spacing={4} align="stretch">
          {entradas.length === 0 ? (
            <GlassCard>
              <VStack py={12} spacing={4}>
                <Text fontSize="6xl">📭</Text>
                <Heading size="md" color="white">Nenhuma entrada registrada</Heading>
                <Text color="whiteAlpha.600" textAlign="center">
                  Nenhuma entrada registrada neste mês.
                </Text>
                <Button
                  onClick={() => setMostrarFormulario(true)}
                  bgGradient="linear(to-r, #11998e, #38ef7d)"
                  color="white"
                  size="lg"
                  borderRadius="xl"
                >
                  ➕ Adicionar Primeira Entrada
                </Button>
              </VStack>
            </GlassCard>
          ) : (
            entradas.sort((a, b) => new Date(b.data) - new Date(a.data)).map((entrada, index) => (
              <MotionBox
                key={entrada.id}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard gradient="linear(to-r, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1))">
                  <Flex
                    justify="space-between"
                    align="center"
                    flexWrap="wrap"
                    gap={4}
                  >
                    <HStack spacing={4} flex={1}>
                  <Flex
                        w={12}
                        h={12}
                        bgGradient={(categoriaConfig[entrada.categoria] || categoriaConfig.outros).gradient}
                        borderRadius="xl"
                        align="center"
                        justify="center"
                        fontSize="2xl"
                        flexShrink={0}
                      >
                        {(categoriaConfig[entrada.categoria] || categoriaConfig.outros).icon}
                      </Flex>
                      <VStack align="start" spacing={1}>
                        <Text color="white" fontWeight="bold" fontSize="lg">
                          {entrada.descricao}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Text fontSize="sm" color="whiteAlpha.600">
                            📅 {formatDate(entrada.data)}
                          </Text>
                          <Badge
                            bgGradient={(categoriaConfig[entrada.categoria] || categoriaConfig.outros).gradient}
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                          >
                            {(categoriaConfig[entrada.categoria] || categoriaConfig.outros).icon} {(categoriaConfig[entrada.categoria] || categoriaConfig.outros).label}
                          </Badge>
                          {entrada.recorrenteId && (
                            <Badge colorScheme="purple" px={2} py={1} borderRadius="md" fontSize="xs">
                              🔁 Automática
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>

                    <HStack spacing={3}>
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="black"
                        color="#38ef7d"
                      >
                        {formatCurrency(entrada.valor)}
                      </Text>
                      <Button
                        size="sm"
                        bgGradient="linear(to-r, #fc4a1a, #f7b733)"
                        color="white"
                        _hover={{ transform: "scale(1.05)" }}
                        onClick={() => iniciarEdicao(entrada)}
                        borderRadius="lg"
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        bgGradient="linear(to-r, #ee0979, #ff6a00)"
                        color="white"
                        _hover={{ transform: "scale(1.05)" }}
                        onClick={() => confirmarExclusao(entrada.id)}
                        borderRadius="lg"
                      >
                        🗑️
                      </Button>
                    </HStack>
                  </Flex>
                </GlassCard>
              </MotionBox>
            ))
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
              Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} borderRadius="xl">
                Cancelar
              </Button>
              <Button
                bgGradient="linear(to-r, #ee0979, #ff6a00)"
                color="white"
                onClick={excluirEntrada}
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

export default Entradas;