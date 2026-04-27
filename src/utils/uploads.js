const fs = require("fs");
const path = require("path");

const uploadsRoot = path.resolve(process.cwd(), "uploads");

function ensureUploadsRoot() {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

function normalizeRelativePath(relativePath) {
  return String(relativePath ?? "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .trim();
}

function toPublicUploadUrl(absoluteFilePath) {
  const relativePath = path.relative(uploadsRoot, absoluteFilePath);
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  return `/uploads/${normalizedRelativePath}`;
}

function resolveUploadAbsolutePath(uploadUrl) {
  if (!uploadUrl || typeof uploadUrl !== "string") return null;
  if (!uploadUrl.startsWith("/uploads/")) return null;

  const relativePath = normalizeRelativePath(uploadUrl.replace("/uploads/", ""));
  if (!relativePath) return null;

  const absolutePath = path.resolve(uploadsRoot, relativePath);
  const allowedPrefix = `${uploadsRoot}${path.sep}`;

  if (absolutePath !== uploadsRoot && !absolutePath.startsWith(allowedPrefix)) {
    return null;
  }

  return absolutePath;
}

async function removeUploadByUrl(uploadUrl) {
  const absolutePath = resolveUploadAbsolutePath(uploadUrl);
  if (!absolutePath) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

module.exports = {
  uploadsRoot,
  ensureUploadsRoot,
  toPublicUploadUrl,
  resolveUploadAbsolutePath,
  removeUploadByUrl,
};
