const router = require('express').Router();
const { body, param } = require('express-validator');
const ctrl = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

router.get('/', authMiddleware, ctrl.getAll);
router.get('/:id',[
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('ID de producto inválido.'),
  validate,
], ctrl.getById);
router.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  upload.single('imagen'),
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0.'),
    body('categoria_id').optional().isInt({ gt: 0 }).withMessage('La categoría debe ser un ID válido.'),
    validate,
  ],
  ctrl.create
);
router.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  upload.single('imagen'),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID de producto inválido.'),
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0.'),
    body('categoria_id').optional().isInt({ gt: 0 }).withMessage('La categoría debe ser un ID válido.'),
    validate,
  ],
  ctrl.update
);
router.delete('/:id', authMiddleware, requireRole(['admin']), ctrl.remove);

module.exports = router;
