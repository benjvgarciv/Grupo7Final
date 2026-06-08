const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/',       authMiddleware, ctrl.getAll);
router.post('/',      authMiddleware, requireRole(['admin']), ctrl.create);
router.put('/:id',    authMiddleware, requireRole(['admin']), ctrl.update);
router.delete('/:id', authMiddleware, requireRole(['admin']), ctrl.remove);

module.exports = router;
