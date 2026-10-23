import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  Heading,
  SimpleGrid,
  Badge,
  Flex,
  InputGroup,
  InputLeftElement,
  Progress,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import MonthNavigator from "../components/MonthNavigator";
import { categoriasSaida } from "../utils/categoriasSaida";
import { Sk, CardsSkeleton, SlowServerHint } from "../components/Skeletons";
import { API_URL } from "../config";

const MotionBox = motion(Box);
const API = API_URL;

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatInputCurrency = (value) => {
  if (!value && value !== 0) return "";
  const fixed = Number(value).toFixed(2);
  const parts = fixed.split(".");
  return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${parts[1]}`;
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
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient={gradient} opacity={0.1} pointerEvents="none" />
    )}
    {children}
  </MotionBox>
);

function Orcamentos() {
  const [carregando, setCarregando] = useState(true);
  const [saidas, setSaidas] = useState([]);
  const [orcamentos, setOrcamentos] = useState({}); // categoria -> limite salvo
  const [limites, setLimites] = useState({}); // categoria -> valor digitado
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchDados = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const [saidasRes, orcRes] = await Promise.all([
        axios.get(`${API}/saidas?userId=${userId}`),
        axios.get(`${API}/orcamentos?userId=${userId}`),
      ]);
      setSaidas(saidasRes.data);
      const mapa = {};
      orcRes.data.forEach((o) => {
        mapa[o.categoria] = Number(o.limite);
      });
      setOrcamentos(mapa);
      setLimites(mapa);
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
      setCarregando(false);
      toast({
        title: "❌ Erro ao carregar",
        description: "Não foi possível conectar ao servidor.",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    fetchDados();
  }, [currentUser]);

  const gastos = {};
  saidas.forEach((s) => {
    if (!s.data || s.metaId) return;
    const [ano, mes] = s.data.split("-").map(Number);
    if (mes - 1 === selectedMonth && ano === selectedYear) {
      const cat = categoriasSaida[s.categoria] ? s.categoria : "outros";
      gastos[cat] = (gastos[cat] || 0) + Number(s.valor);
    }
  });

  const handleLimiteChange = (cat, value) => {
    const digits = value.replace(/\D/g, "");
    setLimites((prev) => ({ ...prev, [cat]: digits === "" ? "" : Number(digits) / 100 }));
  };

  const salvarLimite = async (cat) => {
    const valor = Number(limites[cat]);
    if (!valor || valor <= 0) {
      toast({ title: "⚠️ Informe um limite maior que zero", status: "warning", duration: 3000, position: "top-right" });
      return;
    }
    try {
      await axios.put(`${API}/orcamentos/${cat}?userId=${currentUser.uid}`, { limite: valor });
      toast({ title: "✅ Orçamento salvo!", status: "success", duration: 3000, position: "top-right" });
      fetchDados();
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      toast({ title: "❌ Erro ao salvar", status: "error", duration: 3000, position: "top-right" });
    }
  };

  const removerLimite = async (cat) => {
    try {
      await axios.delete(`${API}/orcamentos/${cat}?userId=${currentUser.uid}`);
      toast({ title: "🗑️ Orçamento removido", status: "info", duration: 3000, position: "top-right" });
      fetchDados();
    } catch (error) {
      console.error("Erro ao remover orçamento:", error);
      toast({ title: "❌ Erro ao remover", status: "error", duration: 3000, position: "top-right" });
    }
  };

  const catsComLimite = Object.keys(categoriasSaida).filter((c) => orcamentos[c] > 0);
  const totalLimite = catsComLimite.reduce((acc, c) => acc + orcamentos[c], 0);
  const totalGasto = catsComLimite.reduce((acc, c) => acc + (gastos[c] || 0), 0);
  const percentualGeral = totalLimite > 0 ? (totalGasto / totalLimite) * 100 : 0;
  const emAlerta = catsComLimite.filter((c) => (gastos[c] || 0) / orcamentos[c] >= 0.8);

  return (
    <Box w="100%" maxW="1400px" mx="auto">
      <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} mb={8}>
        <VStack align="start" spacing={1} mb={6}>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" bgGradient="linear(to-r, #f7971e, #ffd200)" bgClip="text">
            Orçamentos
          </Heading>
          <Text color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
            Defina um limite mensal por categoria e acompanhe seus gastos
          </Text>
        </VStack>

        <MonthNavigator
          month={selectedMonth}
          year={selectedYear}
          onChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
          gradient="linear(to-r, #f7971e, #ffd200)"
        />

        <GlassCard gradient="linear(to-br, #f7971e, #ffd200)">
          <VStack align="stretch" spacing={3}>
            <Text color="whiteAlpha.800" fontSize="sm" fontWeight="semibold">
              🧮 Resumo das categorias com limite
            </Text>
            {carregando ? (
              <Sk h="60px" />
            ) : catsComLimite.length === 0 ? (
              <Text color="whiteAlpha.700">Nenhum limite definido ainda. Defina abaixo para começar.</Text>
            ) : (
              <>
                <Heading size="lg" color="white">
                  {formatCurrency(totalGasto)} / {formatCurrency(totalLimite)}
                </Heading>
                <Progress
                  value={Math.min(100, percentualGeral)}
                  size="md"
                  colorScheme={percentualGeral >= 100 ? "red" : percentualGeral >= 80 ? "yellow" : "green"}
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.1)"
                />
                <Text color={emAlerta.length > 0 ? "yellow.300" : "green.300"} fontSize="sm">
                  {emAlerta.length > 0
                    ? `⚠️ ${emAlerta.length} categoria(s) em 80% ou mais do limite`
                    : "✅ Todas as categorias dentro do orçamento"}
                </Text>
              </>
            )}
          </VStack>
        </GlassCard>
      </MotionBox>

      {carregando && (
        <VStack spacing={4} align="stretch">
          <CardsSkeleton count={6} columns={{ base: 1, md: 2, lg: 3 }} minH="230px" />
          <SlowServerHint />
        </VStack>
      )}

      <SimpleGrid display={carregando ? "none" : "grid"} columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {Object.entries(categoriasSaida).map(([key, cfg]) => {
          const gasto = gastos[key] || 0;
          const limite = orcamentos[key] || 0;
          const pct = limite > 0 ? (gasto / limite) * 100 : 0;
          const scheme = pct >= 100 ? "red" : pct >= 80 ? "yellow" : "green";
          const alterado = Number(limites[key] || 0) !== limite;

          return (
            <GlassCard key={key}>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <HStack>
                    <Text fontSize="2xl">{cfg.icon}</Text>
                    <Text color="white" fontWeight="bold" fontSize="lg">{cfg.label}</Text>
                  </HStack>
                  {limite > 0 && (
                    <Badge colorScheme={scheme} borderRadius="full" px={3} py={1}>
                      {pct.toFixed(0)}%
                    </Badge>
                  )}
                </HStack>

                <Flex justify="space-between" align="baseline">
                  <Text color="white" fontSize="xl" fontWeight="semibold">{formatCurrency(gasto)}</Text>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {limite > 0 ? `de ${formatCurrency(limite)}` : "sem limite"}
                  </Text>
                </Flex>

                {limite > 0 && (
                  <>
                    <Progress
                      value={Math.min(100, pct)}
                      size="md"
                      colorScheme={scheme}
                      borderRadius="full"
                      bg="rgba(255, 255, 255, 0.1)"
                    />
                    <Text fontSize="xs" color={pct >= 100 ? "red.300" : pct >= 80 ? "yellow.300" : "green.300"}>
                      {pct >= 100
                        ? `🚨 Limite estourado (excedeu ${formatCurrency(gasto - limite)})`
                        : pct >= 80
                        ? `⚠️ Perto do limite (restam ${formatCurrency(limite - gasto)})`
                        : `✅ Dentro do orçamento (restam ${formatCurrency(limite - gasto)})`}
                    </Text>
                  </>
                )}

                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none" color="whiteAlpha.600">R$</InputLeftElement>
                  <Input
                    placeholder="Limite mensal"
                    value={formatInputCurrency(limites[key])}
                    onChange={(e) => handleLimiteChange(key, e.target.value)}
                    color="white"
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _placeholder={{ color: "whiteAlpha.500" }}
                    borderRadius="xl"
                    pl={10}
                  />
                </InputGroup>

                <HStack>
                  <Button
                    size="sm"
                    flex={1}
                    onClick={() => salvarLimite(key)}
                    isDisabled={!alterado}
                    bgGradient="linear(to-r, #f7971e, #ffd200)"
                    color="black"
                    borderRadius="lg"
                  >
                    Salvar limite
                  </Button>
                  {limite > 0 && (
                    <Button size="sm" variant="ghost" color="red.300" onClick={() => removerLimite(key)} borderRadius="lg">
                      🗑️
                    </Button>
                  )}
                </HStack>
              </VStack>
            </GlassCard>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

export default Orcamentos;