class ApiError extends Error {
    constructor(
        message ="Something went wrong",
        statusCode,
        error=[],
        stack=""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.message = message;
        this.success = false;
        this.data=null;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }

    }
}

export {ApiError}