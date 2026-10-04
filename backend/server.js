import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';
import incomeRouter from './routes/incomeRoutes.js';
import expenseRouter from './routes/expenseRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';




const app = express();
const PORT = process.env.PORT || 4000;

// Allowed frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin)
      ) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// console.log("FRONTEND_URL",process.env.FRONTEND_URL )

app.use(express.json());
app.use(express.urlencoded({extended:true}))

// database
// await connectDB();


// routes
app.use("/api/user",userRouter)
app.use("/api/income",incomeRouter)
app.use("/api/expense",expenseRouter)
app.use("/api/dashboard",dashboardRouter)

app.get('/',(req,res)=>{
    res.send("API WORKING")
})


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });