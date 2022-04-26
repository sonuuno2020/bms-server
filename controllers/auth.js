const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Tab = require("../models/tab");
const Bookmark = require("../models/bookmark");
const Category = require("../models/category");
const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, name, password } = req.body;

  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({ name, email, password: hashedPassword });
      return user.save();
    })
    .then((result) => {
      return res
        .status(201)
        .json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email is not Found!");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong email address and password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "my secret key is deepak",
        { expiresIn: "0.5h" }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id,
        isAdmin: loadedUser.isAdmin,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.changePassword = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  let loadedUser;
  const { oldPassword, newPassword } = req.body;

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not Found!");
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(oldPassword, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong Existing Password!");
        error.statusCode = 401;
        throw error;
      }
      return bcrypt.hash(newPassword, 12).then((hashedPassword) => {
        loadedUser.password = hashedPassword;
        return loadedUser.save();
      });
    })
    .then((result) => {
      return res.status(200).json({ message: "password Updated!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      console.log(user);
      if (!user) {
        const error = new Error("User not Found!");
        error.statusCode = 404;
        throw error;
      }
      if (!user.isAdmin) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      return User.find({ _id: { $ne: user._id } }).then((users) =>
        users.map((u) => ({
          isAdmin: u.isAdmin,
          tabs: u.tabs,
          _id: u._id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
        }))
      );
    })
    .then((users) => {
      return res
        .status(200)
        .json({ users: users, message: "Users fetch successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUser = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      console.log(user);
      if (!user) {
        const error = new Error("User not Found!");
        error.statusCode = 404;
        throw error;
      }

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          _id: user._id,
        },
        message: "User fetch successfully",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.deleteUser = (req, res, next) => {
  const { deleteUserId } = req.params;

  let loadedUser;

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not Found!");
        error.statusCode = 404;
        throw error;
      }
      if (!user.isAdmin) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      return User.findById(deleteUserId);
    })
    .then((user) => {
      if (!user) {
        const error = new Error("Given User not Found!");
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;
      return User.findByIdAndRemove(deleteUserId);
    })
    .then((res) => {
      return Tab.deleteMany({ creator: loadedUser._id });
    })
    .then((res) => {
      return Category.deleteMany({ creator: loadedUser._id });
    })
    .then((res) => {
      return Bookmark.deleteMany({ creator: loadedUser._id });
    })
    .then((result) => {
      return res
        .status(200)
        .json({ data: loadedUser, message: "User deleted successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
