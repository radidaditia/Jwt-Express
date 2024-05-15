const connection = require("../config/connection.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// registerUser(username, email, password) {
async function registerUser(name, email, password, phone) {
  try {
    // memeriksa apakah user ini ada atau tidak?
    const [existingUser] = await connection.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      throw new Error("Email already exists");
    }
    // hash password =
    const hashedPassword = await bcrypt.hash(password, 10);

    // membuat user baru
    const [newUser] = await connection.query(
      "INSERT INTO user (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone]
    );
    return {
      success: true,
      message: "User created successfully",
      data: newUser[0],
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
// User Login
async function loginUser(email, password) {
  try {
    const [existingEmailUser] = await connection.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (existingEmailUser.length === 0) {
      throw new Error("User not found");
    }

    const user = existingEmailUser[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    // generate token
    const token = jwt.sign({ id: user.id }, "bazmaSecretKey", {
      expiresIn: "7h",
    });

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
}

// get me
async function getMe(token) {
  try {
    const decoded = jwt.verify(token, "bazmaSecretKey");
    const [checkUser] = await connection.query(
      "select * from user where id =?",
      [decoded.id]
    );

    const user = checkUser[0];
    return {
      success: true,
      message: "User data fetched successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (error) {
    // throw new Error(error);
  }
}

// logout
async function logoutUser(token) {
  try {
    const decoded = jwt.verify(token, "bazmaSecretKey");
    jwt.sign({ id: decoded.id }, "bazmaSecretKey", {
      expiresIn: "7d",
    });

    return { success: true, message: "Logout successful" };
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = { registerUser, loginUser, getMe, logoutUser };
