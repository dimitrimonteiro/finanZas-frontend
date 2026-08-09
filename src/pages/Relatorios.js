import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Button,
  Spinner,
  Heading,
  VStack,
  HStack,
  Badge,
  Flex,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from '../auth/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { format } from "date-fns";

const MotionBox = motion(Box);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = dateString instanceof Date ? dateString : new Date(dateString + 'T00:00:00'); 
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
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
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
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

const processarDadosMensais = (allEntradas, allSaidas) => {
  const data = new Date();
  const meses = [];
  const dadosAgregados = {};

  for (let i = 5; i >= 0; i--) {
    const mesData = new Date(data.getFullYear(), data.getMonth() - i, 1);
    const mesChave = format(mesData, 'yyyy-MM');
    const nomeMes = format(mesData, 'MMM'); 
    meses.push({ mesChave, nomeMes });
    dadosAgregados[mesChave] = { mes: nomeMes, entrada: 0, saida: 0 };
  }

  allEntradas.forEach(e => {
    const mesChave = format(new Date(e.data), 'yyyy-MM');
    if (dadosAgregados[mesChave]) {
      dadosAgregados[mesChave].entrada += Number(e.valor);
    }
  });

  allSaidas.forEach(s => {
    const mesChave = format(new Date(s.data), 'yyyy-MM');
    if (dadosAgregados[mesChave]) {
      dadosAgregados[mesChave].saida += Number(s.valor);
    }
  });

  return meses.map(m => dadosAgregados[m.mesChave]);
};

