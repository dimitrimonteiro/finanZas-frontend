import React, { useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Portal,
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotificacoes } from "../hooks/useNotificacoes";

const estilos = {
  danger: { icone: "🚨", cor: "red.300", borda: "rgba(252, 129, 129, 0.35)" },
  warning: { icone: "⚠️", cor: "yellow.300", borda: "rgba(246, 224, 94, 0.3)" },
  info: { icone: "💡", cor: "blue.300", borda: "rgba(99, 179, 237, 0.3)" },
  success: { icone: "🎉", cor: "green.300", borda: "rgba(104, 211, 145, 0.3)" },
};

function NotificationBell() {
  const {
    notificacoes,
    naoLidas,
    carregando,
    refresh,
    marcarComoLida,
    marcarTodasComoLidas,
  } = useNotificacoes();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, [location.pathname, refresh]);

  const abrir = () => {
    onOpen();
    refresh(true); // ao abrir, sempre busca dados frescos
  };

  const aoClicar = (n) => {
    marcarComoLida(n.id);
    onClose();
    if (n.rota) navigate(n.rota);
  };

  return (
    <Popover isOpen={isOpen} onOpen={abrir} onClose={onClose} placement="bottom-end" isLazy>
      <PopoverTrigger>
        <Box position="relative" display="inline-block" cursor="pointer">
          <Button
            as="span"
            variant="ghost"
            aria-label="Notificações"
            borderRadius="xl"
            px={3}
            _hover={{ bg: "whiteAlpha.200" }}
          >
            <Text fontSize="xl">🔔</Text>
          </Button>
          {naoLidas > 0 && (
            <Badge
              position="absolute"
              top="0"
              right="0"
              bg="red.500"
              color="white"
              borderRadius="full"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="10px"
              pointerEvents="none"
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>

      <Portal>
        <PopoverContent
          w={{ base: "92vw", sm: "380px" }}
          bg="rgba(26, 32, 44, 0.97)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="2xl"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.5)"
          color="white"
          _focus={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)" }}
        >
          <PopoverArrow bg="rgba(26, 32, 44, 0.97)" />
          <PopoverHeader borderColor="whiteAlpha.200">
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">🔔 Notificações</Text>
              {naoLidas > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="whiteAlpha.700"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={marcarTodasComoLidas}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </Flex>
          </PopoverHeader>

          <PopoverBody maxH="420px" overflowY="auto" p={3}>
            <VStack spacing={2} align="stretch">
              {carregando ? (
                <Text color="whiteAlpha.600" fontSize="sm" textAlign="center" py={6}>
                  Carregando...
                </Text>
              ) : notificacoes.length === 0 ? (
                <VStack py={6} spacing={1}>
                  <Text fontSize="3xl">🎉</Text>
                  <Text color="white" fontWeight="semibold">Tudo certo por aqui!</Text>
                  <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
                    Nenhum alerta no momento.
                  </Text>
                </VStack>
              ) : (
                notificacoes.map((n) => {
                  const estilo = estilos[n.tipo];
                  return (
                    <Box
                      key={n.id}
                      as="button"
                      textAlign="left"
                      w="100%"
                      p={3}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={estilo.borda}
                      bg={n.lida ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.08)"}
                      opacity={n.lida ? 0.6 : 1}
                      _hover={{ bg: "rgba(255, 255, 255, 0.12)" }}
                      onClick={() => aoClicar(n)}
                    >
                      <HStack align="start" spacing={3}>
                        <Text fontSize="xl">{estilo.icone}</Text>
                        <VStack align="start" spacing={0} flex={1}>
                          <HStack w="100%" justify="space-between" align="start">
                            <Text fontWeight="bold" fontSize="sm" color={estilo.cor}>
                              {n.titulo}
                            </Text>
                            {!n.lida && (
                              <Box w="8px" h="8px" mt="5px" borderRadius="full" bg="red.400" flexShrink={0} />
                            )}
                          </HStack>
                          <Text fontSize="xs" color="whiteAlpha.800">
                            {n.mensagem}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  );
                })
              )}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

export default NotificationBell;