const db = require("./db");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const query = `SELECT * FROM patient where email = '${req.body.Email}'`;
    const [data] = await db.query(query)

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
    console.log(values)
    const creationQuery = "INSERT INTO patient (FName, MName, LName, Dob, Address, PhoneNumber, GenderCode, RaceCode, EthnicityCode, HasInsurance, Email, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await db.query(creationQuery, values) ;
    res.json("user created!")
    }
  catch(err){ res.status(500).json(err)}

};


module.exports = { register };
