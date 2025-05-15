const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');
const apiGateway = require('./middleware/apiGateway');

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 🔁 Centralized API Gateway
app.use('/api', apiGateway);

// 👇 Routes (automatically protected unless under /auth)
app.use('/api/auth', authRoutes);   // Public
app.use('/api/users', userRoutes);  // Protected
app.use('/api/cards', cardRoutes);  // Protected

// 📘 Swagger Docs (public)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✔ Flexitec backend running on port ${PORT}`);
});
