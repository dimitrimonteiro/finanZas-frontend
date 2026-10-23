import React, { useState } from "react";
import {
  VStack,
  HStack,
  Box,
  Text,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../auth/AuthContext";

const campo = {
  color: "white",
  bg: "rgba(255, 255, 255, 0.1)",
  border: "1px solid",
  borderColor: "whiteAlpha.300",
  _placeholder: { color: "whiteAlpha.500" },
  _hover: { borderColor: "whiteAlpha.400" },
  _focus: { borderColor: "blue.400", boxShadow: "0 0 0 1px #4facfe" },
  size: "lg",
  borderRadius: "xl",
};

const rotulo = { color: "whiteAlpha.900", fontSize: "sm", fontWeight: "semibold" };

const senhaValida = (s) => s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s);

const mensagemErro = (error) => {
  switch (error.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Senha atual incorreta.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos.";
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso por outra conta.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/weak-password":
      return "A nova senha é muito fraca.";
    case "auth/requires-recent-login":
      return "Por segurança, saia e entre de novo na conta antes de tentar.";
    default:
      return "Não foi possível concluir a operação.";
  }
};

function InformacoesConta() {
  const toast = useToast();
  const { currentUser, temSenha, atualizarNome, alterarEmail, alterarSenha, resetPassword } = useAuth();

  const [nome, setNome] = useState(currentUser?.displayName || "");
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaEmail, setSenhaEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [salvando, setSalvando] = useState("");

  const aviso = (title, status, description) =>
    toast({ title, description, status, duration: 4500, isClosable: true, position: "top-right" });

  const salvarNome = async () => {
    const limpo = nome.trim();
    if (limpo.length < 2 || limpo.length > 60) {
      aviso("⚠️ Nome inválido", "warning", "Use entre 2 e 60 caracteres.");
      return;
    }
    setSalvando("nome");
    try {
      await atualizarNome(limpo);
      aviso("✅ Nome atualizado!", "success");
    } catch (error) {
      aviso("❌ Erro ao salvar o nome", "error", mensagemErro(error));
    } finally {
      setSalvando("");
    }
  };

  const salvarEmail = async () => {
    if (!novoEmail.trim() || !senhaEmail) {
      aviso("⚠️ Preencha o novo e-mail e a senha atual", "warning");
      return;
    }
    setSalvando("email");
    try {
      await alterarEmail(senhaEmail, novoEmail.trim());
      aviso(
        "📧 Confirme o novo e-mail",
        "success",
        `Enviamos um link para ${novoEmail.trim()}. O e-mail só muda depois que você clicar nele.`
      );
      setNovoEmail("");
      setSenhaEmail("");
    } catch (error) {
      aviso("❌ Erro ao alterar o e-mail", "error", mensagemErro(error));
    } finally {
      setSalvando("");
    }
  };

  const salvarSenha = async () => {
    if (!senhaAtual || !novaSenha) {
      aviso("⚠️ Preencha a senha atual e a nova senha", "warning");
      return;
    }
    if (!senhaValida(novaSenha)) {
      aviso("⚠️ Senha fraca", "warning", "Use no mínimo 8 caracteres, com letras e números.");
      return;
    }
    if (novaSenha !== confirmar) {
      aviso("❌ As senhas não coincidem", "error");
      return;
    }
    setSalvando("senha");
    try {
      await alterarSenha(senhaAtual, novaSenha);
      aviso("🔒 Senha alterada com sucesso!", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
    } catch (error) {
      aviso("❌ Erro ao alterar a senha", "error", mensagemErro(error));
    } finally {
      setSalvando("");
    }
  };

  const criarSenha = async () => {
    setSalvando("criar");
    try {
      await resetPassword(currentUser.email);
      aviso("📧 Link enviado", "success", `Enviamos um link para ${currentUser.email} para você criar uma senha.`);
    } catch (error) {
      aviso("❌ Não foi possível enviar o link", "error", mensagemErro(error));
    } finally {
      setSalvando("");
    }
  };

  const campoSenha = (valor, setValor, placeholder) => (
    <InputGroup size="lg">
      <Input
        type={mostrar ? "text" : "password"}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder={placeholder}
        {...campo}
        size={undefined}
      />
      <InputRightElement>
        <IconButton
          aria-label={mostrar ? "Ocultar senhas" : "Mostrar senhas"}
          icon={mostrar ? <ViewOffIcon /> : <ViewIcon />}
          onClick={() => setMostrar(!mostrar)}
          variant="ghost"
          color="whiteAlpha.700"
          _hover={{ bg: "whiteAlpha.200" }}
          size="sm"
        />
      </InputRightElement>
    </InputGroup>
  );

  return (
    <VStack align="stretch" spacing={5}>
      <HStack>
        <Text fontSize="2xl">👤</Text>
        <Heading size="md" color="white">Informações da Conta</Heading>
      </HStack>

      <FormControl>
        <FormLabel {...rotulo}>📝 Nome</FormLabel>
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como você quer ser chamado"
          maxLength={60}
          {...campo}
        />
      </FormControl>
      <Button
        onClick={salvarNome}
        isLoading={salvando === "nome"}
        bgGradient="linear(to-r, #4facfe, #00f2fe)"
        color="white"
        borderRadius="xl"
        fontWeight="bold"
        leftIcon={<Text>💾</Text>}
      >
        Salvar nome
      </Button>

      <Divider borderColor="whiteAlpha.300" />

      <FormControl>
        <FormLabel {...rotulo}>📧 E-mail atual</FormLabel>
        <Input value={currentUser?.email || ""} isReadOnly {...campo} opacity={0.7} />
      </FormControl>

      {temSenha ? (
        <Box>
          <VStack align="stretch" spacing={3}>
            <FormControl>
              <FormLabel {...rotulo}>Novo e-mail</FormLabel>
              <Input
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="novo@email.com"
                {...campo}
              />
            </FormControl>
            <FormControl>
              <FormLabel {...rotulo}>Senha atual (para confirmar)</FormLabel>
              {campoSenha(senhaEmail, setSenhaEmail, "••••••••")}
            </FormControl>
            <Button
              onClick={salvarEmail}
              isLoading={salvando === "email"}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ bg: "whiteAlpha.200" }}
              borderRadius="xl"
            >
              Alterar e-mail
            </Button>
          </VStack>
        </Box>
      ) : (
        <Text color="whiteAlpha.700" fontSize="sm">
          Sua conta usa o login com Google, então o e-mail é gerenciado pelo Google.
        </Text>
      )}

      <Divider borderColor="whiteAlpha.300" />

      {temSenha ? (
        <VStack align="stretch" spacing={3}>
          <Text {...rotulo}>🔒 Alterar senha</Text>
          <FormControl>
            <FormLabel {...rotulo}>Senha atual</FormLabel>
            {campoSenha(senhaAtual, setSenhaAtual, "••••••••")}
          </FormControl>
          <FormControl>
            <FormLabel {...rotulo}>Nova senha</FormLabel>
            {campoSenha(novaSenha, setNovaSenha, "Mínimo 8 caracteres, com letras e números")}
          </FormControl>
          <FormControl>
            <FormLabel {...rotulo}>Confirmar nova senha</FormLabel>
            {campoSenha(confirmar, setConfirmar, "Repita a nova senha")}
          </FormControl>
          <Button
            onClick={salvarSenha}
            isLoading={salvando === "senha"}
            bgGradient="linear(to-r, #4facfe, #00f2fe)"
            color="white"
            borderRadius="xl"
            fontWeight="bold"
            leftIcon={<Text>🔒</Text>}
          >
            Alterar senha
          </Button>
        </VStack>
      ) : (
        <VStack align="stretch" spacing={3}>
          <Text {...rotulo}>🔒 Senha</Text>
          <Text color="whiteAlpha.700" fontSize="sm">
            Você entra com o Google e ainda não tem uma senha. Se quiser também entrar com e-mail e senha,
            enviamos um link para você criar uma.
          </Text>
          <Button
            onClick={criarSenha}
            isLoading={salvando === "criar"}
            variant="outline"
            color="white"
            borderColor="whiteAlpha.400"
            _hover={{ bg: "whiteAlpha.200" }}
            borderRadius="xl"
          >
            Enviar link para criar senha
          </Button>
        </VStack>
      )}
    </VStack>
  );
}

export default InformacoesConta;