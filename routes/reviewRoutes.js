const express = require('express');
const router = express.Router({mergeParams : true});
const reviewController = require('../controller/reviewController')
const authController = require('../controller/authController')

router.use(authController.protect)
router.
    route('/')
    .get(reviewController.getAllReviews)
    .post(
         authController.authorizedPerson('user'),
         reviewController.providingUserAndTourIds,
         reviewController.createReview)

router.
    route('/:id')
    .get(reviewController.readReview)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview)

module.exports = router