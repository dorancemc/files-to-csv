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

// Servir archivos estáticos en la carpeta public
app.use(express.static('public'));

// Ruta para manejar la carga del archivo
app.post('/upload', upload.single('file'), (req, res) => {
    const inputFilePath = path.join(__dirname, 'uploads', req.file.filename);
    const outputFilePath = path.join(__dirname, 'uploads', `${path.parse(req.file.filename).name}.csv`);

    // Leer el archivo de Excel
    const workbook = xlsx.readFile(inputFilePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir la hoja a CSV
    const csv = xlsx.utils.sheet_to_csv(worksheet);

    // Escribir el CSV en un archivo
    fs.writeFileSync(outputFilePath, csv);

    // Enviar el archivo CSV como respuesta
    res.download(outputFilePath, (err) => {
        if (err) {
            console.error(err);
        }

        // Limpiar los archivos subidos después de la descarga
        fs.unlinkSync(inputFilePath);
        fs.unlinkSync(outputFilePath);
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});