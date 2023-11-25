const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const { User } = require("../models/user");
const { SECRET_KEY } = process.env;

const { HttpError, ctrlWrapper } = require("../helpers/");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  const response = {
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  };

  res.status(201).json(response);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id.toString(),
  };

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  const response = {
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  };

  res.json(response);
};

const current = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const logout = async (req, res) => {
  console.log(req.user);
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).end();
};

const updateSubscription = async (req, res) => {
  const { _id: id } = req.user;
  const { subscription } = req.body;

  if (!subscription) {
    throw HttpError(400, "missing fields subscription");
  }

  const result = await User.findByIdAndUpdate(
    id,
    { subscription },
    {
      new: true,
    }
  );

  res.json({ message: `Subscription changed to ${result.subscription}` });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    const defaultAvatarPath =
      "https://cdn-icons-png.flaticon.com/256/805/805439.png";
    const avatar = await Jimp.read(defaultAvatarPath);

    await avatar.resize(250, 250);

    const filename = `${_id}_default_avatar.jpg`;
    const resultUpload = path.join(avatarsDir, filename);

    await avatar.write(resultUpload);

    await User.findByIdAndUpdate(_id, {
      avatarURL: path.join("avatars", filename),
    });
    return res.json({ avatarURL: path.join("avatars", filename) });
  }

  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  try {
    await fs.rename(tempUpload, resultUpload);

    const avatar = await Jimp.read(resultUpload);
    await avatar.resize(250, 250);
    await avatar.write(resultUpload);

    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  current: ctrlWrapper(current),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
