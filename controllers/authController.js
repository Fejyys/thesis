const { User } = require("../models");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
require('dotenv').config();
exports.login = async (req, res) => {
  try {
    let { username, password } = req.body;

    username = validator.escape(username);

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._deleted) {
      return res.status(403).json({ message: "User account is deleted" });
    }

    const isMatch = await bcrypt.compare(
      password + user.salt,
      user.password_hash,
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, admin: user._admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    user._last_login = Date.now()
    await user.save()
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isAlphanumeric(username)) {
      return res.status(400).json({ message: "Username must be alphanumeric" });
    }

    if (!validator.isLength(password, { min: 6 })) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (!validator.isLength(username, { min: 3, max: 20 })) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters long",
      });
    }

    username = validator.escape(username);

    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    salt = await bcrypt.genSalt(5);
    user = await User.create({
      username,
      nickname: username,
      password_hash: await bcrypt.hash(password + salt, 10),
      salt: salt,
      status: "active",
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, admin: user._admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({token});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
