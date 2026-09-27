const { User } = require("../models");
const validator = require("validator");

exports.getUserProfile = async (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    status: user.status,
    status_message: user.status_message,
    _last_login: user._last_login,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  });
};

exports.updateUserProfile = async (req, res) => {
  const user = req.user;
  let { nickname, status, status_message } = req.body;

  if (typeof nickname != undefined && nickname != null) {
    if (!validator.isLength(nickname, { min: 3, max: 20 })) {
      return res
        .status(400)
        .json({ error: "Nickname must be between 3 and 20 characters long." });
    }
    nickname = validator.escape(nickname);
  } else nickname = user.nickname;
  if (typeof status != undefined && status != null) {
    if (!validator.isIn(status, ["active", "offline", "inactive", "busy"])) {
      return res.status(400).json({ error: "Invalid status." });
    }
  } else status = user.status;
  if (typeof status_message != undefined && status_message != null) {
    if (!validator.isLength(status_message, { max: 200 })) {
      return res
        .status(400)
        .json({ error: "Status message must be at most 200 characters long." });
    }
    status_message = validator.escape(status_message);
  } else status_message = user.status_message;
  user.nickname = nickname;
  user.status = status;
  user.status_message = status_message;
  await user.save();

  res.json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    status: user.status,
    status_message: user.status_message,
    _last_login: user._last_login,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  });
};

exports.deleteUserProfile = async (req, res) => {
  const user = req.user;
  user._deleted = true;
  await user.save();
  res.json({ message: "User profile deleted successfully." });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: [
      "id",
      "username",
      "nickname",
      "status",
      "status_message",
      "_last_login",
      "createdAt",
    ],
  });
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "username",
      "nickname",
      "status",
      "status_message",
      "_last_login",
      "createdAt",
    ],
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

exports.updateUserById = async (req, res) => {
  const userId = req.params.id;
  const { nickname, status, status_message, _admin } = req.body;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (typeof nickname != undefined && nickname != null) {
    if (!validator.isLength(nickname, { min: 3, max: 20 })) {
      return res
        .status(400)
        .json({ error: "Nickname must be between 3 and 20 characters long." });
    }
    nickname = validator.escape(nickname);
  } else nickname = user.nickname;

  if (typeof status != undefined && status != null) {
    if (!validator.isIn(status, ["active", "offline", "inactive", "busy"])) {
      return res.status(400).json({ error: "Invalid status." });
    }
  } else status = user.status;

  if (typeof status_message != undefined && status_message != null) {
    if (!validator.isLength(status_message, { max: 200 })) {
      return res
        .status(400)
        .json({ error: "Status message must be at most 200 characters long." });
    }
    status_message = validator.escape(status_message);
  } else status_message = user.status_message;

  if (typeof _admin != undefined && _admin != null) {
    if (!validator.isBoolean(_admin, {loose: true})) {
      return res
        .status(400)
        .json({ error: "Admin value must be a True or False!" });
    } else _admin = user._admin;
  }
  user.nickname = nickname;
  user.status = status;
  user.status_message = status_message;
  user._admin = _admin;
  await user.save();

  res.json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    status: user.status,
    status_message: user.status_message,
    _last_login: user._last_login,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  });
};

exports.deleteUserById = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user._deleted = true;
  await user.save();
  res.json({ message: "User deleted successfully." });
};

exports.getUserChannels = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const channels = await user.getChannels({
    attributes: ["id", "name", "createdAt"],
  });
  res.json(channels);
};

exports.getUserMessages = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const messages = await user.getMessages({
    attributes: ["id", "body", "createdAt"],
  });
  res.json(messages);
};
