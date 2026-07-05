const express=require("express");
const app=express()
const cookieParser=require("cookie-parser");

const cors=require("cors");

app.use(cors({
    origin:"https://interview-ai-nilaj.vercel.app/login",
    credentials:true
}));
app.use(express.json());

app.use(cookieParser());


app.use(express.urlencoded({ extended: true }));

const authrouter=require("./routes/auth.routes");
const interViewRouter=require("./routes/interview.routes")


app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.use("/api/auth", authrouter);
app.use("/api/interview", interViewRouter)

module.exports=app;