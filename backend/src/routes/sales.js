const router = require('express').Router();
const ctrl = require('../controllers/saleController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/',           authMiddleware, ctrl.getAll);
router.get('/:id',        authMiddleware, ctrl.getById);
router.post('/',          authMiddleware, ctrl.create);
router.put('/:id/cancel', authMiddleware, requireRole(['admin']), ctrl.cancel);

module.exports = router;
