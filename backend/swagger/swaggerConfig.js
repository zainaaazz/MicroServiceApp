// backend/swagger/swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flexitec Banking API',
      version: '1.0.0',
      description: 'This API allows customers and bank staff to interact with the Flexitec banking system securely.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
  },
  // 🔎 These are the folders Swagger will scan for route annotations
  apis: ['./routes/*.js', './controllers/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi,
};
