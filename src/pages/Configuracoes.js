const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");

const API_BASE_URL =
    process.env.API_BASE_URL || "https://finanzas-backend-rmik.onrender.com/api";
const BOT_API_KEY = process.env.BOT_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://finanzas.dev.br";

if (!BOT_API_KEY) {
    console.error("❌ Defina a variável de ambiente BOT_API_KEY antes de iniciar o bot.");
    process.exit(1);
}

const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });
const apiHeaders = (whatsappId) => ({
    "X-Bot-Key": BOT_API_KEY,
    "X-Whatsapp-Id": whatsappId,
});

const vinculados = new Set();
const userSessionState = {};

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "finanzas-bot" }),
    puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("QR RECEIVED. Scan this QR code with your WhatsApp linked devices.");
});

client.on("ready", () => {
    console.log("✅ WhatsApp Client está pronto! O bot está conectado e pronto para receber mensagens.");
    console.log(`Conectando ao backend em: ${API_BASE_URL}`);
});

client.on("auth_failure", (msg) => {
    console.error("❌ Falha na Autenticação:", msg);
});

client.on("disconnected", (reason) => {
    console.log("Cliente desconectado", reason);
    client.initialize();
});

const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

async function verificarVinculo(whatsappId) {
    if (vinculados.has(whatsappId)) return true;
    try {
        await api.get("/whatsapp/status", { headers: apiHeaders(whatsappId) });
        vinculados.add(whatsappId);
        return true;
    } catch (error) {
        if (error.response?.status === 401 && error.response.data?.erro === "nao_vinculado") {
            return false;
        }
        throw error;
    }
}

async function tratarDesvinculo(error, message) {
    if (error.response?.status === 401 && error.response.data?.erro === "nao_vinculado") {
        vinculados.delete(message.from);
        delete userSessionState[message.from];
        await message.reply('Sua conta foi desconectada. Envie "oi" para conectar novamente.');
        return true;
    }
    return false;
}

async function sendMainMenu(message) {
    const whatsappId = message.from;
    userSessionState[whatsappId] = "in_menu";
    await message.reply(
        `*Menu Principal*
Digite o *número* da opção desejada:

1️⃣ - Registrar Entrada
2️⃣ - Registrar Saída
3️⃣ - Resumo Financeiro
4️⃣ - Desconectar`
    );
}

async function sendTransactionMenu(message, type) {
    const whatsappId = message.from;
    const isEntrada = type === "entrada";
    const typeLabel = isEntrada ? "Entrada (Receita)" : "Saída (Despesa)";

    userSessionState[whatsappId] = isEntrada
        ? "awaiting_entrada_action"
        : "awaiting_saida_action";

    await message.reply(
        `*Menu de ${typeLabel}*
Digite o *número* da opção desejada:

1️⃣ - Registrar nova ${isEntrada ? "Entrada" : "Saída"}
2️⃣ - Ver últimos registros de ${typeLabel}
3️⃣ - Voltar ao Menu Principal`
    );
}

