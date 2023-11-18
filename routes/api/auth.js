const express = require("express");
const ctrl = require("../../controllers/auth");

const router = express.Router();
const { validateBody, authentication } = require("../../middlewares");
const { schemas } = require("../../models/user");

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.post("/login", validateBody(schemas.registerSchema), ctrl.login);
router.get("/current", authentication, ctrl.current);
router.post("/logout", authentication, ctrl.logout);
router.patch("/", authentication, ctrl.updateSubscription);

module.exports = router;
