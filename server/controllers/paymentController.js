const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        console.log("🔥 createOrder HIT");
        console.log("BODY:", req.body);

        const { courseId, amount, userId } = req.body;

        if (!courseId || !amount || !userId) {
            console.log("❌ Missing fields");
            return res.status(400).json({ message: "Missing fields" });
        }

        console.log("🔑 Razorpay Keys:", {
            key_id: process.env.RAZORPAY_KEY_ID ? "FOUND" : "MISSING",
            key_secret: process.env.RAZORPAY_KEY_SECRET ? "FOUND" : "MISSING"
        });

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR"
        });



        console.log("✅ Order Created:", order.id);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.error("❌ Razorpay Error:", err);
        res.status(500).json({
            message: "Order creation failed",
            error: err.message
        });
    }
};


exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId
        } = req.body;

        const userId = req.user.id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        const user = await User.findById(userId);

        const alreadyEnrolled = user.enrolledCourses.some(
            e => e.courseId.toString() === courseId
        );

        if (alreadyEnrolled) {
            return res.json({ success: true });
        }

        user.enrolledCourses.push({
            courseId,
            completedTopics: [],
            courseCompleted: false,
            internshipUnlocked: false,
            isPaid: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            paidAt: new Date()
        });

        await user.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Payment verification failed" });
    }
};
