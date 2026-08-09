import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Select,
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
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import MonthNavigator from "../components/MonthNavigator";

const MotionBox = motion(Box);

const formatInputCurrency = (value) => {
  if (!value && value !== 0) return "";
  const numericValue = Number(value);
  const fixed = numericValue.toFixed(2);
  const parts = fixed.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

function Saidas() {
  const [saidas, setSaidas] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [novaSaida, setNovaSaida] = useState({
    descricao: "",
    valor: "",
    data: "",
    tipo: "variável",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [saidaParaExcluir, setSaidaParaExcluir] = useState(null);
  const [saidaParaEditar, setSaidaParaEditar] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchSaidas = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const response = await axios.get(`http://localhost:8080/api/saidas?userId=${userId}`);

const saidasDoMes = response.data.filter(saida => {
        const dataSaida = new Date(saida.data);
        return dataSaida.getMonth() === selectedMonth && dataSaida.getFullYear() === selectedYear;
      });
      setSaidas(saidasDoMes);
    } catch (error) {
      console.error("Erro ao buscar saídas:", error);
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
    fetchSaidas();
  }, [currentUser, selectedMonth, selectedYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "valor") {
      const digits = value.replace(/\D/g, "");
      const newNumericValue = digits === "" ? "" : Number(digits) / 100;
      setNovaSaida({ ...novaSaida, valor: newNumericValue });
      return;
    }

    setNovaSaida({ ...novaSaida, [name]: value });
  };

  const adicionarSaida = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    if (novaSaida.valor === "" || isNaN(novaSaida.valor) || Number(novaSaida.valor) <= 0) {
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
      ...novaSaida,
      userId,
      valor: Number(novaSaida.valor),
    };

    try {
      if (saidaParaEditar) {
        await axios.put(`http://localhost:8080/api/saidas/${saidaParaEditar.id}?userId=${userId}`, payload);
        toast({ 
          title: "✅ Saída editada!", 
          status: "success", 
          duration: 3000,
          position: "top-right",
        });
      } else {
        await axios.post(`http://localhost:8080/api/saidas?userId=${userId}`, payload);
        toast({ 
          title: "🎉 Saída adicionada!", 
          status: "success", 
          duration: 3000,
          position: "top-right",
        });
      }

      setNovaSaida({ descricao: "", valor: "", data: "", tipo: "variável" });
      setMostrarFormulario(false);
      setSaidaParaEditar(null);
      fetchSaidas();
    } catch (error) {
      console.error("Erro ao salvar saída:", error);
      toast({ 
        title: "❌ Erro ao salvar", 
        status: "error", 
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const iniciarEdicao = (saida) => {
    setNovaSaida({
      ...saida,
      valor: Number(saida.valor),
    });
    setSaidaParaEditar(saida);
    setMostrarFormulario(true);
  };

  const confirmarExclusao = (id) => {
    setSaidaParaExcluir(id);
    onOpen();
  };

  const excluirSaida = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    try {
      await axios.delete(`http://localhost:8080/api/saidas/${saidaParaExcluir}?userId=${userId}`);
      toast({ 
        title: "🗑️ Saída excluída", 
        status: "info", 
        duration: 3000,
        position: "top-right",
      });
      setSaidaParaExcluir(null);
      onClose();
      fetchSaidas();
    } catch (error) {
      console.error("Erro ao excluir saída:", error);
      toast({ 
        title: "❌ Erro ao excluir", 
        status: "error", 
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatType = (typeString) =>
    typeString === "variável" ? "Variável" : "Fixa";

  const totalSaidas = saidas.reduce((acc, s) => acc + Number(s.valor), 0);
  const saidasFixas = saidas.filter(s => s.tipo === "fixa").reduce((acc, s) => acc + Number(s.valor), 0);
  const saidasVariaveis = totalSaidas - saidasFixas;
  const percentualFixas = totalSaidas > 0 ? (saidasFixas / totalSaidas) * 100 : 0;

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
              bgGradient="linear(to-r, #ee0979, #ff6a00)"
              bgClip="text"
            >
              Saídas
            </Heading>
            <Text color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
              Controle seus gastos e despesas
            </Text>
          </VStack>

          <Button
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              setNovaSaida({ descricao: "", valor: "", data: "", tipo: "variável" });
              setSaidaParaEditar(null);
            }}
            size="lg"
            bgGradient="linear(to-r, #ee0979, #ff6a00)"
            color="white"
            _hover={{ 
              bgGradient: "linear(to-r, #ff6a00, #ee0979)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(238, 9, 121, 0.4)"
            }}
            transition="all 0.3s"
            borderRadius="xl"
            leftIcon={<Text fontSize="xl">{mostrarFormulario ? "✖️" : "➕"}</Text>}
          >
            {mostrarFormulario ? "Cancelar" : "Nova Saída"}
          </Button>
        </Flex>

         <MonthNavigator
          month={selectedMonth}
          year={selectedYear}
          onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
          gradient="linear(to-r, #ee0979, #ff6a00)"
        />

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <GlassCard gradient="linear(to-br, #ee0979, #ff6a00)">
            <Stat>
              <StatLabel color="whiteAlpha.800" fontSize="sm">Total de Saídas</StatLabel>
              <StatNumber fontSize="3xl" color="white">{formatCurrency(totalSaidas)}</StatNumber>
              <StatHelpText color="red.300" mb={0}>
                {saidas.length} {saidas.length === 1 ? 'registro' : 'registros'} este mês
              </StatHelpText>
            </Stat>
          </GlassCard>

          <GlassCard gradient="linear(to-br, #667eea, #764ba2)">
            <Stat>
              <StatLabel color="whiteAlpha.800" fontSize="sm">📌 Despesas Fixas</StatLabel>
              <StatNumber fontSize="3xl" color="white">{formatCurrency(saidasFixas)}</StatNumber>
              <StatHelpText color="purple.300" mb={0}>
                {saidas.filter(s => s.tipo === "fixa").length} despesa(s) fixas
              </StatHelpText>
            </Stat>
          </GlassCard>

          <GlassCard gradient="linear(to-br, #fc4a1a, #f7b733)">
            <Stat>
              <StatLabel color="whiteAlpha.800" fontSize="sm">🔄 Despesas Variáveis</StatLabel>
              <StatNumber fontSize="3xl" color="white">{formatCurrency(saidasVariaveis)}</StatNumber>
              <StatHelpText color="orange.300" mb={0}>
                {saidas.filter(s => s.tipo === "variável").length} despesa(s) variáveis
              </StatHelpText>
            </Stat>
          </GlassCard>
        </SimpleGrid>

        {totalSaidas > 0 && (
          <GlassCard mt={6}>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text color="white" fontWeight="semibold">📊 Distribuição de Gastos</Text>
                <Badge bgGradient="linear(to-r, #667eea, #764ba2)" color="white" px={3} py={1} borderRadius="full">
                  {percentualFixas.toFixed(0)}% Fixas
                </Badge>
              </HStack>
              <Progress
                value={percentualFixas}
                size="lg"
                colorScheme="purple"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
              />
              <HStack justify="space-between" fontSize="sm" color="whiteAlpha.700">
                <Text>💜 Fixas: {formatCurrency(saidasFixas)}</Text>
                <Text>🧡 Variáveis: {formatCurrency(saidasVariaveis)}</Text>
              </HStack>
            </VStack>
          </GlassCard>
        )}
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
            <GlassCard gradient="linear(to-br, #ee0979, #ff6a00)">
              <VStack spacing={5} align="stretch">
                <Heading size="md" color="white">
                  {saidaParaEditar ? "✏️ Editar Saída" : "➕ Nova Saída"}
                </Heading>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">
                    📝 Descrição
                  </FormLabel>
                  <Input
                    placeholder="Ex: Aluguel, Mercado, Conta de Luz..."
                    name="descricao"
                    value={novaSaida.descricao}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _placeholder={{ color: 'whiteAlpha.500' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'red.400', boxShadow: '0 0 0 1px #ff6a00' }}
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
                      value={formatInputCurrency(novaSaida.valor)}
                      onChange={handleChange}
                      color="white"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _hover={{ borderColor: 'whiteAlpha.400' }}
                      _focus={{ borderColor: 'red.400', boxShadow: '0 0 0 1px #ff6a00' }}
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
                    selected={novaSaida.data ? new Date(novaSaida.data) : null}
                    onChange={(date) =>
                      setNovaSaida({
                        ...novaSaida,
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
                    🏷️ Tipo de Despesa
                  </FormLabel>
                  <Select
                    name="tipo"
                    value={novaSaida.tipo}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'red.400', boxShadow: '0 0 0 1px #ff6a00' }}
                    size="lg"
                    borderRadius="xl"
                    icon={<Text>▼</Text>}
                  >
                    <option value="fixa" style={{backgroundColor: '#191919'}}>📌 Fixa (Aluguel, Assinatura, etc)</option>
                    <option value="variável" style={{backgroundColor: '#191919'}}>🔄 Variável (Mercado, Lazer, etc)</option>
                  </Select>
                </FormControl>

                <Button
                  onClick={adicionarSaida}
                  size="lg"
                  bg="white"
                  color="#ee0979"
                  _hover={{ 
                    transform: "translateY(-2px)",
                    boxShadow: "xl"
                  }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  fontWeight="bold"
                  leftIcon={<Text>{saidaParaEditar ? "💾" : "✅"}</Text>}
                >
                  {saidaParaEditar ? "Salvar Alterações" : "Adicionar Saída"}
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
          {saidas.length === 0 ? (
            <GlassCard>
              <VStack py={12} spacing={4}>
                <Text fontSize="6xl">📭</Text>
                <Heading size="md" color="white">Nenhuma saída registrada</Heading>
                <Text color="whiteAlpha.600" textAlign="center">
                  Nenhuma saída registrada neste mês.
                </Text>
                <Button
                  onClick={() => setMostrarFormulario(true)}
                  bgGradient="linear(to-r, #ee0979, #ff6a00)"
                  color="white"
                  size="lg"
                  borderRadius="xl"
                >
                  ➕ Adicionar Primeira Saída
                </Button>
              </VStack>
            </GlassCard>
          ) : (
            saidas.sort((a, b) => new Date(b.data) - new Date(a.data)).map((saida, index) => (
              <MotionBox
                key={saida.id}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard gradient="linear(to-r, rgba(238, 9, 121, 0.1), rgba(255, 106, 0, 0.1))">
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
                        bgGradient={saida.tipo === "fixa" ? "linear(to-br, #667eea, #764ba2)" : "linear(to-br, #fc4a1a, #f7b733)"}
                        borderRadius="xl"
                        align="center"
                        justify="center"
                        fontSize="2xl"
                        flexShrink={0}
                      >
                        {saida.tipo === "fixa" ? "📌" : "🔄"}
                      </Flex>
                      <VStack align="start" spacing={1}>
                        <Text color="white" fontWeight="bold" fontSize="lg">
                          {saida.descricao}
                        </Text>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="whiteAlpha.600">
                            📅 {formatDate(saida.data)}
                          </Text>
                          <Badge
                            bgGradient={saida.tipo === "fixa" ? "linear(to-r, #667eea, #764ba2)" : "linear(to-r, #fc4a1a, #f7b733)"}
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                          >
                            {saida.tipo === "fixa" ? "📌 Fixa" : "🔄 Variável"}
                          </Badge>
                          {saida.recorrenteId && (
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
                        color="#ff6a00"
                      >
                        -{formatCurrency(saida.valor)}
                      </Text>
                      <Button
                        size="sm"
                        bgGradient="linear(to-r, #fc4a1a, #f7b733)"
                        color="white"
                        _hover={{ transform: "scale(1.05)" }}
                        onClick={() => iniciarEdicao(saida)}
                        borderRadius="lg"
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        bgGradient="linear(to-r, #ee0979, #ff6a00)"
                        color="white"
                        _hover={{ transform: "scale(1.05)" }}
                        onClick={() => confirmarExclusao(saida.id)}
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
              Tem certeza que deseja excluir esta saída? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} borderRadius="xl">
                Cancelar
              </Button>
              <Button
                bgGradient="linear(to-r, #ee0979, #ff6a00)"
                color="white"
                onClick={excluirSaida}
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

export default Saidas;