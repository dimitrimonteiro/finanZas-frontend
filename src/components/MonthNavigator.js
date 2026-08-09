import React from "react";
import { HStack, IconButton, Text, Box } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function MonthNavigator({ month, year, onChange, gradient = "linear(to-r, #667eea, #764ba2)" }) {
  const goPrev = () => {
    if (month === 0) {
      onChange(11, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const goNext = () => {
    if (month === 11) {
      onChange(0, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  const isCurrentMonth = () => {
    const hoje = new Date();
    return month === hoje.getMonth() && year === hoje.getFullYear();
  };

  const irParaHoje = () => {
    const hoje = new Date();
    onChange(hoje.getMonth(), hoje.getFullYear());
  };

  return (
    <HStack
      justify="space-between"
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      px={4}
      py={2}
      mb={6}
    >
      <IconButton
        aria-label="Mês anterior"
        icon={<ChevronLeftIcon boxSize={6} />}
        onClick={goPrev}
        variant="ghost"
        color="white"
        _hover={{ bg: "whiteAlpha.200" }}
        borderRadius="lg"
      />

      <Box textAlign="center" cursor={!isCurrentMonth() ? "pointer" : "default"} onClick={!isCurrentMonth() ? irParaHoje : undefined}>
        <Text color="white" fontWeight="bold" fontSize="lg" bgGradient={gradient} bgClip="text">
          {nomesMeses[month]} {year}
        </Text>
        {!isCurrentMonth() && (
          <Text fontSize="xs" color="whiteAlpha.500">
            Toque para voltar ao mês atual
          </Text>
        )}
      </Box>

      <IconButton
        aria-label="Próximo mês"
        icon={<ChevronRightIcon boxSize={6} />}
        onClick={goNext}
        variant="ghost"
        color="white"
        _hover={{ bg: "whiteAlpha.200" }}
        borderRadius="lg"
      />
    </HStack>
  );
}

export default MonthNavigator;