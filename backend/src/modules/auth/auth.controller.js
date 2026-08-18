const User = require('../user/user.model');
const { comparePassword } = require('../../utils/password.util');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt.util');
const { sendSuccess } = require('../../utils/response.util');
const ApiError = require('../../utils/apiError.util');
const asyncHandler = require('../../utils/asyncHandler.util');

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required.');
    }
    
    const cleanedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanedEmail, isDeleted: false });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }
    
    if (user.status !== 'active') {
      throw ApiError.forbidden('Your account is inactive or locked.');
    }
    
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }
    
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: 'default_school'
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    return sendSuccess(res, 'Login successful.', {
      accessToken,
      refreshToken,
      user: payload
    });
  });

  logout = asyncHandler(async (req, res) => {
    return sendSuccess(res, 'Logged out successfully.');
  });
}

module.exports = new AuthController();
