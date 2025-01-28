import mongoose, { Schema } from "mongoose";
import bcrpt from "bcrypt";
import { jwtDecode } from "jwt-decode";

// schema is a blueprint of how the data will look like
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
);

// before saving the user, hash the password
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) { // if password is not modified, do nothing
        next();
    }

    this.password = await bcrpt.hash(this.password, 10);
    next();
})

userSchema.methods.comparePassword = async function (password) { // add method to the schema of comparing password
    return await bcrpt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function () { // add method to the schema of Access generating token
    return await jwtDecode.sign(
        { _id: this._id },
        process.env.Access_Token_Secret,
        { expiresIn: Access_Token_Expiry }
    );
}

userSchema.methods.generateRefreshToken = async function () { // add method to the schema of generating refresh token
    return await jwtDecode.sign(
        { _id: this._id },
        process.env.Refresh_Token_Secret,
        { expiresIn: Refresh_Token_Expiry }
    );
}

export const User = mongoose.model("User", userSchema); // model is a wrapper for the schema