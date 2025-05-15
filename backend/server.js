const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));

// Swagger Docs
const setupSwagger = require('./swagger/swaggerConfig');
setupSwagger(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✔ Flexitec backend running on port ${PORT}`));
