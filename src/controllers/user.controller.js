import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res) => { 
    // Add your logic to register a user here
    res.status(200).json({ 
        message: 'User ka ho gya successfully' 
    });
})

export {registerUser}