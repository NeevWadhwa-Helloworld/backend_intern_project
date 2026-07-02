const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Task Management API',
      version: '1.0.0',
      description: 'Production-ready MERN Stack REST API with JWT Cookie Authentication, security middleware, input validation, and role-based task CRUD operations.',
      contact: {
        name: 'Hiring Committee - Primetrade.ai Backend Intern Assignment'
      }
    },
    servers: [
      {
        url: process.env.SWAGGER_URL || process.env.BACKEND_URL || 'http://localhost:5000',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'Secure HTTP-Only Cookie JWT session.'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Authorization header Bearer token.'
        }
      }
    }
  },
  // Absolute path helper is safer but relative path works if executed in backend directory
  apis: ['./routes/*.js', './backend/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
