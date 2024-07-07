const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/photo-upload', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Photo model
const PhotoSchema = new mongoose.Schema({
    filename: String,
    date: { type: Date, default: Date.now }
});

const Photo = mongoose.model('Photo', PhotoSchema);

// Serve static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
    try {
        const photos = await Photo.find().sort({ date: -1 });
        res.render('index', { photos, msg: '' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.post('/upload', async (req, res) => {
    try {
        const photos = await Photo.find().sort({ date: -1 });
        upload(req, res, (err) => {
            if (err) {
                res.render('index', { msg: err, photos });
            } else {
                if (req.file == undefined) {
                    res.render('index', { msg: 'Error: No File Selected!', photos });
                } else {
                    const newPhoto = new Photo({ filename: req.file.filename });
                    newPhoto.save().then(() => res.redirect('/'));
                }
            }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
