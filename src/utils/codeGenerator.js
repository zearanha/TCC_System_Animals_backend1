const AppError = require("./AppError");

function createCode() {
  const number = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `GB${number}`;
}

async function generateUniqueAnimalCode(prismaClient, maxAttempts = 10000) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const codigo = createCode();
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
