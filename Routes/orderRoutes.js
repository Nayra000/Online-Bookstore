const express = require("express");
const authMiddleware = require("../Middlewares/authMiddleware");
const {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrdersByUserId,
    updateOrderStatus,
} = require("../Controllers/orderController");
const {
    createOrderValidator,
    getOrderValidator,
    updateOrderValidator
} = require("../Validations/orderValidator");

const router = express.Router();
router.use(authMiddleware.protect);

router.route("/")
    .post(authMiddleware.allowedTo("user"), createOrder)
    .get(authMiddleware.allowedTo("admin"), getAllOrders);

router.route("/user/:id").get(authMiddleware.allowedTo("admin"), getOrderValidator, getOrdersByUserId);

router.route("/:id")
    .get(authMiddleware.allowedTo("admin"), getOrderValidator, getOrderById)
    .patch(authMiddleware.allowedTo("admin", "user"), updateOrderValidator, updateOrderStatus);

module.exports = router;
