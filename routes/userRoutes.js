const express = require('express');
const router = express.Router();
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

//AUTHENTICATION ROUTES
router.post('/singup', authController.singUp);
router.post('/login', authController.logIn);

router.post('/forgetpassword', authController.forgetPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatemypassword', authController.updatePassword);

//Account updation by Account Owner
router.patch('/updatemyownprofile', userController.updateMyOwnProfile);
router.delete('/deletemyownprofile', userController.deleteMyOwnProfile);

router.get('/aboutme', userController.aboutMe, userController.getUserById);

router
  .route('/')
  .get(
    authController.authorizedPerson('admin', 'lead-guide'),
    userController.getAllUsers
  );

router
  .route('/:id')
  .get(
    authController.authorizedPerson('admin', 'lead-guide'),
    userController.getUserById
  )
  .patch(
    authController.authorizedPerson('admin', 'lead-guide'),
    userController.updateUserById
  )
  .delete(
    authController.authorizedPerson('admin', 'lead-guide'),
    userController.deleteUser
  );

module.exports = router;
