const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de multer para guardar archivos subidos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware para manejar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos en la carpeta public
app.use(express.static('public'));

// Ruta para manejar la carga del archivo
app.post('/upload', upload.single('file'), (req, res) => {
    const inputFilePath = path.join(__dirname, 'uploads', req.file.filename);

    // Leer el archivo de Excel
    const workbook = xlsx.readFile(inputFilePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir la hoja a CSV
    const csv = xlsx.utils.sheet_to_csv(worksheet);

    // Enviar el archivo CSV como respuesta
    res.json({
        original: req.file.originalname,
        csv: csv
    });
});

// Ruta para exportar el contenido editado
app.post('/export', (req, res) => {
    const { content } = req.body;

    const outputFilePath = path.join(__dirname, 'uploads', 'exported.csv');
    fs.writeFileSync(outputFilePath, content);

    res.download(outputFilePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
