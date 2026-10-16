import React, { useState, useEffect } from "react";
import { Box, Skeleton, SimpleGrid, VStack, HStack, Text } from "@chakra-ui/react";

// Skeleton com as cores do tema escuro do app
export const Sk = (props) => (
  <Skeleton startColor="whiteAlpha.100" endColor="whiteAlpha.300" borderRadius="lg" {...props} />
);

const SkeletonCard = ({ children, ...props }) => (
  <Box
    bg="rgba(255, 255, 255, 0.05)"
    backdropFilter="blur(20px)"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    p={6}
    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
    {...props}
  >
    {children}
  </Box>
);

// Aviso que aparece se o carregamento demorar (Render free tier "acordando")
export function SlowServerHint({ delay = 5000 }) {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMostrar(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!mostrar) return null;

  return (
    <Box
      p={4}
      bg="rgba(246, 224, 94, 0.08)"
      border="1px solid"
      borderColor="rgba(246, 224, 94, 0.3)"
      borderRadius="xl"
    >
      <Text color="yellow.200" fontSize="sm" textAlign="center">
        ⏳ O servidor está acordando. Na primeira visita isso pode levar até 30 segundos, mas já já seus dados aparecem!
      </Text>
    </Box>
  );
}

// Linha de cards de estatística
export function CardsSkeleton({ count = 3, columns = { base: 1, md: 3 }, minH }) {
  return (
    <SimpleGrid columns={columns} spacing={6}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} minH={minH}>
          <VStack align="stretch" spacing={3}>
            <Sk h="14px" w="50%" />
            <Sk h="32px" w="75%" />
            <Sk h="12px" w="40%" />
          </VStack>
        </SkeletonCard>
      ))}
    </SimpleGrid>
  );
}

// Lista de itens (entradas, saídas, metas, recorrências)
export function ListSkeleton({ count = 4, height, showHint = true }) {
  return (
    <VStack spacing={4} align="stretch">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} py={4} minH={height}>
          <HStack spacing={4} justify="space-between">
            <HStack spacing={4} flex={1}>
              <Sk w={12} h={12} borderRadius="xl" flexShrink={0} />
              <VStack align="start" spacing={2} flex={1}>
                <Sk h="18px" w="55%" />
                <Sk h="12px" w="35%" />
              </VStack>
            </HStack>
            <Sk h="26px" w="110px" />
          </HStack>
        </SkeletonCard>
      ))}
      {showHint && <SlowServerHint />}
    </VStack>
  );
}

// Card de gráfico
export function ChartSkeleton({ height = "300px" }) {
  return (
    <SkeletonCard>
      <VStack align="stretch" spacing={4}>
        <Sk h="22px" w="45%" />
        <Sk h={height} />
      </VStack>
    </SkeletonCard>
  );
}

// Página inteira (Home e Relatórios)
export function PageSkeleton({ cards = 4, charts = 2 }) {
  return (
    <Box w="100%" maxW="1400px" mx="auto">
      <VStack align="start" spacing={3} mb={8}>
        <Sk h="40px" w={{ base: "70%", md: "360px" }} />
        <Sk h="18px" w={{ base: "50%", md: "260px" }} />
      </VStack>

      <Box mb={8}>
        <CardsSkeleton count={cards} columns={{ base: 1, md: 2, lg: cards }} />
      </Box>

      <SimpleGrid columns={{ base: 1, lg: charts }} spacing={6}>
        {Array.from({ length: charts }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </SimpleGrid>

      <Box mt={6}>
        <SlowServerHint />
      </Box>
    </Box>
  );
}