const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken')


async function registerUser(req, res) {
    const { fullName: { firstName , lastName }, email, password } = req.body;

    const ifUserExists = await userModel.findOne({ email });

    if(ifUserExists) {
        res.status(409).json('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
        fullName: { firstName, lastName },
        email,
        password: hashedPassword
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token)
    res.status(201).json({ message: 'User registered successfully', token });
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(401).json('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json('Invalid email or password');
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
   res.cookie("token", token, {
  httpOnly: true,   // client-side JS access nahi karega
  secure: false,    // dev ke liye false, production (https) me true
  sameSite: "lax",  // CSRF se bachav
});

    res.status(200).json({ message: 'User logged in successfully', token , user});
}

module.exports = {
    registerUser,
    loginUser
};