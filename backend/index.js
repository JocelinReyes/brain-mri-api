const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

// Configuración CORS más permisiva
app.use(cors({
  origin: [
    'https://brain-mri-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configuración de multer para upload de archivos
const upload = multer({ dest: 'uploads/' });

// Middleware para manejar preflight requests
app.options('*', cors());

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Brain MRI Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'Brain MRI API',
    endpoints: {
      health: '/health',
      stats: '/api/patients/stats/',
      mask_stats: '/api/images/mask_stats/',
      patients: '/api/patients/',
      images: '/api/images/',
      upload: '/api/upload-csv/'
    }
  });
});

// Ruta de estadísticas de pacientes
app.get('/api/patients/stats/', (req, res) => {
  console.log('📊 Stats endpoint called');
  res.json({
    total_patients: 150,
    total_images: 200,
    images_with_mask: 150,
    mask_percentage: 75
  });
});

// Ruta de estadísticas de máscaras
app.get('/api/images/mask_stats/', (req, res) => {
  console.log('🎭 Mask stats endpoint called');
  res.json({
    mask_0: 50,   // imágenes sin máscara
    mask_1: 150   // imágenes con máscara
  });
});

// Ruta de lista de pacientes
app.get('/api/patients/', (req, res) => {
  console.log('👥 Patients endpoint called');
  res.json([
    { id: 1, patient_id: "P001", image_count: 5, mask_count: 3 },
    { id: 2, patient_id: "P002", image_count: 8, mask_count: 6 },
    { id: 3, patient_id: "P003", image_count: 3, mask_count: 2 },
    { id: 4, patient_id: "P004", image_count: 7, mask_count: 5 },
    { id: 5, patient_id: "P005", image_count: 4, mask_count: 3 }
  ]);
});

// Ruta de lista de imágenes
app.get('/api/images/', (req, res) => {
  console.log('🖼️ Images endpoint called');
  res.json([
    { 
      id: 1, 
      patient_id: "P001", 
      image_path: "images/brain_001.png", 
      mask_path: "masks/mask_001.png", 
      mask: 1 
    },
    { 
      id: 2, 
      patient_id: "P002", 
      image_path: "images/brain_002.png", 
      mask_path: "masks/mask_002.png", 
      mask: 0 
    },
    { 
      id: 3, 
      patient_id: "P003", 
      image_path: "images/brain_003.png", 
      mask_path: "masks/mask_003.png", 
      mask: 1 
    }
  ]);
});

// Ruta para upload de CSV
app.post('/api/upload-csv/', upload.single('csv_file'), (req, res) => {
  console.log('📁 Upload CSV endpoint called');
  res.json({
    message: 'CSV uploaded successfully',
    rows_processed: 25,
    status: 'completed',
    filename: req.file ? req.file.originalname : 'No file'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Brain MRI Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Frontend URL: https://brain-mri-frontend.onrender.com`);
});