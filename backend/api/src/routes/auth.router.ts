import { Router } from "express"
import { AuthController } from "./controllers"

const router: Router = Router()

// Local Strategy: Login
router.post("/local/login", AuthController.localLogin)

// Local Strategy: Register
router.post("/local/register", AuthController.localRegister)

// Local Strategy: Logout
router.post("/local/logout", AuthController.localLogout)

// Local Strategy: Verify Account
router.get("/local/verify/:token", AuthController.localVerify)

// TODO: Local Strategy: Request password reset token
router.post(
  "/local/request-password-reset",
  AuthController.requestPasswordReset
)

// TODO: Local Strategy: Post new password
router.post("/local/reset-password", AuthController.resetPassword)

// Get a preview of the verification mail
router.get("/preview-verification-mail", AuthController.previewVerificationMail)

// Get a preview of the verification complete page
router.get(
  "/preview-verification-complete",
  AuthController.previewVerificationComplete
)

// Get a preview of the verification complete page
router.get("/preview-already-verified", AuthController.previewAlreadyVerified)

export default router
