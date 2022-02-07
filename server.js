const express = require('express');
const bodyParser = require("body-parser");
var morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

//middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Database Connected Successfully"))
.catch((err) => console.log(err));

//auth router 
const authRouter = require("./routes/authRouter");

//app middlewares
app.use("/user",authRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT,() =>{
    console.log(`Server is running at port ${PORT}`)
})