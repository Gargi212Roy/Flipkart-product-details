const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const HttpException = require("../exception/httpException");
const { isValidEmail } = require("../utils/isValidEmail");

exports.signUpUser = async (req, res) => {
  try {
    if (!req.body) throw new HttpException(400, "Form data absent!!");

    const { name, email, password, confirmPassword } = req.body;

    if (!name) throw new HttpException(400, "Name field cannot be empty");

    if (!email) throw new HttpException(400, "Email field cannot be empty");

    if (!isValidEmail(email))
      throw new HttpException(400, "Invalid email format!");

    if (!password)
      throw new HttpException(400, "Password field cannot be empty");

    if (password.length < 8 || password.length > 20)
      throw new HttpException(
        400,
        "Invalid. Password length should be between 8-20"
      );

    if (!confirmPassword)
      throw new HttpException(400, "Confirm password field cannot be empty");

    if (password !== confirmPassword)
      throw new HttpException(400, "Password should match confirm password");

    const user = await Users.findOne({ email });

    if (user)
      throw new HttpException(400, `User with ${email} already exists!`);

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new Users({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(200)
      .json({ success: true, message: "User Signed up Successfully!!" });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || " Sign Up Failed!!" });
  }
};

exports.logInUser = async (req, res) => {
  try {
    if (!req.body) throw new HttpException(400, "Form data absent!!");

    const { email, password } = req.body;

    if (!email) throw new HttpException(400, "Email field cannot be empty");

    if (!isValidEmail(email))
      throw new HttpException(400, "Invalid email format!");

    if (!password)
      throw new HttpException(400, "Password field cannot be empty");

    if (password.length < 8 || password.length > 20)
      throw new HttpException(
        400,
        "Invalid. Password length should be between 8-20"
      );
    const user = await Users.findOne({ email });

    if (!user)
      throw new HttpException(404, `${user} with email does not exist!`);

    if (!bcrypt.compareSync(password, user.password))
      throw new HttpException(400, "Invalid Password!");

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: 60 * 60 * 24,
    });

    return res.status(200).json({ success: true, token });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Login Failed!!" });
  }
};
