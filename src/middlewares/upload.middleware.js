const fs = require("fs");
const path = require("path");
const multer = require("multer");
const AppError = require("../utils/AppError");
const { uploadsRoot, ensureUploadsRoot } = require("../utils/uploads");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ensureUploadDir(dirName) {
  ensureUploadsRoot();
  const dirPath = path.join(uploadsRoot, dirName);
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function createStorage(dirName) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destination = ensureUploadDir(dirName);
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      cb(null, fileName);
    },
  });
}

function imageFileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(
      new AppError(
        "Formato de arquivo nao suportado. Envie imagens JPG, PNG ou WEBP.",
        400
      )
    );
    return;
  }

  cb(null, true);
}

const uploadProprietarioFoto = multer({
  storage: createStorage("proprietarios"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

const uploadIdentificacaoImagens = multer({
  storage: createStorage("identificacoes"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 5,
  },
});

module.exports = {
  uploadProprietarioFoto,
  uploadIdentificacaoImagens,
};
