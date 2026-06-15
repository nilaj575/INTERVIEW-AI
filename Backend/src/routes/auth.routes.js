const express=require("express");
const authrouter=express.Router();
const authController=require("../controller/auth.controller");
const authMiddleware=require("../middlewares/auth.middleware")
/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */

authrouter.post("/register",authController.registerUser);

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authrouter.post("/login",authController.userLogin);
/**
 * @route POST /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */

authrouter.get("/logout",authController.logout);

/**
 * @route POST /api/auth/get-me
 * @description get the currnet logged in user details
 * @access Public
 */
authrouter.get("/get-me",authMiddleware.authUser,authController.getMeController);

module.exports=authrouter;