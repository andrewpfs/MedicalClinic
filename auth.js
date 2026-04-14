const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const query = 'SELECT * FROM patient WHERE email = ?';
    const [data] = await db.query(query, [req.body.Email]);

    if (data.length) return res.status(409).json("User already exists!");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.Password, salt);

    const values = [
      req.body.FName,
      req.body.MName || null,
      req.body.LName,
      req.body.Dob,
      req.body.Address,
      req.body.PhoneNumber,
      req.body.GenderCode || null,
      req.body.RaceCode || null,
      req.body.EthnicityCode || null,
      req.body.HasInsurance ? 1 : 0,
      req.body.Email,
      hashedPassword,
    ];

    const creationQuery = "INSERT INTO patient (FName, MName, LName, Dob, Address, PhoneNumber, GenderCode, RaceCode, EthnicityCode, HasInsurance, Email, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await db.query(creationQuery, values);
    res.json({ success: true, message: "User created!" });

  } catch (err) {
    res.status(500).json(err);
  }
};

const login = async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM patient WHERE Email = ?', [req.body.Email]);
    if (data.length === 0) return res.status(404).json("User not found!");

    const checkPassword = bcrypt.compareSync(req.body.Password, data[0].Password);
    if (!checkPassword) return res.status(400).json("Wrong password or username");

    req.session.patientId = data[0].PatientID;

    const token = jwt.sign({ id: data[0].PatientID }, "secretkey", { expiresIn: "24h" });

    res.cookie("accessToken", token, { httpOnly: true })
       .json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("accessToken").json({ success: true });
  });
};

module.exports = { register, login, logout };
