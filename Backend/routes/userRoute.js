// backend/routes/userRoute.js
const express = require('express');
const router = express.Router();
const { User } = require("../db/models");
const { uploadImage } = require('../utils/multerConfig');  // Importation de uploadImage
const authenticateToken = require('../utils/authMiddleware');
const { addUserController, loginUserController, logoutUserController, 
        updatePasswordController, getAllUsers, getOnceUser, getUserByName,
        updateUserController, updateProfileController, getUserByIdController,
        getAuthenticatedUser, forgotPasswordController, modifyPasswordController,
        getUser,deleteUser,
        updateUserProfileController} = require('../controllers/usercontroller'); // On utilise maintenant userController pour tout

router.get('/auth', getAuthenticatedUser);
router.post('/login', loginUserController);
router.post('/logout', logoutUserController);
router.post("/change-password", authenticateToken, updatePasswordController);
router.post('/forgot-password', forgotPasswordController);
router.post('/update-password', modifyPasswordController);
router.post('/register', authenticateToken, addUserController);
router.post('/change-password', authenticateToken, updatePasswordController);
router.get('/getOnce', authenticateToken, getOnceUser);
router.put('/edit/:id', authenticateToken, uploadImage.single('photo'), updateUserController);//admin
router.get('/getAll', authenticateToken, getAllUsers);
router.get('/getById/:id', authenticateToken, getUserByIdController);
router.get('/getUser/:id', authenticateToken, getUser );
//router.put('/profile/:id', authenticateToken,uploadImage.single('photo'), updateProfileController);
router.put('/UpdateUser/:id', uploadImage.single("photo"), authenticateToken, updateUserProfileController);
router.delete('/delete/:id', authenticateToken, deleteUser);
// Autres routes
router.get('/:name', getUserByName);


module.exports = router;