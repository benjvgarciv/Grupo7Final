const multer = require('multer');

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const isValid = allowed.test(file.mimetype.toLowerCase()) && allowed.test(file.originalname.toLowerCase());
  if (!isValid) {
    return cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
