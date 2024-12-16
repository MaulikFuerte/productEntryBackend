const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./src/routes/itemRoute');
const companyRoutes = require('./src/routes/companyRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const subCategoryRoutes = require('./src/routes/subCategoryRoutes');
const brandRoutes = require('./src/routes/brandRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
app.use('/api/items', productRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/category', categoryRoutes); // Add category route
app.use('/api/subCategory', subCategoryRoutes); // Add subcategory route
app.use('/api/brands ', brandRoutes); // Add brand

const mongoURI = 'mongodb+srv://maulikfuerte:AcPz4qnrBebR3cKp@productentry.w9ohl.mongodb.net/?retryWrites=true&w=majority&appName=productEntry';

// Database Connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
