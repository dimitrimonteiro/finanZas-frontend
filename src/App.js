import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  VStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  useToast,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
  useNavigate,
} from 'react-router-dom';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

import Home from './pages/Home';
import Entradas from './pages/Entradas';
import Saidas from './pages/Saidas';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import LoginPage from './pages/Login'; 
import CadastroPage from './pages/Cadastro';
import ProtectedRoutes from './ProtectedRoutes';
import Metas from './pages/Metas';
import Recorrentes from './pages/Recorrentes';

import { AuthProvider, useAuth } from './auth/AuthContext';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const menuItems = [
  { name: 'Dashboard', path: '/', icon: '📊', gradient: 'linear(to-r, #667eea, #764ba2)' },
  { name: 'Entradas', path: '/entradas', icon: '💰', gradient: 'linear(to-r, #11998e, #38ef7d)' },
  { name: 'Saídas', path: '/saidas', icon: '💸', gradient: 'linear(to-r, #ee0979, #ff6a00)' },
  { name: 'Metas', path: '/metas', icon: '🎯', gradient: 'linear(to-r, #fc4a1a, #f7b733)' },
  { name: 'Relatórios', path: '/relatorios', icon: '📈', gradient: 'linear(to-r, #4facfe, #00f2fe)' },
  { name: 'Configurações', path: '/configuracoes', icon: '⚙️', gradient: 'linear(to-r, #a8edea, #fed6e3)' },
  { name: 'Recorrências', path: '/recorrentes', icon: '🔁', gradient: 'linear(to-r, #a770ef, #cf8bf3)' },
];

