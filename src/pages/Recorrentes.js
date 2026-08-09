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
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

const MotionBox = motion(Box);
const BASE_URL = "http://localhost:8080/api/recorrentes";

const formatInputCurrency = (value) => {
  if (!value && value !== 0) return "";
  const numericValue = Number(value);
  const fixed = numericValue.toFixed(2);
  const parts = fixed.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${integerPart},${parts[1]}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

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
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient={gradient} opacity={0.1} pointerEvents="none" />
    )}
    {children}
  </MotionBox>
);

const emptyForm = {
  descricao: "",
  valor: "",
  tipoTransacao: "saida",
  tipoSaida: "fixa",
  salario: false,
  diaVencimento: 5,
  ativa: true,
};

function Recorrentes() {
  const [recorrentes, setRecorrentes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [paraEditar, setParaEditar] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchRecorrentes = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${BASE_URL}?userId=${currentUser.uid}`);
      setRecorrentes(response.data);
    } catch (error) {
      console.error("Erro ao buscar recorrentes:", error);
      toast({ title: "❌ Erro ao carregar", status: "error", duration: 3000, position: "top-right" });
    }
  };

  useEffect(() => {
    fetchRecorrentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "valor") {
      const digits = value.replace(/\D/g, "");
      setForm({ ...form, valor: digits === "" ? "" : Number(digits) / 100 });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const salvar = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    if (!form.descricao || form.valor === "" || isNaN(form.valor) || Number(form.valor) <= 0) {
      toast({ title: "⚠️ Preencha descrição e valor válido", status: "warning", duration: 3000, position: "top-right" });
      return;
    }
    if (!form.diaVencimento || form.diaVencimento < 1 || form.diaVencimento > 28) {
      toast({ title: "⚠️ Dia de vencimento deve ser entre 1 e 28", status: "warning", duration: 3000, position: "top-right" });
      return;
    }

    const payload = { ...form, valor: Number(form.valor), diaVencimento: Number(form.diaVencimento) };

    try {
      if (paraEditar) {
        await axios.put(`${BASE_URL}/${paraEditar.id}?userId=${userId}`, payload);
        toast({ title: "✅ Recorrência editada!", status: "success", duration: 3000, position: "top-right" });
      } else {
        await axios.post(`${BASE_URL}?userId=${userId}`, payload);
        toast({ title: "🎉 Recorrência criada!", status: "success", duration: 3000, position: "top-right" });
      }
      setForm(emptyForm);
      setMostrarFormulario(false);
      setParaEditar(null);
      fetchRecorrentes();
    } catch (error) {
      console.error("Erro ao salvar recorrente:", error);
      toast({ title: "❌ Erro ao salvar", status: "error", duration: 3000, position: "top-right" });
    }
  };

  const iniciarEdicao = (r) => {
    setForm({ ...r, valor: Number(r.valor) });
    setParaEditar(r);
    setMostrarFormulario(true);
  };

  const alternarAtiva = async (r) => {
    if (!currentUser) return;
    try {
      await axios.put(`${BASE_URL}/${r.id}?userId=${currentUser.uid}`, { ...r, ativa: !r.ativa });
      fetchRecorrentes();
    } catch (error) {
      console.error("Erro ao alternar recorrente:", error);
    }
  };

  const confirmarExclusao = (id) => {
    setParaExcluir(id);
    onOpen();
  };

  const excluir = async () => {
    if (!currentUser) return;
    try {
      await axios.delete(`${BASE_URL}/${paraExcluir}?userId=${currentUser.uid}`);
      toast({ title: "🗑️ Recorrência excluída", status: "info", duration: 3000, position: "top-right" });
      setParaExcluir(null);
      onClose();
      fetchRecorrentes();
    } catch (error) {
      console.error("Erro ao excluir recorrente:", error);
      toast({ title: "❌ Erro ao excluir", status: "error", duration: 3000, position: "top-right" });
    }
  };

  return (
    <Box w="100%" maxW="1400px" mx="auto">
      <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} mb={8}>
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" bgGradient="linear(to-r, #a770ef, #cf8bf3)" bgClip="text">
              Recorrências
            </Heading>
            <Text color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
              Contas fixas que se lançam sozinhas todo mês
            </Text>
          </VStack>

          <Button
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              setForm(emptyForm);
              setParaEditar(null);
            }}
            size="lg"
            bgGradient="linear(to-r, #a770ef, #cf8bf3)"
            color="white"
            _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            transition="all 0.3s"
            borderRadius="xl"
            leftIcon={<Text fontSize="xl">{mostrarFormulario ? "✖️" : "➕"}</Text>}
          >
            {mostrarFormulario ? "Cancelar" : "Nova Recorrência"}
          </Button>
        </Flex>
      </MotionBox>

      <AnimatePresence>
        {mostrarFormulario && (
          <MotionBox initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} mb={8}>
            <GlassCard gradient="linear(to-br, #a770ef, #cf8bf3)">
              <VStack spacing={5} align="stretch">
                <Heading size="md" color="white">
                  {paraEditar ? "✏️ Editar Recorrência" : "➕ Nova Recorrência"}
                </Heading>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">📝 Descrição</FormLabel>
                  <Input
                    placeholder="Ex: Aluguel, Netflix, Salário..."
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    size="lg"
                    borderRadius="xl"
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">💵 Valor</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" color="whiteAlpha.600">R$</InputLeftElement>
                      <Input
                        placeholder="0,00"
                        name="valor"
                        value={formatInputCurrency(form.valor)}
                        onChange={handleChange}
                        color="white"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        borderRadius="xl"
                        pl={12}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">📅 Dia do Vencimento</FormLabel>
                    <NumberInput min={1} max={28} value={form.diaVencimento} onChange={(v) => setForm({ ...form, diaVencimento: v })}>
                      <NumberInputField color="white" bg="rgba(255, 255, 255, 0.1)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="xl" size="lg" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">🏷️ Tipo</FormLabel>
                  <Select
                    name="tipoTransacao"
                    value={form.tipoTransacao}
                    onChange={handleChange}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    size="lg"
                    borderRadius="xl"
                  >
                    <option value="saida" style={{ backgroundColor: "#191919" }}>💸 Saída</option>
                    <option value="entrada" style={{ backgroundColor: "#191919" }}>💰 Entrada</option>
                  </Select>
                </FormControl>

                {form.tipoTransacao === "saida" ? (
                  <FormControl>
                    <FormLabel color="whiteAlpha.900" fontSize="sm" fontWeight="semibold">🏷️ Categoria da Saída</FormLabel>
                    <Select
                      name="tipoSaida"
                      value={form.tipoSaida}
                      onChange={handleChange}
                      color="white"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      size="lg"
                      borderRadius="xl"
                    >
                      <option value="fixa" style={{ backgroundColor: "#191919" }}>📌 Fixa</option>
                      <option value="variável" style={{ backgroundColor: "#191919" }}>🔄 Variável</option>
                    </Select>
                  </FormControl>
                ) : (
                  <Flex p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl" align="center" justify="space-between">
                    <Text color="white" fontWeight="semibold">💼 É salário?</Text>
                    <Switch
                      size="lg"
                      colorScheme="purple"
                      isChecked={form.salario}
                      onChange={(e) => setForm({ ...form, salario: e.target.checked })}
                    />
                  </Flex>
                )}

                <Button
                  onClick={salvar}
                  size="lg"
                  bg="white"
                  color="#a770ef"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  fontWeight="bold"
                >
                  {paraEditar ? "💾 Salvar Alterações" : "✅ Criar Recorrência"}
                </Button>
              </VStack>
            </GlassCard>
          </MotionBox>
        )}
      </AnimatePresence>

      <VStack spacing={4} align="stretch">
        {recorrentes.length === 0 ? (
          <GlassCard>
            <VStack py={12} spacing={4}>
              <Text fontSize="6xl">🔁</Text>
              <Heading size="md" color="white">Nenhuma recorrência cadastrada</Heading>
              <Text color="whiteAlpha.600" textAlign="center">
                Cadastre contas fixas (aluguel, assinaturas, salário) para que sejam lançadas automaticamente todo mês
              </Text>
            </VStack>
          </GlassCard>
        ) : (
          recorrentes.map((r) => (
            <GlassCard key={r.id} gradient={r.tipoTransacao === "entrada" ? "linear(to-r, #11998e, #38ef7d)" : "linear(to-r, #ee0979, #ff6a00)"}>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <HStack spacing={4} flex={1}>
                  <Flex
                    w={12} h={12}
                    bgGradient={r.tipoTransacao === "entrada" ? "linear(to-br, #11998e, #38ef7d)" : "linear(to-br, #ee0979, #ff6a00)"}
                    borderRadius="xl" align="center" justify="center" fontSize="2xl" flexShrink={0}
                    opacity={r.ativa ? 1 : 0.4}
                  >
                    {r.tipoTransacao === "entrada" ? "💰" : "💸"}
                  </Flex>
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontWeight="bold" fontSize="lg" opacity={r.ativa ? 1 : 0.5}>
                      {r.descricao}
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="whiteAlpha.600">📅 Todo dia {r.diaVencimento}</Text>
                      {!r.ativa && <Badge colorScheme="gray" fontSize="xs">Pausada</Badge>}
                    </HStack>
                  </VStack>
                </HStack>

                <HStack spacing={3}>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black" color={r.tipoTransacao === "entrada" ? "#38ef7d" : "#ff6a00"} opacity={r.ativa ? 1 : 0.5}>
                    {r.tipoTransacao === "entrada" ? "+" : "-"} {formatCurrency(r.valor)}
                  </Text>
                  <Switch isChecked={r.ativa} onChange={() => alternarAtiva(r)} colorScheme="purple" size="lg" />
                  <Button size="sm" bgGradient="linear(to-r, #fc4a1a, #f7b733)" color="white" onClick={() => iniciarEdicao(r)} borderRadius="lg">✏️</Button>
                  <Button size="sm" bgGradient="linear(to-r, #ee0979, #ff6a00)" color="white" onClick={() => confirmarExclusao(r.id)} borderRadius="lg">🗑️</Button>
                </HStack>
              </Flex>
            </GlassCard>
          ))
        )}
      </VStack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay backdropFilter="blur(10px)">
          <AlertDialogContent bg="rgba(26, 32, 44, 0.95)" backdropFilter="blur(20px)" border="1px solid" borderColor="whiteAlpha.200" borderRadius="2xl" mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">🗑️ Confirmar Exclusão</AlertDialogHeader>
            <AlertDialogBody color="whiteAlpha.800">
              Tem certeza que deseja excluir esta recorrência? Transações já lançadas não serão apagadas.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} borderRadius="xl">Cancelar</Button>
              <Button bgGradient="linear(to-r, #ee0979, #ff6a00)" color="white" onClick={excluir} ml={3} borderRadius="xl">Excluir</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Recorrentes;