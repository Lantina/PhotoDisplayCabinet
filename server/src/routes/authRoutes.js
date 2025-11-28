const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);

router.post('/register', authController.userRegister);
router.post('/user/login', authController.userLogin);

router.get('/users/pending', authenticateToken, authController.getPendingUsers);
router.post('/users/:id/approve', authenticateToken, authController.approveUser);
router.post('/users/:id/reject', authenticateToken, authController.rejectUser);
router.get('/users', authenticateToken, authController.getAllUsers);

module.exports = router;