async function conectar(message, body) {
    const whatsappId = message.from;
    const codigo = body
        .replace(/^conectar/i, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

    if (codigo.length !== 6) {
        await message.reply(
            "❌ Código inválido. No site, vá em *Configurações*, clique em *Gerar código de conexão* e envie aqui:\n\nCONECTAR SEU_CODIGO"
        );
        return;
    }

    try {
        await api.post("/whatsapp/vincular", { codigo }, { headers: apiHeaders(whatsappId) });
        vinculados.add(whatsappId);
        userSessionState[whatsappId] = "in_menu";
        await message.reply(`✅ Pronto, agora você está conectado! \n\nDigite *MENU* para ver as opções.`);
    } catch (error) {
        const erro = error.response?.data?.erro;
        if (erro === "muitas_tentativas") {
            await message.reply("⛔ Muitas tentativas incorretas. Aguarde 10 minutos e gere um novo código no site.");
        } else if (erro === "codigo_invalido") {
            await message.reply("❌ Código inválido ou expirado. Gere um novo código no site (Configurações) e tente de novo.");
        } else {
            console.error("Erro ao vincular:", error.response?.data || error.message);
            await message.reply("⚠️ Não consegui concluir a conexão agora. Tente novamente em instantes.");
        }
    }
}

async function processTransaction(message, text) {
    const whatsappId = message.from;

    const parts = text.toLowerCase().split(" ");
    const command = parts[0];
    const valueStr = parts[1];

    const rawDescription = parts.slice(2).join(" ");
    const description =
        rawDescription ||
        (command === "entrada" ? "Entrada via WhatsApp" : "Saída via WhatsApp");

    if (command !== "entrada" && command !== "saida") {
        await message.reply("Comando não reconhecido. Digite *MENU* para ver as opções.");
        return false;
    }

    const value = parseFloat((valueStr || "").replace(",", "."));

    if (isNaN(value) || value <= 0) {
        await message.reply(
            `❌ Valor inválido. Use o formato: [valor] [descrição].\nEx: 100 salário`
        );
        return false;
    }

    const isEntrada = command === "entrada";

    const payload = {
        descricao: description.slice(0, 255),
        valor: value,
        data: new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }),
        ...(isEntrada
            ? {
                  categoria: /sal[aá]rio|fixo/.test(description) ? "salario" : "outros",
              }
            : {
                  tipo: description.includes("fixa") ? "fixa" : "variável",
              }),
    };

    const endpoint = isEntrada ? "/entradas" : "/saidas";

    try {
        await api.post(endpoint, payload, { headers: apiHeaders(whatsappId) });

        const typeLabel = isEntrada ? "Entrada" : "Saída";
        await message.reply(
            `✅ ${typeLabel} de ${formatCurrency(value)} (${payload.descricao}) registrada com sucesso no FinanZas!`
        );
        return true;
    } catch (error) {
        if (await tratarDesvinculo(error, message)) return false;

        console.error("Erro ao comunicar com o backend:", error.response?.data || error.message);

        let errorMessage = "Erro desconhecido ao registrar a transação.";
        if (error.response?.status === 400) {
            errorMessage = "Dados inválidos. Confira o valor e a descrição.";
        } else if (error.code === "ECONNREFUSED" || error.code === "ECONNABORTED") {
            errorMessage = "O servidor não respondeu. Tente novamente em instantes.";
        }

        await message.reply(`❌ Ocorreu um erro: ${errorMessage}`);
        return false;
    }
}

async function getFinancialSummary(message) {
    const whatsappId = message.from;
    const headers = apiHeaders(whatsappId);

    try {
        const [entradasResponse, saidasResponse] = await Promise.all([
            api.get("/entradas/total", { headers }),
            api.get("/saidas/total", { headers }),
        ]);

        const totalEntradas = entradasResponse.data.total;
        const totalSaidas = saidasResponse.data.total;
        const saldo = totalEntradas - totalSaidas;

        await message.reply(`*📊 Resumo Financeiro*

*Entradas (Total)*: ${formatCurrency(totalEntradas)}
*Saídas (Total)*: ${formatCurrency(totalSaidas)}
*Saldo Atual (Entradas - Saídas)*: ${formatCurrency(saldo)}`);

        return true;
    } catch (error) {
        if (await tratarDesvinculo(error, message)) return false;

        console.error("Erro ao buscar resumo financeiro:", error.response?.data || error.message);
        await message.reply(
            "❌ Não consegui buscar o resumo agora. Tente novamente em instantes.\n\nDigite *MENU* para ver as opções."
        );
        return false;
    }
}

async function getDetailedTransactions(message, type) {
    const whatsappId = message.from;
    const typeLabel = type === "entradas" ? "Entradas (Receitas)" : "Saídas (Despesas)";

    try {
        const response = await api.get(`/${type}`, { headers: apiHeaders(whatsappId) });
        const transactions = response.data;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            await message.reply(`Você não tem ${typeLabel.toLowerCase()} registradas.`);
            return true;
        }

        const ultimas = [...transactions]
            .sort((a, b) => String(b.data).localeCompare(String(a.data)))
            .slice(0, 5);

        let detailedMessage = `*📋 Últimas ${ultimas.length} ${typeLabel}*:\n\n`;

        ultimas.forEach((t, index) => {
            const data = t.data ? t.data.split("-").reverse().join("/") : "N/A";

            detailedMessage += `*${index + 1}. ${t.descricao || "Sem descrição"}*\n`;
            detailedMessage += `  - Valor: ${formatCurrency(t.valor)}\n`;
            detailedMessage += `  - Data: ${data}\n`;

            if (type === "entradas") {
                detailedMessage += `  - Salário/Fixo: ${t.salario ? "Sim" : "Não"}\n`;
            } else {
                const tipo = t.tipo || "variável";
                detailedMessage += `  - Tipo: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}\n`;
            }
            detailedMessage += "---------------------\n";
        });

        await message.reply(detailedMessage);
        return true;
    } catch (error) {
        if (await tratarDesvinculo(error, message)) return false;

        console.error(`Erro ao buscar ${type}:`, error.response?.data || error.message);
        await message.reply(`❌ Não consegui buscar suas ${typeLabel.toLowerCase()} agora. Tente novamente em instantes.`);
        return false;
    }
}

