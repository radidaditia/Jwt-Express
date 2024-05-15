const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../Model/authModel");
const { body, validationResult } = require("express-validator");

async function register(req, res) {
  const validations = [
    body("name").notEmpty().withMessage("Username is required"),
    body("email").notEmpty().isEmail().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
  ];

  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errMsg = errors.array().map((error) => ({
      [error.path]: error.msg,
    }));
    return res.status(422).json({
      status: false,
      message: "error validation fields",
      error: errMsg,
    });
  }

  const { name, email, password, phone } = req.body;
  try {
    const result = await registerUser(name, email, password, phone);
    if (result.success) {
      res.status(201).json({
        success: result.success,
        message: result.message,
      });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.msg,
    });
  }
}

// login
async function login(req, res) {
  const validation = [
    body("email").notEmpty().isEmail().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
  await Promise.all(validation.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMsg = errors.array().map((error) => ({
      [error.path]: error.msg,
    }));
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: errMsg,
    });
  }

  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
        token: result.token,
      });
    } else {
      res.status(401).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
// Getme
async function me(req, res) {
  try {
    const token = req.headers.authorization;
    const user = await getMe(token);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    if (user.success) {
      res.status(200).json({
        success: user.success,
        message: user.message,
        data: user.data,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Failed to fetch user data" });
  }
}

//logout
async function logout(req, res) {
  try {
    const token = req.headers.authorization;
    const result = await logoutUser(token);
    if (!result) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    if (result.success) {
      res.status(201).json({
        success: result.success,
        message: result.message,
      });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error(error);
  }
}
module.exports = { register, login, me, logout };
