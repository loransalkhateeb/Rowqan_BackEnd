
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/UsersModel.js");
const transporter = require("../Config/Mailer.js");
const dotenv = require("dotenv");
const asyncHandler = require("../MiddleWares/asyncHandler.js");
const { client } = require("../Utils/redisClient");
const { Sequelize } = require("sequelize");
const { ErrorResponse, validateInput } = require("../Utils/validateInput.js");
const speakeasy = require("speakeasy");
dotenv.config();
const nodemailer = require("nodemailer");
const AuditLog = require("../Models/AuditLog.js");
const geoip = require("geoip-lite");
const crypto = require("crypto");
const argon2 = require("argon2");
const UAParser = require("ua-parser-js");
let currentPassword = generatePassword();

function generatePassword() {
  return crypto.randomBytes(6).toString("hex");
}



function sendPasswordEmail(password) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "lwrnsalkhtyb9@gmail.com", 
    subject: "Dashboard Password Update",
    text: `The new dashboard password is: ${password}\nExpires in 20 minutes.`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Password email sent:", info.response);
    }
  });
}

setInterval(() => {
  currentPassword = generatePassword();
  passwordExpiryTime = Date.now() + 20 * 60 * 1000;
  sendPasswordEmail(currentPassword);
}, 20 * 60 * 1000);


exports.register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone_number,
    country,
    password,
    confirmPassword,
    lang,
    user_type_id,
  } = req.body;

  
  const validationErrors = validateInput({
    name,
    email,
    password,
    confirmPassword,
    user_type_id,
  });
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

 
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
  
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

  
    const hashedPassword = await argon2.hash(password);

    
    const newUser = await User.create({
      name,
      email,
      phone_number,
      country,
      password: hashedPassword,
      lang,
      user_type_id,
     
    });

  
    res.status(201).json({
      message: "User registered successfully.",
      id: newUser.id,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json(ErrorResponse("Server error", err.message));
  }
});




const SECRET_KEY = process.env.JWT_SECRET;
User.getDeviceInfo = async (userId) => {
  try {
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["device_id"]
    });
    return user?.device_id ? JSON.parse(user.device_id) : null;
  } catch (error) {
    throw new Error(error);
  }
};

User.updateDeviceInfo = async (userId, deviceInfo) => {
  try {
    const result = await User.update(
      { device_id: JSON.stringify(deviceInfo) },  
      { where: { id: userId } }
    );
    return result;
  } catch (error) {
    throw new Error("Error updating device info: " + error.message);
  }
};

const sendVerificationCode = async (email, mfaCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Your MFA Code",
    text: `Your MFA code is: ${mfaCode}`
  };

  await transporter.sendMail(mailOptions);
};