const greetings = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "eai", "opa", "ei"];

client.on("message", async (message) => {
    if (message.from.endsWith("@g.us") || message.isStatus || message.from === "status@broadcast") {
        return;
    }

    const whatsappId = message.from;
    const body = (message.body || "").trim();
    const bodyLower = body.toLowerCase();

    try {
        if (/^conectar(\s|$)/i.test(body)) {
            await conectar(message, body);
            return;
        }

        const vinculado = await verificarVinculo(whatsappId);

        if (!vinculado) {
            if (greetings.includes(bodyLower)) {
                await message.reply(
                    `Seja bem vindo(a) ao WhatsApp do FinanZas!
Para usar a ferramenta, entre no site ${SITE_URL}
Faça login/cadastro e, no menu *Configurações*, clique em *Gerar código de conexão*.
Depois envie o código aqui, assim:

CONECTAR SEU_CODIGO`
                );
                userSessionState[whatsappId] = "awaiting_connect";
            } else {
                await message.reply(
                    'Olá! Parece que você ainda não se conectou. Envie "oi" para ver as instruções de como começar.'
                );
            }
            return;
        }

        const session = userSessionState[whatsappId];

        if (bodyLower === "menu" || bodyLower === "ajuda") {
            await sendMainMenu(message);
            return;
        }

        if (session === "in_menu") {
            switch (body) {
                case "1":
                    await sendTransactionMenu(message, "entrada");
                    return;
                case "2":
                    await sendTransactionMenu(message, "saida");
                    return;
                case "3": {
                    userSessionState[whatsappId] = "fetching_summary";
                    await message.reply("Buscando seu resumo financeiro... Aguarde um momento.");
                    const success = await getFinancialSummary(message);
                    if (success) {
                        await sendMainMenu(message);
                    }
                    return;
                }
                case "4":
                    try {
                        await api.delete("/whatsapp/vinculo", { headers: apiHeaders(whatsappId) });
                    } catch (error) {
                        console.error("Erro ao desconectar:", error.response?.data || error.message);
                    }
                    vinculados.delete(whatsappId);
                    delete userSessionState[whatsappId];
                    await message.reply(
                        'Sessão encerrada. Você foi desconectado. 👋\n\nPara usar o bot novamente, envie "oi".'
                    );
                    return;
                default:
                    await message.reply("Opção inválida. Por favor, digite *MENU* para ver as opções novamente.");
                    return;
            }
        }

        if (session === "awaiting_entrada_action" || session === "awaiting_saida_action") {
            const type = session === "awaiting_entrada_action" ? "entrada" : "saida";
            const isEntrada = type === "entrada";

            switch (body) {
                case "1":
                    userSessionState[whatsappId] = isEntrada ? "awaiting_entrada" : "awaiting_saida";
                    await message.reply(
                        `Ok, vamos registrar uma *${isEntrada ? "Entrada" : "Saída"}*.\n\nPor favor, digite o *valor* e a *descrição*.\n(Ex: ${
                            isEntrada ? "2000 salário" : "45 almoço"
                        })`
                    );
                    return;
                case "2":
                    userSessionState[whatsappId] = "fetching_details";
                    await message.reply("Buscando seus registros detalhados... Aguarde um momento.");
                    await getDetailedTransactions(message, isEntrada ? "entradas" : "saidas");
                    await sendTransactionMenu(message, type);
                    return;
                case "3":
                    await sendMainMenu(message);
                    return;
                default:
                    await message.reply("Opção inválida. Por favor, digite *1*, *2* ou *3*.");
                    return;
            }
        }

        if (session === "awaiting_entrada") {
            const success = await processTransaction(message, "entrada " + body);
            if (success) {
                await sendTransactionMenu(message, "entrada");
            } else {
                userSessionState[whatsappId] = "awaiting_entrada";
            }
            return;
        }

        if (session === "awaiting_saida") {
            const success = await processTransaction(message, "saida " + body);
            if (success) {
                await sendTransactionMenu(message, "saida");
            } else {
                userSessionState[whatsappId] = "awaiting_saida";
            }
            return;
        }

        await message.reply("Comando não reconhecido. Digite *MENU* para ver a lista de opções.");
    } catch (error) {
        console.error("Erro ao processar mensagem:", error.response?.data || error.message);
        await message.reply("⚠️ Não consegui falar com o servidor agora. Tente novamente em instantes.");
    }
});

client.initialize();