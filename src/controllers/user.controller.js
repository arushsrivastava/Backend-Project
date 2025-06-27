import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {User} from '../models/user.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';

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


    // console.log("printing req.body\n");
    // console.log(req.body);
    const {username, email, password, fullName } = req.body;
    // console.log("printing username,email, etc...\n");
    // console.log(username, email, password, fullName );
 
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

export {registerUser}