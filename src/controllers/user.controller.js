import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {User} from '../models/user.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import { Subscription } from '../models/subscription.model.js';

const generateAccessAndRefreshTokens = async (userID) => {
    try{

        const user = await User.findById(userID);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshTokens = refreshToken;

        await user.save({validateBeforeSave : false});
    
        console.log("\nAccess Token: ", accessToken , "\nRefresh Token: ", refreshToken);
    
        return {accessToken, refreshToken};
        
    }catch(error){
        throw new ApiError(500, "Failed to generate access and refresh tokens");
    } 
}

const registerUser = asyncHandler(async (req, res) => { 
    
    // get user details from frontend
    // validate user details
    // check if user already exists 
    // check for images/avatar
    // upload them to cloudinary
    // create user object and save in database
    // remove password and refresh token from response
    // check for user creation
    // send success response to frontend


    // Data input


    
    const {username, email, password, fullName } = req.body;
    
 
    // validation
    if (
        [fullName, username, email, password].some((field) => !field?.trim === "")
    ){
        throw new ApiError(400, `${field} can't be empty`);
    }

    // Check if user already exists

    const existingUser = await User.findOne({
        $or: [
            {username},             //isme jitne bhi fields jyengi sb check ho jyengi
            {email},
        ],
    })
    if(existingUser) {
        throw new ApiError(409, 'User already exists');
    }
    // check for images/avatar
    
    const avatarLocalPath =req.files?.avatar[0]?.path;
    const coverLocalPath =req.files?.coverImage?.[0]?.path;

    // validating if avatar is given or not
    if(!avatarLocalPath){
        throw new ApiError(400, 'No avatar provided');
    }


    // upload them to cloudinary

    const avatar= await uploadOnCloudinary(avatarLocalPath);
   
    const coverImage = coverLocalPath? await  uploadOnCloudinary(coverLocalPath) : null

    if(!avatar){
        throw new ApiError(500, 'Failed to upload avatar to cloudinary');
    }

    // create user object and save in database 

    const user = await User.create({
        username : username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",

    })

    // user create hua bhi ya nhi
    const createdUser = await User.findById(user._id).select('-password -refreshTokens');  // jo jo nhi chahiye wo hata do

    if (!createdUser) throw new ApiError(500, 'Failed to create user');

    // return response

    return res.status(201).json(
        new ApiResponse(200, 'User created successfully', createdUser)
    )

})

const loginUser = asyncHandler(async (req, res) => {

    // take info from user (password and username)
    // validate (empty or not)
    // check if user exists (username)
    // check password
    // generate access and refresh token
    // send cookies

    // taking data

    const { email, username, password } = req.body;

    // validation

    if(!username && !email){
        throw new ApiError(400, 'Either username or email is required');
    }

    // check if user exists

    const user = await User.findOne({
        $or: [
            {username},
            {email},
        ],
    })

    if(!user){
        throw new ApiError(401, 'Invalid credentials');

    }

    // check password

    const isPasswordValid = await user.isPasswordCorrect(password);  // yaha pe chota wala user krnege...bade wala User mongoose ka hai

    if(!isPasswordValid){
        throw new ApiError(401, 'Invalid credentials');
    }

    // generate access and refresh token

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    

    // send cookies

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshTokens'
    );  // jo jo nhi chahiye wo hata do

    const options = {
        httpOnly: true,
        secure : true
    }

    res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken // wse to need nhi but maan lo user wants to save his token for some dev bs isliye
            },
            'User logged in successfully'
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {

    // logging Out means : clear cookies and reset refresh token

    // yaha the biggest problem is i don't have access to user object (isliye mai refresh token ko reset kar skta)
    // so we will execute some middleware jisse wo user object aa jaye hamare paas
    // PS : after passing through a middleware we can attach certain objects to our req which the following functions can access

    const user = req.user;

    if(!user){
        throw new ApiError(401, 'User not found');
    }

    await User.findByIdAndUpdate(user._id, 
        {
            $set: 
            {
                refreshTokens: null,
            }
        },
        {
            new: true,
        }
    );

    // clear cookies

    const options = {
        httpOnly: true,
        secure : true,
        
    }

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookie
    // validate the refresh token
    // generate new access token and refresh token
    // send new cookies

    // get refresh token from cookie

    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    // body for refresh tokens and heade for access tokens

    if(!incomingRefreshToken){
        throw new ApiError(401, 'No refresh token provided');
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, 'Invalid refresh token');
        }
    
        if(incomingRefreshToken != user?.refreshTokens){
            throw new ApiError(401, 'Refresh token has expired');
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        const options={
            httpOnly: true,
            secure : true, 
        }
    
        res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', newRefreshToken, options)
        .json(
            new ApiResponse(200, {accessToken, refreshToken : newRefreshToken}, "User refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401, error?.message ||'Invalid refresh token');
    }


    
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // take new password and current password from body
    // check if curr password is correct
    // set new password

    // DONT DO LIKE THIS 👇

    // incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    // if(!incomingRefreshToken){
    //     throw new ApiError(401, 'No refresh token provided');
    // }
    // const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    // const user = await User.findById(decodedToken?._id);

    const {currentPassword, newPassword,} = req.body;

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(401, 'Invalid refresh token');
    }

    if(!await user.isPasswordCorrect(currentPassword)){
        throw new ApiError(401, 'Current password is incorrect');
    }

    //DONT'T DO LIKE THIS 👇  PASSWORD WILL NOT BE STORED IN PLAIN TEXT 🔴
    // await User.findByIdAndUpdate(user._id, 
    //      {
    //         $set :{
    //         password: newPassword,
    //         }
    //     }
    //     ,
    //     {
    //         new: true,
    //     }
        
    // )

    user.password=newPassword;
    await user.save({validateBeforeSave : false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password changed successfully")
    )

   
})


// getuser, update profile details, change avatar, change cover image

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const curr_user_username = req.user?.username;

    if(!curr_user_username){
        throw new ApiError(401, 'User not found');
    }

    const {username} = req.params;

    if(!username.trim()){
        throw new ApiError(400, 'Username is missing');
    }

    const channel = await User.aggregate([
        {
          $match: {
            username: username?.toLowerCase(),
          }
        },
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'channel',
            as: 'subscribers',
          }
        },
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'subscriber',
            as: 'subscribedTo',
          }
        },
        {
          $addFields: {
            subscribersCount: { $size: "$subscribers" },
            channelsSubscribedToCount: { $size: "$subscribedTo" },
            isSubscribed: {
              $cond: {
                if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                then: true,
                else: false,
              }
            }
          }
        },
        {
          $project: {
            fullName: 1,
            email: 1,
            avatar: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: {
                $cond: {
                  if: { $ne: ["$username", req.user.username] },
                  then: "$isSubscribed",
                  else: "$$REMOVE"  // Removes the field from the final output
                }
            },
            username: 1,
          }
        }
      ]);

    if(!channel?.length){
        throw new ApiError(404, 'Channel does not exist');
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    )
})

// getWatchHistory

export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getUserChannelProfile};   