import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { categoriaDe } from "../utils/categoriasSaida";
import { API_URL } from "../config";

const API = API_URL;
const INTERVALO_MIN_MS = 20000;

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const ordemGravidade = { danger: 0, warning: 1, info: 2, success: 3 };

export function gerarNotificacoes({ entradas, saidas, orcamentos, metas }) {
  const lista = [];
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  const ym = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}`;

  const doMes = (item) => {
    if (!item.data) return false;
    const [ano, mes] = item.data.split("-").map(Number);
    return ano === anoAtual && mes - 1 === mesAtual;
  };
  const soma = (arr) => arr.reduce((acc, i) => acc + Number(i.valor), 0);

  const entradasMes = entradas.filter(doMes);
  const saidasMes = saidas.filter((s) => !s.metaId).filter(doMes);
  const totalEntradas = soma(entradasMes);
  const totalSaidas = soma(saidasMes);

  if (totalSaidas > 0 && totalSaidas > totalEntradas) {
    lista.push({
      id: `saldo:negativo:${ym}`,
      tipo: "danger",
      titulo: "Gastos maiores que a renda",
      mensagem: `Você gastou ${fmt(totalSaidas)} e recebeu ${fmt(totalEntradas)} neste mês (déficit de ${fmt(totalSaidas - totalEntradas)}).`,
      rota: "/relatorios",
    });
  } else if (totalEntradas > 0 && totalSaidas >= totalEntradas * 0.9) {
    lista.push({
      id: `saldo:apertado:${ym}`,
      tipo: "warning",
      titulo: "Quase gastando toda a renda",
      mensagem: `Suas saídas já representam ${Math.round((totalSaidas / totalEntradas) * 100)}% das entradas do mês.`,
      rota: "/relatorios",
    });
  }

  const gastoPorCategoria = {};
  saidasMes.forEach((s) => {
    const cat = s.categoria || "outros";
    gastoPorCategoria[cat] = (gastoPorCategoria[cat] || 0) + Number(s.valor);
  });

  orcamentos.forEach((o) => {
    const limite = Number(o.limite);
    if (!(limite > 0)) return;
    const gasto = gastoPorCategoria[o.categoria] || 0;
    const pct = (gasto / limite) * 100;
    const nome = categoriaDe(o.categoria).label;

    if (pct >= 100) {
      lista.push({
        id: `orc:${o.categoria}:estourou:${ym}`,
        tipo: "danger",
        titulo: `Orçamento de ${nome} estourado`,
        mensagem: `Você gastou ${fmt(gasto)} de ${fmt(limite)} (excedeu ${fmt(gasto - limite)}).`,
        rota: "/orcamentos",
      });
    } else if (pct >= 80) {
      lista.push({
        id: `orc:${o.categoria}:perto:${ym}`,
        tipo: "warning",
        titulo: `Orçamento de ${nome} quase no limite`,
        mensagem: `${Math.round(pct)}% usado. Restam ${fmt(limite - gasto)}.`,
        rota: "/orcamentos",
      });
    }
  });

  const inicioHoje = new Date(anoAtual, mesAtual, hoje.getDate());

  metas.forEach((meta) => {
    const objetivo = Number(meta.valorObjetivo);
    const atual = Number(meta.valorAtual) || 0;
    if (!(objetivo > 0)) return;
    const pct = (atual / objetivo) * 100;
    const nome = meta.nomeMeta;

    let dias = null;
    if (meta.dataLimite) {
      const [a, m, d] = meta.dataLimite.split("-").map(Number);
      dias = Math.round((new Date(a, m - 1, d) - inicioHoje) / 86400000);
    }

    if (pct >= 100) {
      lista.push({
        id: `meta:${meta.id}:alcancada`,
        tipo: "success",
        titulo: "Meta alcançada! 🎯",
        mensagem: `Parabéns! Você atingiu "${nome}" (${fmt(objetivo)}).`,
        rota: "/metas",
      });
    } else if (dias !== null && dias < 0) {
      lista.push({
        id: `meta:${meta.id}:expirada`,
        tipo: "danger",
        titulo: `Prazo da meta "${nome}" expirou`,
        mensagem: `Você juntou ${fmt(atual)} de ${fmt(objetivo)} (${Math.round(pct)}%).`,
        rota: "/metas",
      });
    } else if (dias !== null && dias <= 30) {
      const urgente = dias <= 7;
      lista.push({
        id: `meta:${meta.id}:prazo:${urgente ? "7" : "30"}`,
        tipo: urgente ? "danger" : "warning",
        titulo: `Meta "${nome}" perto do prazo`,
        mensagem: `${dias === 0 ? "O prazo vence hoje" : `Faltam ${dias} dia${dias === 1 ? "" : "s"}`} e ainda faltam ${fmt(objetivo - atual)}.`,
        rota: "/metas",
      });
    } else if (pct >= 80) {
      lista.push({
        id: `meta:${meta.id}:quase`,
        tipo: "info",
        titulo: `Meta "${nome}" quase lá`,
        mensagem: `Você já está em ${Math.round(pct)}%. Faltam ${fmt(objetivo - atual)}.`,
        rota: "/metas",
      });
    }
  });

  const metasReserva = metas.filter(
    (m) => m.categoria === "reserva" || m.categoria === "investimento"
  );
  if (metasReserva.length === 0) {
    lista.push({
      id: "poupanca:sem-meta",
      tipo: "info",
      titulo: "Comece a investir",
      mensagem: "Você ainda não tem uma meta de reserva de emergência ou investimento. Que tal criar uma?",
      rota: "/metas",
    });
  } else if (metasReserva.every((m) => !(Number(m.valorAtual) > 0))) {
    lista.push({
      id: "poupanca:parada",
      tipo: "info",
      titulo: "Reserva/investimento parado",
      mensagem: "Suas metas de reserva ou investimento ainda estão com R$ 0 guardado. Que tal fazer o primeiro aporte?",
      rota: "/metas",
    });
  }

  return lista.sort((a, b) => ordemGravidade[a.tipo] - ordemGravidade[b.tipo]);
}

export function useNotificacoes() {
  const { currentUser } = useAuth();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [lidas, setLidas] = useState([]);
  const ultimoFetch = useRef(0);

  const storageKey = currentUser ? `finanzas_notif_lidas_${currentUser.uid}` : null;

  useEffect(() => {
    if (!storageKey) {
      setLidas([]);
      return;
    }
    try {
      setLidas(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch {
      setLidas([]);
    }
  }, [storageKey]);

  const persistir = (ids) => {
    const recorte = ids.slice(-200);
    setLidas(recorte);
    try {
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(recorte));
    } catch {
    }
  };

  const refresh = useCallback(
    async (forcar = false) => {
      if (!currentUser) return;
      const agora = Date.now();
      if (!forcar && agora - ultimoFetch.current < INTERVALO_MIN_MS) return;
      ultimoFetch.current = agora;

      setCarregando(true);
      try {
        const uid = currentUser.uid;
        const resultados = await Promise.allSettled([
          axios.get(`${API}/entradas?userId=${uid}`),
          axios.get(`${API}/saidas?userId=${uid}`),
          axios.get(`${API}/orcamentos?userId=${uid}`),
          axios.get(`${API}/metas?userId=${uid}`),
        ]);
        const pegar = (r) =>
          r.status === "fulfilled" && Array.isArray(r.value.data) ? r.value.data : [];

        setDados({
          entradas: pegar(resultados[0]),
          saidas: pegar(resultados[1]),
          orcamentos: pegar(resultados[2]),
          metas: pegar(resultados[3]),
        });
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      } finally {
        setCarregando(false);
      }
    },
    [currentUser]
  );

  const notificacoes = useMemo(() => {
    if (!dados) return [];
    return gerarNotificacoes(dados).map((n) => ({ ...n, lida: lidas.includes(n.id) }));
  }, [dados, lidas]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarComoLida = (id) => {
    if (!lidas.includes(id)) persistir([...lidas, id]);
  };

  const marcarTodasComoLidas = () => {
    const ids = notificacoes.map((n) => n.id);
    persistir([...new Set([...lidas, ...ids])]);
  };

  return {
    notificacoes,
    naoLidas,
    carregando: carregando && !dados,
    refresh,
    marcarComoLida,
    marcarTodasComoLidas,
  };
}