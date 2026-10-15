export const categoriasSaida = {
  moradia: { icon: "🏠", label: "Moradia", gradient: "linear(to-r, #667eea, #764ba2)" },
  alimentacao: { icon: "🍽️", label: "Alimentação", gradient: "linear(to-r, #fc4a1a, #f7b733)" },
  transporte: { icon: "🚗", label: "Transporte", gradient: "linear(to-r, #4facfe, #00f2fe)" },
  lazer: { icon: "🎮", label: "Lazer", gradient: "linear(to-r, #f093fb, #f5576c)" },
  saude: { icon: "💊", label: "Saúde", gradient: "linear(to-r, #11998e, #38ef7d)" },
  educacao: { icon: "📚", label: "Educação", gradient: "linear(to-r, #a770ef, #cf8bf3)" },
  assinaturas: { icon: "📺", label: "Assinaturas", gradient: "linear(to-r, #ee0979, #ff6a00)" },
  outros: { icon: "💸", label: "Outros", gradient: "linear(to-r, #a8edea, #fed6e3)" },
};

const categoriaMetas = { icon: "🎯", label: "Metas", gradient: "linear(to-r, #fc4a1a, #f7b733)" };

export const categoriaDe = (key) =>
  key === "metas" ? categoriaMetas : categoriasSaida[key] || categoriasSaida.outros;