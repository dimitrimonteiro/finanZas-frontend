import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Flex,
  Collapse,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { API_URL } from "../config";

const API = "`${API_URL}/metas`";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatInputCurrency = (value) => {
  if (!value && value !== 0) return "";
  const fixed = Number(value).toFixed(2);
  const parts = fixed.split(".");
  return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${parts[1]}`;
};

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

function AportesMeta({ meta, userId, onChange }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [valor, setValor] = useState("");
  const [data, setData] = useState(hojeISO());
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [aportes, setAportes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const restante = Math.max(
    0,
    Math.round((Number(meta.valorObjetivo) - Number(meta.valorAtual)) * 100) / 100
  );
  const concluida = restante <= 0;

  const carregarAportes = async () => {
    setCarregando(true);
    try {
      const res = await axios.get(`${API}/${meta.id}/aportes?userId=${userId}`);
      setAportes(res.data);
    } catch (error) {
      console.error("Erro ao buscar aportes:", error);
      toast({ title: "❌ Erro ao carregar histórico", status: "error", duration: 3000, position: "top-right" });
    } finally {
      setCarregando(false);
    }
  };

  const alternarHistorico = () => {
    const abrir = !historicoAberto;
    setHistoricoAberto(abrir);
    if (abrir) carregarAportes();
  };

  const abrirModal = () => {
    setValor("");
    setData(hojeISO());
    setObs("");
    onOpen();
  };

  const handleValorChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setValor(digits === "" ? "" : Number(digits) / 100);
  };

  const salvar = async () => {
    const v = Number(valor);
    if (!v || v <= 0) {
      toast({ title: "⚠️ Informe um valor maior que zero", status: "warning", duration: 3000, position: "top-right" });
      return;
    }
    if (v > restante) {
      toast({
        title: "⚠️ Aporte maior que o necessário",
        description: `O máximo para esta meta é ${formatCurrency(restante)}.`,
        status: "warning",
        duration: 4000,
        position: "top-right",
      });
      return;
    }
    if (!data) {
      toast({ title: "⚠️ Informe a data do aporte", status: "warning", duration: 3000, position: "top-right" });
      return;
    }

    setSalvando(true);
    try {
      await axios.post(`${API}/${meta.id}/aportes?userId=${userId}`, {
        valor: v,
        data,
        descricao: obs,
      });
      toast({
        title: v >= restante ? "🎉 Meta alcançada!" : "💰 Aporte registrado!",
        description: v >= restante ? "Parabéns, você chegou ao objetivo!" : undefined,
        status: "success",
        duration: 4000,
        position: "top-right",
      });
      onClose();
      await onChange();
      if (historicoAberto) carregarAportes();
    } catch (error) {
      const msg =
        typeof error.response?.data === "string"
          ? error.response.data
          : "Não foi possível registrar o aporte.";
      toast({ title: "❌ Erro ao salvar", description: msg, status: "error", duration: 4000, position: "top-right" });
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (aporte) => {
    if (
      !window.confirm(
        "Remover este aporte? O valor será descontado da meta e a saída correspondente será excluída."
      )
    ) {
      return;
    }
    try {
      await axios.delete(`${API}/${meta.id}/aportes/${aporte.id}?userId=${userId}`);
      toast({ title: "🗑️ Aporte removido", status: "info", duration: 3000, position: "top-right" });
      await onChange();
      carregarAportes();
    } catch (error) {
      console.error("Erro ao remover aporte:", error);
      toast({ title: "❌ Erro ao remover", status: "error", duration: 3000, position: "top-right" });
    }
  };

  const campoStyle = {
    color: "white",
    bg: "rgba(255, 255, 255, 0.1)",
    border: "1px solid",
    borderColor: "whiteAlpha.300",
    _placeholder: { color: "whiteAlpha.500" },
    borderRadius: "xl",
  };

  return (
    <Box>
      <HStack spacing={2} flexWrap="wrap">
        <Button
          size="sm"
          onClick={abrirModal}
          isDisabled={concluida}
          bgGradient="linear(to-r, #11998e, #38ef7d)"
          color="white"
          borderRadius="lg"
          leftIcon={<Text>{concluida ? "✅" : "💰"}</Text>}
          _hover={{ transform: "translateY(-1px)" }}
        >
          {concluida ? "Meta concluída" : "Novo aporte"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          color="whiteAlpha.800"
          _hover={{ bg: "whiteAlpha.200" }}
          borderRadius="lg"
          onClick={alternarHistorico}
        >
          {historicoAberto ? "Ocultar histórico" : "📜 Ver histórico"}
        </Button>
      </HStack>

      <Collapse in={historicoAberto} animateOpacity>
        <VStack align="stretch" spacing={2} mt={3}>
          {carregando ? (
            <Text color="whiteAlpha.600" fontSize="sm">Carregando...</Text>
          ) : aportes.length === 0 ? (
            <Text color="whiteAlpha.600" fontSize="sm">
              Nenhum aporte registrado ainda. Use "Novo aporte" para começar.
            </Text>
          ) : (
            aportes.map((a) => (
              <Flex
                key={a.id}
                justify="space-between"
                align="center"
                p={3}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="xl"
                gap={2}
              >
                <VStack align="start" spacing={0} flex={1} minW={0}>
                  <Text color="white" fontSize="sm" fontWeight="semibold" noOfLines={1}>
                    {a.descricao}
                  </Text>
                  <Text color="whiteAlpha.600" fontSize="xs">📅 {formatDate(a.data)}</Text>
                </VStack>
                <Text color="#38ef7d" fontWeight="bold" fontSize="sm" whiteSpace="nowrap">
                  + {formatCurrency(a.valor)}
                </Text>
                <Button size="xs" variant="ghost" color="red.300" onClick={() => remover(a)} aria-label="Remover aporte">
                  🗑️
                </Button>
              </Flex>
            ))
          )}
        </VStack>
      </Collapse>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(26, 32, 44, 0.97)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="2xl"
          mx={4}
          color="white"
        >
          <ModalHeader>💰 Novo aporte: {meta.nomeMeta}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="whiteAlpha.700">
                Falta {formatCurrency(restante)} para atingir a meta. O aporte será lançado também em Saídas.
              </Text>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">💵 Valor</FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" color="whiteAlpha.600">R$</InputLeftElement>
                  <Input
                    placeholder="0,00"
                    value={formatInputCurrency(valor)}
                    onChange={handleValorChange}
                    pl={12}
                    {...campoStyle}
                  />
                </InputGroup>
                <Button
                  size="xs"
                  variant="link"
                  color="green.300"
                  mt={2}
                  onClick={() => setValor(restante)}
                >
                  Usar o que falta ({formatCurrency(restante)})
                </Button>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">📅 Data</FormLabel>
                <Input
                  type="date"
                  size="lg"
                  value={data}
                  max={hojeISO()}
                  onChange={(e) => setData(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  {...campoStyle}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">📝 Observação (opcional)</FormLabel>
                <Input
                  size="lg"
                  placeholder="Ex: sobra do mês, bônus..."
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  maxLength={80}
                  {...campoStyle}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              onClick={salvar}
              isLoading={salvando}
              bgGradient="linear(to-r, #11998e, #38ef7d)"
              color="white"
              borderRadius="xl"
            >
              Registrar aporte
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default AportesMeta;