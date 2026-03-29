function normalizeCPF(cpf) {
  return (cpf || "").replace(/\D/g, "");
}

function isValidCPF(cpf) {
  const normalized = normalizeCPF(cpf);

  if (!/^\d{11}$/.test(normalized)) return false;
  if (/^(\d)\1{10}$/.test(normalized)) return false;

  const digits = normalized.split("").map(Number);

  const calcDigit = (sliceLength) => {
    const sum = digits
      .slice(0, sliceLength)
      .reduce((acc, value, idx) => acc + value * (sliceLength + 1 - idx), 0);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const firstDigit = calcDigit(9);
  const secondDigit = calcDigit(10);

  return firstDigit === digits[9] && secondDigit === digits[10];
}

module.exports = {
  normalizeCPF,
  isValidCPF,
};
