const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas.js');
const Review = require('../models/review');
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isAuthor, isReviewAuthor } = require('../middleware')



router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;