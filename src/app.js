import  express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser' 

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit : "16kb"})) 
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(cookieParser()) // cookies ko attach kar dega

// Global error handler (should be last middleware)



import userRouter from './routes/user.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'

app.use('/api/v1/users',userRouter);
app.use('/api/v1/subscription',subscriptionRouter)



export  {app}