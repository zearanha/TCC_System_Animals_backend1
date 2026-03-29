const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(200).json(result);
});

const registerProprietario = asyncHandler(async (req, res) => {
  const result = await authService.registerProprietario(req.body);
  return res.status(201).json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.auth.userId);
  return res.status(200).json(user);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.auth.token);
  return res.status(204).send();
});

module.exports = {
  login,
  registerProprietario,
  me,
  logout,
};
