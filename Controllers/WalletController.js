const Wallet = require("../Models/WalletModel");
const User = require("../Models/UsersModel"); 
const { Op } = require("sequelize");

exports.createWallet = async (req, res) => {
  try {
    const { user_id, lang, total_balance = 0, reserved_balance = 0, cashback_balance = 0 } = req.body;

    if (!user_id || !lang) {
      return res.status(400).json({
        error: lang === "en" 
          ? "User ID and language are required." 
          : "معرف المستخدم واللغة مطلوبان.",
      });
    }


    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        error: lang === "en" 
          ? "User not found." 
          : "المستخدم غير موجود.",
      });
    }

   
    const wallet = await Wallet.create({
      user_id,
      lang,
      total_balance,
      reserved_balance,
      cashback_balance,
    });

    res.status(201).json(
      wallet,
    );
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({
      error: lang === "en" 
        ? "Failed to create wallet." 
        : "فشل في إنشاء المحفظة.",
    });
  }
};

exports.getWalletByUserId = async (req, res) => {
  try {
    const { user_id, lang } = req.params;

    const wallet = await Wallet.findOne({
      where: { user_id },
      include: [{ model: User, as: "User" }],
    });

    if (!wallet) {
      return res.status(404).json({
        error: lang === "en" 
          ? "Wallet not found for the specified user." 
          : "المحفظة غير موجودة للمستخدم المحدد.",
      });
    }

    // Wrap the wallet object in an array
    res.status(200).json({
      message: lang === "en" 
        ? "Wallet retrieved successfully." 
        : "تم استرجاع المحفظة بنجاح.",
      wallet: [wallet],  // Return wallet as an array
    });
  } catch (error) {
    console.error("Error retrieving wallet:", error);
    res.status(500).json({
      error: lang === "en" 
        ? "Failed to retrieve wallet." 
        : "فشل في استرجاع المحفظة.",
    });
  }
};


exports.updateWallet = async (req, res) => {
  try {
    const { wallet_id, lang } = req.params;
    const { total_balance, reserved_balance, cashback_balance } = req.body;

    const wallet = await Wallet.findByPk(wallet_id);
    if (!wallet) {
      return res.status(404).json({
        error: lang === "en" 
          ? "Wallet not found." 
          : "المحفظة غير موجودة.",
      });
    }


    await wallet.update({
      total_balance: total_balance ?? wallet.total_balance,
      reserved_balance: reserved_balance ?? wallet.reserved_balance,
      cashback_balance: cashback_balance ?? wallet.cashback_balance,
      last_updated: new Date(),
    });

    res.status(200).json(
      wallet,
  );
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({
      error: lang === "en" 
        ? "Failed to update wallet." 
        : "فشل في تحديث المحفظة.",
    });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    const { wallet_id, lang } = req.params;

    const wallet = await Wallet.findByPk(wallet_id);
    if (!wallet) {
      return res.status(404).json({
        error: lang === "en" 
          ? "Wallet not found." 
          : "المحفظة غير موجودة.",
      });
    }


    await wallet.destroy();

    res.status(200).json({
      message: lang === "en" 
        ? "Wallet deleted successfully." 
        : "تم حذف المحفظة بنجاح.",
    });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    res.status(500).json({
      error: lang === "en" 
        ? "Failed to delete wallet." 
        : "فشل في حذف المحفظة.",
    });
  }
};

exports.listWallets = async (req, res) => {
  try {
    const { lang } = req.query;

    const wallets = await Wallet.findAll({
      include: [{ model: User, as: "user" }],
    });

    res.status(200).json(
      wallets,
    );
  } catch (error) {
    console.error("Error retrieving wallets:", error);
    res.status(500).json({
      error: lang === "en" 
        ? "Failed to retrieve wallets." 
        : "فشل في استرجاع المحافظ.",
    });
  }
};
