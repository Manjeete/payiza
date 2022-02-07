const router = require('express').Router();

//constroller
const authController = require("../controllers/auth");

router.post("/sendOtp",authController.sendOtp);
router.post("/verifyOtp",authController.verifyOtp);
router.post("/admin/signup",authController.signup);
router.post("/admin/login",authController.login);

//test for all user type
router.get("/test",authController.isAuthenticated,authController.test)

//test for only admin and super admin
router.get("/testAdmin",authController.isAuthenticated,authController.isAdmin,authController.testAdmin);



module.exports = router;