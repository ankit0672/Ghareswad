const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect, chefOnly, customerOnly } = require('../middleware/auth');
const {
    uploadDish,
    getAllDishes,
    getMyDishes,
    toggleAvailability,
    deleteDish,
    updatePhoto,
    rateDish,
} = require('../controllers/dishController');

// Public
router.get('/', getAllDishes);

// Chef protected
router.post('/', protect, chefOnly, upload.single('photo'), uploadDish);
router.get('/my', protect, chefOnly, getMyDishes);
router.patch('/:id/toggle', protect, chefOnly, toggleAvailability);
router.patch('/:id/photo', protect, chefOnly, upload.single('photo'), updatePhoto);
router.delete('/:id', protect, chefOnly, deleteDish);

// Customer protected
router.post('/:id/rate', protect, customerOnly, rateDish);

module.exports = router;

