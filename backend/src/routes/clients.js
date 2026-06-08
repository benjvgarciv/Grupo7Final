const router = require('express').Router();
const { body, param } = require('express-validator');
const ctrl = require('../controllers/clientController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', authMiddleware, ctrl.getAll);
router.get(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID de cliente inválido.'), validate],
  ctrl.getById
);
router.post(
  '/',
  authMiddleware,
  [
    body('rut').notEmpty().withMessage('RUT es requerido.'),
    body('nombre').notEmpty().withMessage('Nombre es requerido.'),
    body('email').optional().isEmail().withMessage('Email inválido.'),
    validate,
  ],
  ctrl.create
);
router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isInt().withMessage('ID de cliente inválido.'),
    body('nombre').optional().notEmpty().withMessage('Nombre no puede quedar vacío.'),
    body('email').optional().isEmail().withMessage('Email inválido.'),
    validate,
  ],
  ctrl.update
);
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID de cliente inválido.'), validate],
  ctrl.remove
);

module.exports = router;
