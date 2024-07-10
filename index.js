//************Express.js**************** */
import express from "express";
import path from "path";

import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "bakend",
  })
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

//Create schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

//like collection we create modal both are same
const User = mongoose.model("User", userSchema);

const app = express();

// const users = [];

//using middleware
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: "true" }));
app.use(cookieParser());

//Setting up View Engine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  // const token = req.cookies.token;
  const { token } = req.cookies; //destructuring krna...

  if (token) {
    const decoded = jwt.verify(token, "sdfdjfdfdkjdk");

    req.user = await User.findById(decoded._id);

    next();
  } else {
    // res.render("login");
    res.redirect("login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    return res.redirect("/register");
  }

  // const isMatched = user.password === password; //before using hahsed compare way of password
  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) {
    return res.render("login", { email, message: "Incorrect Password" });
  }

  const token = jwt.sign({ _id: user._id }, "sdfdjfdfdkjdk");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  //aur ye else ki condition h...
  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "sdfdjfdfdkjdk");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("Server is working....");
});

//ye starting me jab form bnaya tha tab ye sb tha

//then bhi use kr skte ho or async await bhi
// app.get("/add", (req, res) => {
//   Message.create({ name: "MD", email: "touseeb1001@gmail.com" }).then(() => {
//     res.send("Noice");
//   });
// });

//async await
// app.get("/add", async (req, res) => {
//   await Message.create({ name: "MDt", email: "touseeb1001bbk@gmail.com" }).then(
//     () => {
//       res.send("Noice");
//     }
//   );
// });

// app.get("/success", (req, res) => {
//   res.render("success");
// });

// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });

// app.post("/contact", async (req, res) => {
//   const { name, email } = req.body; //destucring krna

//   // await Message.create({ name: name, email: email });//key value same h to we can write this
//   await Message.create({ name, email });
//   res.redirect("/success");

//   // res.render("success");
//   // console.log(req.body.name);
// });
