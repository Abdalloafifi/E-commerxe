const Auth= require('../models/auth');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const passwordComplexity = require("joi-password-complexity");
const xss = require('xss');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const { generateTokenAndSend } = require('../middlewares/genarattokenandcookies');
const cloudinary = require("../config/cloudinary"); 



exports.register = asyncHandler(async (req, res) => {
   try {
     const data = {
        username: xss(req.body.username),
        email: xss(req.body.email),
        password: xss(req.body.password),
        Address: xss(req.body.Address),
    };
    const { error } = validateRegister(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = await Auth.findOne({ email: data.email });
    if (user) {
        res.status(400).json({ error: "Email already exists" });
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const randamnumber = Math.floor(100000 + Math.random() * 900000);

    const newUser = new Auth({
        username: data.username,
        password: hashedPassword,
        email:  data.email,
        number: randamnumber,
        Address: data.Address,
        

    });
    await newUser.save();
    // send email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: data.email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${randamnumber}`,
    };

await transporter.sendMail(mailOptions);
       res.status(201).json({ message: 'Registration successful' })
    } catch (error) {
       res.status(500).json({ error: "Internal server error" });
    }
}); 
function validateRegister(data) {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: passwordComplexity().required(),
        Address: Joi.string().required(),
    });
    return schema.validate(data);
}

exports.verify = asyncHandler(async (req, res) => {
    const data = {
        email: xss(req.body.email),
        code: Number(xss(req.body.code)),
    };
    const { error } = validateVerify(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = await Auth.findOne({ email: data.email });
    if (!user) return res.status(400).json({ error: "Invalid email or code" });
    
    if (user.number !== data.code) return res.status(401).json({ error: "Invalid email or code" });
    
    user.isVerified = true;
    await user.save();
    generateTokenAndSend(user, res);
    if (user.number === null) {
        return res.status(200).json({ success: true });
    }
    res.status(200).json({ message: "Email verified successfully" });
});
function validateVerify(data) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        code: Joi.number().required(),
    });
    return schema.validate(data);
};

exports.addphone = asyncHandler(async (req, res) => {
    const data = {
        number: xss(req.body.number),
    };
    const { error } = validatePhone(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = await Auth.findOne({ email: req.user.email });
    if (!user) return res.status(400).json({ error: "User not found" });
    user.number = data.number;
    await user.save();
    generateTokenAndSend(user, res);
    res.status(200).json({ message: "Phone number added successfully" });
});
function validatePhone(data) {
    const schema = Joi.object({
        number: Joi.string().required(),
    });
    return schema.validate(data);
}

exports.login = asyncHandler(async (req, res) => {
    const data = {
        email: xss(req.body.email),
        password: xss(req.body.password),
    };
    const { error } = validateLogin(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = await Auth.findOne({ email: data.email , isVerified: true });
    if (!user) {
        res.status(401).json({ error: "user not found" });
        return;
    }
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
        res.status(400).json({ error: "Invalid email or password" });
        return;
    }
    generateTokenAndSend(user, res);
    if (user.number === null) {
        return res.status(200).json({ success: true });
    }
    res.status(200).json({ message: 'Logged in successfully' });
});
function validateLogin(data) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
}


exports.logout = asyncHandler(async (req, res) => {
    res.header('Authorization', '');
    res.header('x-auth-token', '');
    res.status(200).json({ message: 'Logged out successfully' });
});

exports.deleteUser = asyncHandler(async (req, res) => {
   const user = await Auth.findOneAndDelete(req.user._id);
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
});

exports.transformation= asyncHandler(async (req, res) => {
    
    try {
 if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'يجب رفع ملف واحد على الأقل' });
        }
        
        // 2. التحقق من المستخدم الموثق
        const user = await Auth.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }
        
        if (!user.isVerified) {
            return res.status(403).json({ error: 'يجب توثيق البريد الإلكتروني أولاً' });
        }
        const cloudinaryFolder = `users/${user.username}`;
 const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: cloudinaryFolder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('❌ فشل رفع الملف:', error);
              return reject(new Error(`فشل رفع الملف: ${file.originalname}`));
            }
            resolve(result.secure_url);
          }
        ).end(file.buffer); // تأكد من استخدام buffer المعالج
      });
    });

        const uploadedUrls = await Promise.all(uploadPromises);

        // 5. تحديث بيانات المستخدم
        user.PersonalPhoto = [...user.PersonalPhoto, ...uploadedUrls];
        user.ChangePersonalPhoto = true; // تعيين الحقل إلى true
        await user.save();

        // 6. إرسال الاستجابة
        res.status(200).json({
            message: `تم رفع ${uploadedUrls.length} صورة بنجاح`,
            urls: uploadedUrls,
        });

    } catch (error) {
        console.error('❌ خطأ أثناء الرفع:', error);
        res.status(500).json({
            error: error.message || 'فشل في رفع الملفات',
            details: error.stack,
        });
    }
});
