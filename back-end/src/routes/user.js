const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.authenticate, authMiddleware.isAdmin, userController.getAllUsers);
router.get('/info', authMiddleware.authenticate, userController.getCurrentUser);
router.get('/:id', authMiddleware.authenticate, userController.getUserById);
router.put('/:id', authMiddleware.authenticate, userController.updateUserById);
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, userController.deleteUsersByIds);
router.post('/:id/register-course', userController.addRegistrationCourse);

module.exports = router;
