const express = require("express");
const walletController = require("../Controllers/WalletController");
const authMiddleware = require("../MiddleWares/authMiddleware");
const rateLimiter = require("../MiddleWares/rateLimiter");

const router = express.Router();

router.post("/wallet", authMiddleware, rateLimiter, walletController.createWallet);

router.get("/wallet/user/:user_id/:lang", authMiddleware, rateLimiter, walletController.getWalletByUserId);

router.put("/wallet/:wallet_id/:lang", authMiddleware, rateLimiter, walletController.updateWallet);

router.delete("/wallet/:wallet_id/:lang", authMiddleware, rateLimiter, walletController.deleteWallet);

router.get("/wallets", authMiddleware, rateLimiter, walletController.listWallets);

module.exports = router;
