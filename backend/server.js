const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

app.use(limiter);


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));

// Swagger Docs
const setupSwagger = require('./swagger/swaggerConfig');
setupSwagger(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✔ Flexitec backend running on port ${PORT}`));
