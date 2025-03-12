const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(cors({ origin: "*" }));  

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/otp', require('./routes/otp'))

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})