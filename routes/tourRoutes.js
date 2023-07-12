const express = require('express');
const router = express.Router();
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./reviewRoutes');

router.use('/:tourId/review', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tour-stats')
  .get(
    authController.protect,
    authController.authorizedPerson('admin', 'lead-guide'),
    tourController.getTourStats
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:mi')
  .get(tourController.getAllWithin);

router
    .route('/distance/:latlng/unit/:unit')
    .get(tourController.getDistance)
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.authorizedPerson('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );
// router
//   .route('/getTourStats')
//   .get(tourController.getTourStats);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.authorizedPerson('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.authorizedPerson('admin', 'lead-guide'),
    tourController.updateTourById
  )
  .delete(
    authController.protect,
    authController.authorizedPerson('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