function Navigation() {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: '👋 Até logo!',
        description: 'Logout realizado com sucesso.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Erro ao fazer logout.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const currentPath = menuItems.find(item => item.path === location.pathname);

  return (
    <MotionBox
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Flex
        as="nav"
        bg="rgba(25, 25, 25, 0.8)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
        px={{ base: 4, md: 8 }}
        py={4}
        justify="space-between"
        align="center"
        color="white"
        position="sticky"
        top={0}
        zIndex={1000}
        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      >
        {/* Logo com Gradiente */}
        <Link to="/">
          <MotionBox
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="black"
              bgGradient="linear(to-r, #667eea, #764ba2, #f093fb)"
              bgClip="text"
              letterSpacing="tight"
            >
              FinanZas
            </Text>
          </MotionBox>
        </Link>

        {currentUser && isDesktop ? (
          <HStack spacing={2}>
            {menuItems.map((item) => (
              <MotionBox
                key={item.name}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  as={Link}
                  to={item.path}
                  variant="ghost"
                  size="md"
                  color={location.pathname === item.path ? 'white' : 'whiteAlpha.700'}
                  fontWeight={location.pathname === item.path ? 'bold' : 'normal'}
                  bgGradient={location.pathname === item.path ? item.gradient : 'none'}
                  _hover={{
                    bgGradient: item.gradient,
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.3s"
                  leftIcon={<Text fontSize="lg">{item.icon}</Text>}
                  borderRadius="xl"
                  px={6}
                >
                  {item.name}
                </Button>
              </MotionBox>
            ))}
            
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<ChevronDownIcon />}
                _hover={{ bg: 'whiteAlpha.200' }}
                borderRadius="xl"
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={currentUser?.email}
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                  <Text display={{ base: 'none', xl: 'block' }} fontSize="sm">
                    {currentUser?.email?.split('@')[0]}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList bg="#2D2D2D" borderColor="whiteAlpha.200">
                <MenuItem 
                  icon={<Text>👤</Text>}
                  bg="#2D2D2D" 
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => navigate('/configuracoes')}
                >
                  Meu Perfil
                </MenuItem>
                <MenuItem 
                  icon={<Text>🚪</Text>}
                  bg="#2D2D2D" 
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={handleLogout}
                  color="red.300"
                >
                  Sair
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        ) : currentUser ? (
          <>
            <HStack>
              <Badge
                bgGradient={currentPath?.gradient}
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                display={{ base: 'none', sm: 'block' }}
              >
                {currentPath?.icon} {currentPath?.name}
              </Badge>
              <IconButton
                aria-label="Abrir menu"
                icon={<HamburgerIcon />}
                onClick={onOpen}
                variant="ghost"
                color="white"
                size={{ base: "md", md: "lg" }}
                _hover={{ bg: 'whiteAlpha.300' }}
                borderRadius="xl"
              />
            </HStack>
            
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
              <DrawerOverlay backdropFilter="blur(10px)" />
              <DrawerContent 
                bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" 
                color="white"
                borderLeft="1px solid"
                borderColor="whiteAlpha.200"
              >
                <DrawerCloseButton size="lg" />
                <DrawerBody>
                  <VStack spacing={6} mt={16} align="stretch">
                    <VStack spacing={3} pb={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                      <Avatar
                        size="lg"
                        name={currentUser?.email}
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      />
                      <Text fontSize="sm" color="whiteAlpha.700">
                        {currentUser?.email}
                      </Text>
                    </VStack>

                    {menuItems.map((item) => (
                      <MotionBox
                        key={item.name}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          as={Link}
                          to={item.path}
                          variant="ghost"
                          justifyContent="flex-start"
                          color={location.pathname === item.path ? 'white' : 'whiteAlpha.700'}
                          fontWeight={location.pathname === item.path ? 'bold' : 'normal'}
                          bgGradient={location.pathname === item.path ? item.gradient : 'none'}
                          _hover={{ bgGradient: item.gradient }}
                          onClick={onClose}
                          w="100%"
                          h="50px"
                          borderRadius="xl"
                          leftIcon={<Text fontSize="xl">{item.icon}</Text>}
                          size="lg"
                        >
                          {item.name}
                        </Button>
                      </MotionBox>
                    ))}

                    <MotionBox
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        colorScheme="red"
                        onClick={() => {
                          handleLogout();
                          onClose();
                        }}
                        w="100%"
                        h="50px"
                        borderRadius="xl"
                        leftIcon={<Text fontSize="xl">🚪</Text>}
                        size="lg"
                      >
                        Sair
                      </Button>
                    </MotionBox>
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        ) : null}
      </Flex>
    </MotionBox>
  );
}

function App() {
  return (
    <Box 
      minHeight="100vh" 
      bgGradient="linear(to-br, #0f0c29, #302b63, #24243e)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        bgImage="radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 102, 196, 0.3), transparent 50%)"
        animation="pulse 8s ease-in-out infinite"
        pointerEvents="none"
      />

      <Router>
        <AuthProvider>
          <Navigation />
          <MotionFlex 
            justify="center" 
            align="center" 
            px={{ base: 4, md: 8 }} 
            py={8}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<Home />} />
                <Route path="/entradas" element={<Entradas />} />
                <Route path="/saidas" element={<Saidas />} />
                <Route path="/metas" element={<Metas />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
              </Route>
            </Routes>
          </MotionFlex>
        </AuthProvider>
      </Router>

      <MotionBox
        position="fixed"
        bottom={{ base: "20px", md: "40px" }}
        right={{ base: "20px", md: "40px" }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <a
          href="https://wa.me/5511960428846" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Flex
            w={{ base: "50px", md: "60px" }}
            h={{ base: "50px", md: "60px" }}
            bg="linear-gradient(135deg, #25d366 0%, #128c7e 100%)"
            borderRadius="full"
            align="center"
            justify="center"
            boxShadow="0 8px 32px rgba(37, 211, 102, 0.4)"
            _hover={{
              boxShadow: "0 12px 48px rgba(37, 211, 102, 0.6)",
            }}
            transition="all 0.3s"
          >
            <Text fontSize={{ base: "25px", md: "30px" }}>
              <i className="fab fa-whatsapp"></i>
            </Text>
          </Flex>
        </a>
      </MotionBox>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.2; }
          }
        `}
      </style>
    </Box>
  );
}

export default App;