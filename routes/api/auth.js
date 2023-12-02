const express = require("express");
const ctrl = require("../../controllers/auth");

const router = express.Router();
const { validateBody, authentication, upload } = require("../../middlewares");
const { schemas } = require("../../models/user");

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.get("/verify/:verificationToken", ctrl.verifyEmail);
router.post(
  "/verify",
  validateBody(schemas.emailSchema),
  ctrl.resendVerifyEmail
);

router.post("/login", validateBody(schemas.registerSchema), ctrl.login);
router.get("/current", authentication, ctrl.current);
router.post("/logout", authentication, ctrl.logout);
router.patch("/", authentication, ctrl.updateSubscription);

router.patch(
  "/avatars",
  authentication,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;
