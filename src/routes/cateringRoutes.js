const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  toggleAvailability,
} = require('../controllers/cateringController');

router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);
router.patch('/:id/availability', toggleAvailability);

module.exports = router;
