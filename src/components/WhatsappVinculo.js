import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Divider,
  Link,
  useToast,
  useClipboard,
} from "@chakra-ui/react";
import axios from "axios";

const API = "https://finanzas-backend-rmik.onrender.com/api";

const formatarTempo = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function WhatsappVinculo() {
  const toast = useToast();
  const [carregado, setCarregado] = useState(false);
  const [numeros, setNumeros] = useState([]);
  const [codigo, setCodigo] = useState(null);
  const [expiraEm, setExpiraEm] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [gerando, setGerando] = useState(false);
  const qtdAntes = useRef(0);
  const { onCopy, hasCopied, setValue } = useClipboard("");

  const carregar = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/whatsapp/vinculos`);
      setNumeros(data.numeros || []);
      return data;
    } catch (error) {
      console.error("Erro ao buscar vínculos do WhatsApp:", error);
      return null;
    } finally {
      setCarregado(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setValue(codigo ? `CONECTAR ${codigo}` : "");
  }, [codigo, setValue]);

  // Contagem regressiva do código
  useEffect(() => {
    if (!expiraEm) return undefined;
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((expiraEm - Date.now()) / 1000));
      setSegundos(s);
      if (s === 0) {
        setCodigo(null);
        setExpiraEm(null);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [expiraEm]);

  useEffect(() => {
    if (!codigo) return undefined;
    const t = setInterval(async () => {
      const dados = await carregar();
      if (dados && (dados.numeros || []).length > qtdAntes.current) {
        setCodigo(null);
        setExpiraEm(null);
        toast({ title: "✅ WhatsApp conectado!", status: "success", duration: 4000, position: "top-right" });
      }
    }, 4000);
    return () => clearInterval(t);
  }, [codigo, carregar, toast]);

  const gerarCodigo = async () => {
    setGerando(true);
    try {
      const { data } = await axios.post(`${API}/whatsapp/codigo`);
      qtdAntes.current = numeros.length;
      setCodigo(data.codigo);
      const fim = Date.now() + data.expiraEmSegundos * 1000;
      setExpiraEm(fim);
      setSegundos(data.expiraEmSegundos);
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      toast({ title: "❌ Não foi possível gerar o código", status: "error", duration: 3000, position: "top-right" });
    } finally {
      setGerando(false);
    }
  };

  const desconectar = async () => {
    if (!window.confirm("Desconectar o WhatsApp desta conta? O bot deixará de ter acesso aos seus dados.")) return;
    try {
      await axios.delete(`${API}/whatsapp/vinculos`);
      setNumeros([]);
      toast({ title: "🔌 WhatsApp desconectado", status: "info", duration: 3000, position: "top-right" });
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      toast({ title: "❌ Erro ao desconectar", status: "error", duration: 3000, position: "top-right" });
    }
  };

  const conectado = numeros.length > 0;

  return (
    <VStack align="stretch" spacing={4}>
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <HStack>
          <Text fontSize="3xl">💬</Text>
          <VStack align="start" spacing={0}>
            <Heading size="md" color="white">Integração WhatsApp Bot</Heading>
            <Text fontSize="sm" color="whiteAlpha.700">Gerencie suas finanças pelo WhatsApp</Text>
          </VStack>
        </HStack>
        {carregado && (
          <Badge colorScheme={conectado ? "green" : "gray"} fontSize="xs" px={3} py={1} borderRadius="full">
            {conectado ? "Conectado" : "Não conectado"}
          </Badge>
        )}
      </HStack>

      <Divider borderColor="whiteAlpha.300" />

      {conectado && (
        <Box p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl">
          <Text color="whiteAlpha.800" fontSize="sm" mb={2}>📱 Números conectados:</Text>
          {numeros.map((n) => (
            <Text key={n} color="white" fontFamily="mono">{n}</Text>
          ))}
          <Button mt={3} size="sm" colorScheme="red" variant="outline" onClick={desconectar} borderRadius="lg">
            Desconectar
          </Button>
        </Box>
      )}

      {codigo ? (
        <Box p={4} bg="rgba(0, 0, 0, 0.3)" borderRadius="xl" textAlign="center">
          <Text color="whiteAlpha.800" fontSize="sm" mb={2}>
            Envie esta mensagem para o bot no WhatsApp:
          </Text>
          <Text color="green.300" fontFamily="mono" fontSize="2xl" fontWeight="bold" letterSpacing="widest">
            CONECTAR {codigo}
          </Text>
          <Text color="whiteAlpha.600" fontSize="xs" mt={2}>
            ⏱️ Expira em {formatarTempo(segundos)}. O código vale uma única vez.
          </Text>
          <Button mt={3} size="sm" onClick={onCopy} borderRadius="lg">
            {hasCopied ? "✓ Copiado" : "Copiar mensagem"}
          </Button>
        </Box>
      ) : (
        <Button
          onClick={gerarCodigo}
          isLoading={gerando}
          size="lg"
          bg="white"
          color="#25d366"
          borderRadius="xl"
          _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
          transition="all 0.3s"
        >
          {conectado ? "Conectar outro número" : "Gerar código de conexão"}
        </Button>
      )}

      <Text color="whiteAlpha.600" fontSize="xs">
        🔒 Por segurança, o código expira em 10 minutos e só pode ser usado uma vez. Nunca compartilhe o código com ninguém.
      </Text>

      <Button
        as={Link}
        href="https://wa.me/5511960428846"
        isExternal
        variant="ghost"
        color="whiteAlpha.800"
        _hover={{ bg: "whiteAlpha.200", textDecoration: "none" }}
        borderRadius="xl"
        leftIcon={<Text fontSize="xl">💬</Text>}
      >
        Abrir WhatsApp
      </Button>
    </VStack>
  );
}

export default WhatsappVinculo;