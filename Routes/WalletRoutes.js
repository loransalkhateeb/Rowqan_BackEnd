const express = require("express");
const walletController = require("../Controllers/WalletController");

const router = express.Router();


router.post("/wallet", walletController.createWallet);


router.get("/wallet/user/:user_id/:lang", walletController.getWalletByUserId);


router.put("/wallet/:wallet_id/:lang", walletController.updateWallet);


router.delete("/wallet/:wallet_id/:lang", walletController.deleteWallet);


router.get("/wallets", walletController.listWallets);

module.exports = router;
