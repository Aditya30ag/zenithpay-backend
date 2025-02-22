const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser.js");

const db = require('../db');

router.post(
  "/createuser",
  [
    body("aadharNumber", "enter the valid aadharNumber").isLength({ min: 9 }),
    body("voterid", "enter the valid voterid").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      success = false;
      return res.json({ success, errors: result.array() });
    }
    try {
      let aaaa = await User.findOne({ aadharNumber: req.body.aadharNumber });
      if (aaaa) {
        return res.json({
          success: false,
          error: "please enter a unique value for aadharNumber",
        });
      }

      const salt = await bcrypt.genSaltSync(10);
      const secAadhar = await bcrypt.hash(req.body.aadharNumber, salt);

      user = await User.create({
        aadharNumber: secAadhar,
        voterid:req.body.voterid,
        isvoted: req.body.isvoted,
        otp:req.body.otp,
      });
      /*.then(res.send(req.body))
      .catch(err=>{console.log(err)
        res.json({error:"please enter a unique value for email",message:err.message})
      })*/
      console.log(req.body);
      const data = {
        user: {
          id: user.id,
        },
      };
      var token = jwt.sign(data, "shhhhh");
      success = true;
      res.json({ success, token });
      await user.save();
    } catch (error) {
      console.error(error.message);
      success = false;
      res.status(500).send(success, "some error occured");
    }
  }
);
const loginValidation = [
  body('addhar_number').notEmpty().withMessage('Addhar number is required'),
  body('email').notEmpty().withMessage('Email is required'),
  body('phonenumber').notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { addhar_number,email,phonenumber, password } = req.body;
    console.log('Attempting login for account:', addhar_number,email,phonenumber); // Debug log

    // Modified query to check exact credentials
    const query = `
      SELECT * FROM users 
      WHERE addhar_number = ? 
      AND is_active = 1
    `;
    
    db.query(query, [addhar_number], async (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ message: 'Database error', error: error.message });
      }

      console.log('Query results:', results.length > 0 ? 'User found' : 'No user found'); // Debug log

      if (results.length === 0) {
        return res.status(401).json({ message: 'Account number not found' });
      }

      const user = results[0];
      if (email !== user.email) {
        return res.status(401).json({ message: 'Invalid email' });
      }
      if (phonenumber !== user.phonenumber) {
        return res.status(401).json({ message: 'Invalid phonenumber' });
      }
      // For debugging - log password comparison (never do this in production!)
      console.log('Comparing passwords...');
      
      // Since the password in the database is plaintext (which is not recommended),
      // we'll do a direct comparison instead of using bcrypt
      if (password !== user.password) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          phonenumber: user.phonenumber 
        },
        process.env.JWT_SECRET || 'your-secret-key',  // Fallback secret (not for production)
        { expiresIn: '1h' }
      );

      // Send success response with more details
      res.json({
        status: 'success',
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          userdetails:user
        }
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Add a test route to verify database connection
router.get('/test-connection', (req, res) => {
  db.query('SELECT 1', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database connection failed', error: err.message });
    }
    res.json({ message: 'Database connection successful' });
  });
});

router.put("/updateuser/:id",async (req, res) => {
  try {
    const { name, email, aadharNumber, isvoted } = req.body;
    const newNote = {};
    if (name) {
      newNote.name = name;
    }
    if (email) {
      newNote.email = email;
    }
    if (aadharNumber) {
      newNote.aadharNumber = aadharNumber;
    }
    if (isvoted) {
      newNote.isvoted = isvoted;
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("please use the correct credentials");
    }

    /*if (user.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }*/

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ user });
    console.log(newNote);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }
});

module.exports = router;
