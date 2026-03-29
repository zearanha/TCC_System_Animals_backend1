function logInfo(message, meta) {
  if (meta) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
    return;
  }
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

function logError(message, meta) {
  if (meta) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
    return;
  }
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
}

module.exports = {
  logInfo,
  logError,
};
