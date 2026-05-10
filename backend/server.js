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

app.use(cors())
// cors middleware 
app.use(cors({
    origin:process.env.FRONTEND_URL,
    // origin:"http://localhost:5173",
    credentials:true
}))

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