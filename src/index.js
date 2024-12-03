const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/item_route');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
app.use('/api/items', productRoutes);

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
