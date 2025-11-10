const express = require('express');
const cors = require('cors');
const app = express();

// Configuración CORS MUY permisiva para desarrollo
app.use(cors({
  origin: '*',  // Permite todos los orígenes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para preflight
app.options('*', cors());

app.use(express.json());

// Ruta de salud - SIMPLE
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
    message: 'Brain MRI API - Working!',
    version: '1.0.0'
  });
});

// Ruta de estadísticas de pacientes
app.get('/api/patients/stats/', (req, res) => {
  res.json({
    total_patients: 150,
    total_images: 200,
    images_with_mask: 150,
    mask_percentage: 75
  });
});

// Ruta de estadísticas de máscaras
app.get('/api/images/mask_stats/', (req, res) => {
  res.json({
    mask_0: 50,
    mask_1: 150
  });
});

// Ruta de lista de pacientes
app.get('/api/patients/', (req, res) => {
  res.json([
    { id: 1, patient_id: "P001", image_count: 5, mask_count: 3 },
    { id: 2, patient_id: "P002", image_count: 8, mask_count: 6 }
  ]);
});

// Ruta de lista de imágenes
app.get('/api/images/', (req, res) => {
  res.json([
    { 
      id: 1, 
      patient_id: "P001", 
      image_path: "images/brain_001.png", 
      mask_path: "masks/mask_001.png", 
      mask: 1 
    }
  ]);
});

// Ruta para upload de CSV
app.post('/api/upload-csv/', (req, res) => {
  res.json({
    message: 'CSV upload endpoint ready',
    status: 'success'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
