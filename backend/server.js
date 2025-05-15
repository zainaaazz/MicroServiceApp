const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');

// Middleware
const apiGateway = require('./middleware/apiGateway');

// Swagger
const { swaggerSpec, swaggerUi } = require('./swagger/swaggerConfig');

// Load .env variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ⛳ API Gateway: rate limiting, JWT, role filtering
app.use('/api', apiGateway);

// 🔐 Route registration (protected by gateway unless under /auth or /docs)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);

// 📘 Swagger docs UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 📄 Serve Swagger JSON (needed for UI to load API definition)
app.get('/api/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✔ Flexitec backend running on port ${PORT}`);
  console.log(`🔗 Swagger docs available at http://localhost:${PORT}/api/docs   \nSWAGGER: http://localhost:5000/api/docs`);
});
