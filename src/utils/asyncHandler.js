const asyncHandler =(fn) => async(req,res,next)=>{
    try {
        await fn(req,res,next);
    } catch (error) {
        res.status(error.statusCode ||502).json({
            success : false,
            message: error.message,
        })
    }
}

export {asyncHandler}