function Relatorios() {
  const [allEntradas, setAllEntradas] = useState([]); 
  const [allSaidas, setAllSaidas] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  const { currentUser } = useAuth();
  
  const [dadosMesAnterior, setDadosMesAnterior] = useState({
      entradas: 0,
      saidas: 0,
  });

  const fetchDadosRelatorios = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      
      const entradasResponse = await axios.get(`http://localhost:8080/api/entradas?userId=${userId}`);
      const saidasResponse = await axios.get(`http://localhost:8080/api/saidas?userId=${userId}`);
      
      const fetchedEntradas = entradasResponse.data;
      const fetchedSaidas = saidasResponse.data;

      setAllEntradas(fetchedEntradas);
      setAllSaidas(fetchedSaidas);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const entradasMesAtual = fetchedEntradas.filter(e => {
        const dataEntrada = new Date(e.data);
        return dataEntrada.getMonth() === currentMonth && dataEntrada.getFullYear() === currentYear;
      });
      
      const saidasMesAtual = fetchedSaidas.filter(s => {
        const dataSaida = new Date(s.data);
        return dataSaida.getMonth() === currentMonth && dataSaida.getFullYear() === currentYear;
      });

      const mesAnteriorData = new Date(currentDate.getFullYear(), currentMonth - 1, 1);
      const mesAnterior = mesAnteriorData.getMonth();
      const anoMesAnterior = mesAnteriorData.getFullYear();
      
      const totalEntradasMesAnterior = fetchedEntradas
        .filter(e => {
          const dataEntrada = new Date(e.data);
          return dataEntrada.getMonth() === mesAnterior && dataEntrada.getFullYear() === anoMesAnterior;
        })
        .reduce((acc, e) => acc + Number(e.valor), 0);
        
      const totalSaidasMesAnterior = fetchedSaidas
        .filter(s => {
          const dataSaida = new Date(s.data);
          return dataSaida.getMonth() === mesAnterior && dataSaida.getFullYear() === anoMesAnterior;
        })
        .reduce((acc, s) => acc + Number(s.valor), 0);

      setDadosMesAnterior({
          entradas: totalEntradasMesAnterior,
          saidas: totalSaidasMesAnterior,
      });

    } catch (error) {
      console.error("Erro ao buscar dados dos relatórios:", error);
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Não foi possível conectar ao servidor.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    fetchDadosRelatorios();
  }, [currentUser]);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const entradasMesAtual = allEntradas.filter(e => {
    const dataEntrada = new Date(e.data);
    return dataEntrada.getMonth() === currentMonth && dataEntrada.getFullYear() === currentYear;
  });
  
  const saidasMesAtual = allSaidas.filter(s => {
    const dataSaida = new Date(s.data);
    return dataSaida.getMonth() === currentMonth && dataSaida.getFullYear() === currentYear;
  });

  const totalEntradas = entradasMesAtual.reduce((acc, e) => acc + Number(e.valor), 0);
  const totalSaidas = saidasMesAtual.reduce((acc, s) => acc + Number(s.valor), 0);
  const saldo = totalEntradas - totalSaidas;
  const taxaEconomia = totalEntradas > 0 ? ((saldo / totalEntradas) * 100) : 0;

  const percentualEntradas = dadosMesAnterior.entradas > 0 ? (((totalEntradas - dadosMesAnterior.entradas) / dadosMesAnterior.entradas) * 100) : 0;
  const percentualSaidas = dadosMesAnterior.saidas > 0 ? (((totalSaidas - dadosMesAnterior.saidas) / dadosMesAnterior.saidas) * 100) : 0;

  const formatPercentual = (percentual) => {
    if (percentual === 0) {
      return (
        <StatHelpText color="whiteAlpha.600" mb={0}>
          Sem alteração vs mês anterior
        </StatHelpText>
      );
    }
    const isIncrease = percentual >= 0;
    const arrow = isIncrease ? <StatArrow type="increase" /> : <StatArrow type="decrease" />;
    const color = isIncrease ? "green.300" : "red.300";
    const text = `${isIncrease ? '+' : ''}${Math.abs(percentual).toFixed(1)}% vs mês anterior`;
    
    return (
        <StatHelpText color={color} mb={0}>
          {arrow} {text}
        </StatHelpText>
    );
  };
  
  const dataBarras = [
    { name: "Entradas", valor: totalEntradas, fill: "#38ef7d" },
    { name: "Saídas", valor: totalSaidas, fill: "#ff6a00" },
  ];

  const fixas = saidasMesAtual.filter((s) => s.tipo === "fixa").reduce((acc, s) => acc + Number(s.valor), 0);
  const variaveis = saidasMesAtual.filter((s) => s.tipo === "variável").reduce((acc, s) => acc + Number(s.valor), 0);
  
  const dataPizza = [
    { name: "Fixas", value: fixas, color: "#667eea" },
    { name: "Variáveis", value: variaveis, color: "#f7b733" },
  ].filter(d => d.value > 0);
  
  const dataFixasVariaveis = [
    { name: "Fixas", valor: fixas, fill: "#667eea" },
    { name: "Variáveis", valor: variaveis, fill: "#f7b733" },
  ];

  const dadosMensais = processarDadosMensais(allEntradas, allSaidas);

  const handleExportPDF = () => {
    setIsGenerating(true);
    const input = document.getElementById('relatorio-content'); 
    
    html2canvas(input, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#191919', 
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        const imgWidth = 210; 
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.setFillColor(25, 25, 25); 
        pdf.rect(0, 0, 210, 297, 'F'); 
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        pdf.addPage();
        pdf.setFillColor(25, 25, 25); 
        pdf.rect(0, 0, 210, 297, 'F'); 

        pdf.setFontSize(22);
        pdf.setTextColor(255, 255, 255);
        pdf.text("Detalhes Completos - FinanZas", 14, 20);

        const entradasRows = allEntradas.map(e => ({
            data: formatDate(e.data),
            descricao: e.descricao || '',
            valor: formatCurrency(e.valor),
            salario: e.salario ? 'Sim' : 'Não',
        }));

        pdf.autoTable({
            startY: 35,
            head: [['Data', 'Descrição', 'Valor', 'Salário']],
            body: entradasRows.map(row => Object.values(row)),
            theme: 'striped',
            headStyles: { fillColor: [56, 239, 125], textColor: 255 }, 
            styles: { fontSize: 10, cellPadding: 2, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [45, 45, 45] }, 
            bodyStyles: { fillColor: [60, 60, 60] }, 
            margin: { top: 10, left: 10, right: 10 },
            didDrawPage: (data) => {
                pdf.setFontSize(14);
                pdf.text("💰 Entradas", 14, 30);
            }
        });
        
        let startY = pdf.lastAutoTable.finalY;

        const saidasRows = allSaidas.map(s => ({
            data: formatDate(s.data),
            descricao: s.descricao || '',
            valor: formatCurrency(s.valor),
            tipo: s.tipo ? s.tipo.charAt(0).toUpperCase() + s.tipo.slice(1) : '',
        }));

        pdf.autoTable({
            startY: startY + 20,
            head: [['Data', 'Descrição', 'Valor', 'Tipo']],
            body: saidasRows.map(row => Object.values(row)),
            theme: 'striped',
            headStyles: { fillColor: [255, 106, 0], textColor: 255 }, 
            styles: { fontSize: 10, cellPadding: 2, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [45, 45, 45] }, 
            bodyStyles: { fillColor: [60, 60, 60] }, 
            margin: { top: 10, left: 10, right: 10 },
            didDrawPage: (data) => {
                pdf.setFontSize(14);
                pdf.text("💸 Saídas", 14, startY + 15);
            }
        });

        pdf.save(`relatorio_finanzas_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsGenerating(false);
        toast({
            title: "📄 Relatório gerado!",
            description: "Download concluído com sucesso.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top-right",
        });
    }).catch(error => {
        console.error("Erro ao gerar PDF:", error);
        setIsGenerating(false);
        toast({
            title: "❌ Erro na exportação",
            description: "Não foi possível gerar o PDF.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top-right",
        });
    });
  };

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
              bgGradient="linear(to-r, #4facfe, #00f2fe)"
              bgClip="text"
            >
              Relatórios e Análises
            </Heading>
            <Text color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
              Insights completos das suas finanças
            </Text>
          </VStack>

          <Button
            onClick={handleExportPDF}
            isLoading={isGenerating}
            loadingText="Gerando PDF"
            size="lg"
            bgGradient="linear(to-r, #4facfe, #00f2fe)"
            color="white"
            _hover={{ 
              bgGradient: "linear(to-r, #00f2fe, #4facfe)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(79, 172, 254, 0.4)"
            }}
            transition="all 0.3s"
            borderRadius="xl"
            leftIcon={isGenerating ? <Spinner size="sm" /> : <Text fontSize="xl">📄</Text>}
          >
            Exportar PDF
          </Button>
        </Flex>
      </MotionBox>

      <Box id="relatorio-content">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <MotionBox variants={itemVariants}>
              <GlassCard gradient="linear(to-br, #11998e, #38ef7d)">
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">💰 Total de Entradas</StatLabel>
                  <StatNumber fontSize="3xl" color="white">{formatCurrency(totalEntradas)}</StatNumber>
                  <StatHelpText color="green.300" mb={0}>
                    <StatArrow type="increase" />
                    +12.5% vs mês anterior
                  </StatHelpText>
                </Stat>
              </GlassCard>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <GlassCard gradient="linear(to-br, #ee0979, #ff6a00)">
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">💸 Total de Saídas</StatLabel>
                  <StatNumber fontSize="3xl" color="white">{formatCurrency(totalSaidas)}</StatNumber>
                  <StatHelpText color="red.300" mb={0}>
                    <StatArrow type="decrease" />
                    -8.3% vs mês anterior
                  </StatHelpText>
                </Stat>
              </GlassCard>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <GlassCard gradient={saldo >= 0 ? "linear(to-br, #667eea, #764ba2)" : "linear(to-br, #eb3349, #f45c43)"}>
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">💎 Saldo Atual</StatLabel>
                  <StatNumber fontSize="3xl" color="white">{formatCurrency(saldo)}</StatNumber>
                  <StatHelpText color={saldo >= 0 ? "purple.300" : "red.300"} mb={0}>
                    {saldo >= 0 ? "Saldo positivo ✓" : "Saldo negativo ⚠"}
                  </StatHelpText>
                </Stat>
              </GlassCard>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <GlassCard gradient="linear(to-br, #fc4a1a, #f7b733)">
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">📊 Taxa de Economia</StatLabel>
                  <StatNumber fontSize="3xl" color="white">{taxaEconomia.toFixed(1)}%</StatNumber>
                  <StatHelpText color="orange.300" mb={0}>
                    {taxaEconomia >= 20 ? "Excelente! 🎉" : taxaEconomia >= 10 ? "Bom trabalho 👍" : "Pode melhorar"}
                  </StatHelpText>
                </Stat>
              </GlassCard>
            </MotionBox>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
            <MotionBox variants={itemVariants}>
              <GlassCard>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md" color="white">💰 Entradas vs Saídas</Heading>
                    <Badge bgGradient="linear(to-r, #4facfe, #00f2fe)" color="white" px={3} py={1} borderRadius="full">
                      Comparativo
                    </Badge>
                  </HStack>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataBarras}>
                        <XAxis dataKey="name" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(45, 45, 45, 0.95)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="valor" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </VStack>
              </GlassCard>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <GlassCard>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md" color="white">🎯 Distribuição de Despesas</Heading>
                    <Badge bgGradient="linear(to-r, #667eea, #764ba2)" color="white" px={3} py={1} borderRadius="full">
                      Análise
                    </Badge>
                  </HStack>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataPizza}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {dataPizza.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(45, 45, 45, 0.95)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </VStack>
              </GlassCard>
            </MotionBox>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
            <MotionBox variants={itemVariants}>
              <GlassCard>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md" color="white">📊 Fixas vs Variáveis</Heading>
                    <Badge bgGradient="linear(to-r, #fc4a1a, #f7b733)" color="white" px={3} py={1} borderRadius="full">
                      Breakdown
                    </Badge>
                  </HStack>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataFixasVariaveis}>
                        <XAxis dataKey="name" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(45, 45, 45, 0.95)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="valor" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <SimpleGrid columns={2} spacing={4}>
                    <HStack>
                      <Box w={4} h={4} bg="#667eea" borderRadius="sm" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="whiteAlpha.600">Fixas</Text>
                        <Text fontSize="md" color="white" fontWeight="bold">
                          {formatCurrency(fixas)}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} bg="#f7b733" borderRadius="sm" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="whiteAlpha.600">Variáveis</Text>
                        <Text fontSize="md" color="white" fontWeight="bold">
                          {formatCurrency(variaveis)}
                        </Text>
                      </VStack>
                    </HStack>
                  </SimpleGrid>
                </VStack>
              </GlassCard>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <GlassCard>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md" color="white">📈 Evolução Mensal</Heading>
                    <Badge bgGradient="linear(to-r, #11998e, #38ef7d)" color="white" px={3} py={1} borderRadius="full">
                      Tendência
                    </Badge>
                  </HStack>
                  <Box h="357px">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dadosMensais}>
                        <defs>
                          <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38ef7d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#38ef7d" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff6a00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="mes" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(45, 45, 45, 0.95)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="entrada" stroke="#38ef7d" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" />
                        <Area type="monotone" dataKey="saida" stroke="#ff6a00" strokeWidth={3} fillOpacity={1} fill="url(#colorSaida)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </VStack>
              </GlassCard>
            </MotionBox>
          </SimpleGrid>

          <MotionBox variants={itemVariants}>
            <GlassCard gradient="linear(to-br, #667eea, #764ba2)">
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color="white">💡 Insights Financeiros</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  <Box p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl">
                    <Text fontSize="3xl" mb={2}>🎯</Text>
                    <Text color="white" fontWeight="bold" mb={1}>Meta de Economia</Text>
                    <Text color="whiteAlpha.700" fontSize="sm">
                      {taxaEconomia >= 20 ? "Você está economizando muito bem!" : "Tente economizar 20% da sua renda"}
                    </Text>
                  </Box>

                  <Box p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl">
                    <Text fontSize="3xl" mb={2}>📊</Text>
                    <Text color="white" fontWeight="bold" mb={1}>Despesas Fixas</Text>
                    <Text color="whiteAlpha.700" fontSize="sm">
                      {fixas > totalSaidas * 0.5 ? "Suas despesas fixas são altas" : "Despesas fixas controladas"}
                    </Text>
                  </Box>

                  <Box p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl">
                    <Text fontSize="3xl" mb={2}>💰</Text>
                    <Text color="white" fontWeight="bold" mb={1}>Saldo Disponível</Text>
                    <Text color="whiteAlpha.700" fontSize="sm">
                      {saldo >= totalEntradas * 0.3 ? "Excelente reserva!" : "Tente aumentar sua reserva"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </GlassCard>
          </MotionBox>
        </motion.div>
      </Box>
    </Box>
  );
}

export default Relatorios;