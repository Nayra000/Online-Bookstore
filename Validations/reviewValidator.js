const validateReviewUser = body('reviews.*.user_id')
    .optional()
    .isMongoId()
    .withMessage('You must provide a valid user id for the review')
    .custom(async (val) => {
        if (val) {
            const user = await Users.findById(val);
            if (!user) {
                return Promise.reject('There is no user with that id');
            }
        }
    });

const validateReviewRating = body('reviews.*.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a number between 1 and 5');

const validateReviewComment = body('reviews.*.comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('You must provide a comment for the review');

const validateReviews = body('reviews')
    .optional()
    .isArray()
    .withMessage('Reviews must be an array');