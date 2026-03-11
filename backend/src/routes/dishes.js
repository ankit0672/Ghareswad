const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect, chefOnly } = require('../middleware/auth');
const {
    uploadDish,
    getAllDishes,
    getMyDishes,
    toggleAvailability,
    deleteDish,
} = require('../controllers/dishController');

// Public
router.get('/', getAllDishes);

// Chef protected
router.post('/', protect, chefOnly, upload.single('photo'), uploadDish);
router.get('/my', protect, chefOnly, getMyDishes);
router.patch('/:id/toggle', protect, chefOnly, toggleAvailability);
router.delete('/:id', protect, chefOnly, deleteDish);

module.exports = router;
