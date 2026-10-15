const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');


router.use(authMiddleware);

router.get('/profile', require('../controllers/userController').getUserProfile);
router.put('/profile', require('../controllers/userController').updateUserProfile);
router.delete('/profile', require('../controllers/userController').deleteUserProfile);


router.get('/', require('../controllers/userController').getAllUsers);
router.get('/:id', require('../controllers/userController').getUserById);




router.use(adminMiddleware);

router.get('/:id/channels', require('../controllers/userController').getUserChannels);
router.get('/:id/messages', require('../controllers/userController').getUserMessages);

router.put('/:id', require('../controllers/userController').updateUserById);
router.delete('/:id', require('../controllers/userController').deleteUserById);


module.exports = router;