const blockedIps = new Set();
const failedAttempts = {};
exports.login = async (req, res) => {
  const { email, password, mfaCode, ip } = req.body;
  const clientIp =
    ip ||
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress;

  const userAgent = req.headers["user-agent"];
  const parser = new UAParser();
  const deviceInfo = parser.setUA(userAgent).getResult();

  const deviceDetails = {
    ip: clientIp,
    os: `${deviceInfo.os.name || "Unknown"} ${deviceInfo.os.version || "Unknown"}`,
    browser: `${deviceInfo.browser.name || "Unknown"} ${deviceInfo.browser.version || "Unknown"}`,
    platform: deviceInfo.device.type || deviceInfo.os.name || "Unknown",
  };

  if (deviceDetails.platform === "Unknown") {
    if (deviceDetails.os.includes("Windows") || deviceDetails.os.includes("Mac")) {
      deviceDetails.platform = "Desktop";
    } else if (deviceDetails.os.includes("Android") || deviceDetails.os.includes("iOS")) {
      deviceDetails.platform = "Mobile";
    } else {
      deviceDetails.platform = "Unknown";
    }
  }

  if (blockedIps.has(clientIp)) {
    return res
      .status(403)
      .send("Your IP is blocked due to too many failed login attempts.");
  }

  const geo = geoip.lookup(clientIp);

  if (!geo || geo.country !== "JO") {
    return res.status(403).send("Access is restricted to Jordan IPs only.");
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      failedAttempts[clientIp] = (failedAttempts[clientIp] || 0) + 1;
      if (failedAttempts[clientIp] >= 5) {
        blockedIps.add(clientIp);
      }

      await AuditLog.create({
        action: "Failed Login",
        details: `Failed login attempt with email: ${email} (User not found)`,
      });
      return res.status(400).send("User not found");
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      failedAttempts[clientIp] = (failedAttempts[clientIp] || 0) + 1;
      if (failedAttempts[clientIp] >= 5) {
        blockedIps.add(clientIp);
      }

      await AuditLog.create({
        action: "Failed Login",
        details: `Failed login attempt for user: ${email} (Invalid password)`,
      });
      return res.status(400).send("Invalid password");
    }

    if (user.user_type_id === 1) {
      if (!email.endsWith("@kasselsoft.com")) {
        return res.status(400).send("Email is not authorized for login process");
      }


      if (!mfaCode) {
        mfaCodeMemory = Math.floor(100000 + Math.random() * 900000);
        mfaCodeExpiration = Date.now() + 5 * 60 * 1000;

        await sendVerificationCode(email, mfaCodeMemory);

        return res.status(200).send(
          "MFA code has been sent to your email. Please enter the code to complete login."
        );
      }


      if (Date.now() > mfaCodeExpiration) {
        return res.status(400).send("MFA code has expired");
      }

      if (String(mfaCode) !== String(mfaCodeMemory)) {
        await AuditLog.create({
          action: "Failed MFA Verification",
          details: `Failed MFA verification for user: ${email} from IP: ${clientIp}`,
        });
        return res.status(400).send("Invalid MFA code");
      }
    } else if (user.user_type_id === 2) {
      const storedDeviceInfo = await User.getDeviceInfo(user.id);
      const parsedStoredDeviceInfo = storedDeviceInfo
        ? JSON.parse(storedDeviceInfo)
        : null;

        if (!mfaCode) {
          mfaCodeMemory = Math.floor(100000 + Math.random() * 900000);
          mfaCodeExpiration = Date.now() + 5 * 60 * 1000;
  
          await sendVerificationCode(email, mfaCodeMemory);
  
          return res.status(200).send(
            "MFA code has been sent to your email. Please enter the code to complete login."
          );
        }
  
  
        if (Date.now() > mfaCodeExpiration) {
          return res.status(400).send("MFA code has expired");
        }
  
        if (String(mfaCode) !== String(mfaCodeMemory)) {
          await AuditLog.create({
            action: "Failed MFA Verification",
            details: `Failed MFA verification for user: ${email} from IP: ${clientIp}`,
          });
          return res.status(400).send("Invalid MFA code");
        }
      if (!storedDeviceInfo) {
        await User.updateDeviceInfo(user.id, deviceDetails);
        return res.status(200).json({
          message: "Your device information has been saved. You will only be able to log in from this device.",
          token: jwt.sign(
            { id: user.id, user_type_id: user.user_type_id, name: user.name },
            SECRET_KEY,
            { expiresIn: "1h" }
          ),
          name: user.name,
          user_type_id: user.user_type_id,
          id: user.id,
          deviceInfo: deviceDetails,
        });
      } else if (
        parsedStoredDeviceInfo &&
        JSON.stringify(parsedStoredDeviceInfo) !== JSON.stringify(deviceDetails)
      ) {
        return res.status(403).json({
          message: "Login not allowed from this device",
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, user_type_id: user.user_type_id, name: user.name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    await AuditLog.create({
      action: "Successful Login",
      details: `Login successful for user: ${email} from IP: ${clientIp}`,
    });

    delete failedAttempts[clientIp];

    return res.status(200).json({
      message: "Login successful",
      token,
      name: user.name,
      user_type_id: user.user_type_id,
      id: user.id,
    });
  } catch (err) {
    console.error("Error during login process:", err);
    await AuditLog.create({
      action: "Login Error",
      details: `Error during login for email: ${email} from IP: ${clientIp}. Error: ${err.message}`,
    });
    res.status(500).send({ message: "Internal Server Error", error: err.message });
  }
};





exports.logout = async (req, res) => {
  const { token } = req.body;

  if (!token)
    return res.status(400).json( ErrorResponse("Token is required"));

  try {
    // const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // await client.del(`user:${decoded.id}:session`);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("JWT Error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json( ErrorResponse("Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json( ErrorResponse("Token has expired"));
    } else {
      return res
        .status(500)
        .json( ErrorResponse("Server error", error.message));
    }
  }
};

const saveResetToken = async (userId, resetToken) => {
  try {
    if (!userId || !resetToken) {
      return Promise.reject( Error("Invalid parameters"));
    }

    const result = await User.update(
      {
        reset_token: resetToken,
        reset_token_expiration: Sequelize.fn(
          "DATE_ADD",
          Sequelize.fn("NOW"),
          Sequelize.literal("INTERVAL 1 HOUR")
        )
      },
      {
        where: { id: userId },

        limit: 1
      }
    );

    if (result[0] === 0) {
      throw new Error("User not found or no update performed");
    }

    return { message: "Reset token saved successfully" };
  } catch (err) {
    console.error("Error saving reset token:", err);

    return { error: err.message || "Error saving reset token" };
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(ErrorResponse("Email is required"));
  }

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(200).json({
        message: "The email does not exist. Please enter the correct email."
      });
    }

    console.log(`The user ID is: ${user.id}`); 

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    await saveResetToken(user.id, resetToken);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `http://localhost:5173/en/resetpassword/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset. If you did not make this request, please ignore this email.</p>
        <p>Click the link below to reset your password. This link is valid for 1 hour:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Request password reset error:", err);
    res.status(500).json(ErrorResponse("Server error", err.message));
  }
};




exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    console.log(`The User ID is: ${userId}`);

   
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).send("User not found");
    }

    
    const hashedPassword = await argon2.hash(password);


    await user.update({ password: hashedPassword });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).send("Reset token has expired");
    } else if (err.name === "JsonWebTokenError") {
      return res.status(400).send("Invalid reset token");
    }
    console.error("Reset password error:", err);
    res.status(500).send("Server error");
  }
};
