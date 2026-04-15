const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('employee/index');
});

module.exports = router;
