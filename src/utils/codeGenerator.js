const AppError = require("./AppError");

function getOwnerInitials(ownerName = "") {
  const normalizedName = ownerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim();

  if (!normalizedName) return "XX";

  const words = normalizedName.split(/\s+/).filter(Boolean);

  const firstInitial = (words[0]?.[0] ?? "X").toUpperCase();
  const secondInitial =
    words.length > 1
      ? (words[words.length - 1]?.[0] ?? "X").toUpperCase()
      : (words[0]?.[1] ?? "X").toUpperCase();

  return `${firstInitial}${secondInitial}`;
}

function createCode(ownerName) {
  const initials = getOwnerInitials(ownerName);
  const number = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${initials}${number}`;
}

async function generateUniqueAnimalCode(
  prismaClient,
  ownerName,
  maxAttempts = 10000
) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const codigo = createCode(ownerName);
    const existing = await prismaClient.identificacao.findUnique({
      where: { codigo },
      select: { id: true },
    });

    if (!existing) return codigo;
  }

  throw new AppError(
    "Nao foi possivel gerar um codigo unico de identificacao.",
    500
  );
}

module.exports = {
  generateUniqueAnimalCode,
};
