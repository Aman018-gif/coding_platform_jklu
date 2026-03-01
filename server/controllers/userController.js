import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password} = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("All fields are required.", 400));
    }
    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("Email is already used.", 400));
    }

    const registerationAttemptsByUser = await User.find({
      $or: [
        { email, accountVerified: false },
      ],
    });

    if (registerationAttemptsByUser.length > 3) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
          400
        )
      );
    }

    const userData = {
      name,
      email,
      password,
    };

    const user = await User.create(userData);
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(
      verificationCode,
      name,
      email,
      res
    );
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(
  verificationCode,
  name,
  email,
  res
) {
  try {
    {
      const message = generateEmailTemplate(verificationCode);
      sendEmail({ email, subject: "Your Verification Code", message });
      res.status(200).json({
        success: true,
        message: `Verification email successfully sent to ${name}`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send.",
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f6f9; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">

      <div style="background-color: #0b3d91; padding: 20px; text-align: center;">
        <img src="YOUR_LOGO_URL_HERE" alt="JKLU Logo" style="height: 60px; margin-bottom: 10px;">
        <h2 style="color: #ffffff; margin: 0;">JK Lakshmipat University</h2>
        <p style="color: #dfe6f5; margin: 5px 0 0 0;">Coding Platform – Email Verification</p>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">Dear Student,</p>

        <p style="font-size: 16px; color: #333;">
          Welcome to the <strong>JKLU Coding Platform</strong> 🎓  
          Please use the verification code below to complete your registration.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #0b3d91; color: #ffffff; padding: 15px 35px; font-size: 28px; letter-spacing: 5px; font-weight: bold; border-radius: 6px;">
            ${verificationCode}
          </div>
        </div>

        <p style="font-size: 15px; color: #555;">
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="#" style="background-color: #f37021; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 15px; display: inline-block;">
            Verify Email
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>

      <div style="background-color: #f4f6f9; padding: 15px; text-align: center;">
        <p style="font-size: 13px; color: #777; margin: 5px;">
          © 2026 JK Lakshmipat University | Jaipur, India
        </p>
        <p style="font-size: 12px; color: #999; margin: 5px;">
          This is an automated email. Please do not reply.
        </p>
      </div>

    </div>
  </div>`;
}

export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp} = req.body;

  try {
    const userAllEntries = await User.find({
          email,
          accountVerified: false,
    }).sort({ createdAt: -1 });

    if (!userAllEntries) {
      return next(new ErrorHandler("User not found.", 404));
    }

    let user;

    if (userAllEntries.length > 1) {
      user = userAllEntries[0];

      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { email, accountVerified: false },
        ],
      });
    } else {
      user = userAllEntries[0];
    }

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP.", 400));
    }

    const currentTime = Date.now();

    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();
    console.log(currentTime);
    console.log(verificationCodeExpire);
    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP Expired.", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    sendToken(user, 200, "Account Verified.", res);
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error.", 500));
  }
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }
  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  sendToken(user, 200, "User logged in successfully.", res);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "JKLU CODING HOUR RESET PASSWORD",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        error.message ? error.message : "Cannot send reset password token.",
        500
      )
    );
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password & confirm password do not match.", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Reset Password Successfully.", res);
});
