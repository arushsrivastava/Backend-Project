import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {User} from '../models/user.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const generateAccessAndResfreshTokens = async (userID) => {
    try{

        const user = await User.findById(userID);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refeshTokens = refreshToken;

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

    const {accessToken, refreshToken} = await generateAccessAndResfreshTokens(user._id);

    // send cookies

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshTokens'
    );  // jo jo nhi chahiye wo hata do

    const options = {
        httpOnly: true,
        secure : true
    }

    res.send()
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('resfreshToken', refreshToken, options)
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
    .clearCookie('resfreshToken', options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )

})



export {registerUser, loginUser, logoutUser}