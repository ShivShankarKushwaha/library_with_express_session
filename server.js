require('dotenv').config();
const express = require("express");
const app = express();
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const bp = require("body-parser");
const session =require('express-session');
mongoose.connect(process.env.MONGO_LINK);
// ipconfig
const port =  process.env.PORT|| 5500;
var checklogin = 0;
var adminmail ,adminpass ;
const { MongoClient } = require('mongodb');
const url = process.env.MONGO_LINK;
const client = new MongoClient(url);
const database = "Students";

var admincheck =0;
app.use(express.static('landing-page'));
app.use('/public', express.static('landing-page'));
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:
    {
        httpOnly:true,
        maxAge:3600000,
    }
}));
const noteschm = {
    name: String,
    email: String,
    roll: Number,
    password: String,
    booknumbers: Number,
    book1: String,
    book2: String,
    book3: String,
    book4: String,
    book5: String,
    book6: String,
    book7: String,
    book8: String,
    book9: String,
    book10: String,
    returned1: String,
    returned2: String,
    returned3: String,
    returned4: String,
    returned5: String,
    returned6: String,
    returned7: String,
    returned8: String,
    returned9: String,
    returned10: String,
    fine1: Number,
    fine2: Number,
    fine3: Number,
    fine4: Number,
    fine5: Number,
    fine6: Number,
    fine7: Number,
    fine8: Number,
    fine9: Number,
    fine10: Number,
    finesubmit1: String,
    finesubmit2: String,
    finesubmit3: String,
    finesubmit4: String,
    finesubmit5: String,
    finesubmit6: String,
    finesubmit7: String,
    finesubmit8: String,
    finesubmit9: String,
    finesubmit10: String,

};
const bookschema = {
    name: String,
    status: Number,
    reference: String,
};
//////////////////////////////////////////////////////////////

var currentdate = new Date();
var datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

///////////////////////////////////////////////////////////////
const note = mongoose.model("note", noteschm);

app.use(bp.urlencoded({ extended: true }));
let check=0;
app.get("/", async(req, res) => {
    if(check==0)
    {
        admin();
        check++;
    }
    res.sendFile(__dirname + "/landing-page/home.html");
});
app.get("/sign", (req, res) => {
    res.sendFile(__dirname + "/landing-page/sign.html");
});
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/landing-page/login.html");
});
app.get("/search", (req, res) => {
    res.sendFile(__dirname + "/landing-page/search.html");
});
app.get("/books", (req, res) => {
    if (checklogin == 1)
    {
        let logindata = req.session.logindata;
        res.render(__dirname + "/views/books.ejs", { logindata });
    }
    else {
        // res.send(`<center><h1>Please Login first to see your books history</h1><br><h1><a href="/login">Go to Log in page</a></h1></center>`)
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem"><h1 style="font-size:5rem">Please Login first to see your books history</h1><br><h1><a href="/login" style="font-size:4rem">Go to Log in page</a></h1></center>`)
    }
});


async function admin()
{
    let data = await client.connect();
    let db= data.db('Students');
    let collection = db.collection('admin');
    let responce1= await collection.find({name:process.env.ADMIN_NAME}).toArray();
    adminmail = responce1[0].email;
    adminpass = responce1[0].password;
    console.log(adminmail);
}
// admin();
// console.log(adminmail);


// var reqname, reqemail, reqroll, reqpassword;
app.post("/sign", async (req, res) => {
    req.session.reqname = req.body.name;
    req.session.reqemail = req.body.email;
    req.session.reqroll = req.body.roll;
    req.session.reqpassword = req.body.password;
    /////////////////////////////////////////
    let result = await client.connect();
    let db = result.db(database);
    let collection = db.collection('notes');

    let responce1 = await collection.find({ email: req.body.email }).toArray();
    let collegemailcheck = req.session.reqemail.includes('iiitu.ac.in');
    console.log(collegemailcheck);
    ////////////////////////////////////////
    if (responce1 == "" && collegemailcheck && req.session.reqemail!=adminmail) {


        PinGenerator();
        var nodemailer = require("nodemailer");
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL_FROM,
                pass: process.env.MAIL_PASSWORD,
            }
        });
        var mailoption = {
            from: process.env.MAIL_FROM,
            to: req.body.email,
            subject: "IIITU library management sign up otp password ",
            text: "Your Pin is:",
            html: `<h3>Your pin is:</h3><h1>${pinReturn}</h1>`
        };
        console.log(pinReturn);


        transporter.sendMail(mailoption, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('Email has been sent');
            }
        })

        res.sendFile(__dirname + "/landing-page/signotp.html");

    }
    else if (responce1 != "" || req.session.reqemail==adminmail) {
        res.send(`<center  style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"> You have an account Please Login Instead of Sign In<hr><a href="/login">Go to Log in page</a><hr></center>`)
    }
    else {
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"><h1>You do not belongs to IIIT Una <br> So You cannot Sign Up</h1><hr><h1><a href="/">Go to Home page</a></h1></center>`)
    }

});

app.post("/signotp", async (req, res) => {
    let otpsubmit = req.body.otp;
    if (otpsubmit === pinReturn) {
        let newnote = new note({

            name: req.session.reqname, email: req.session.reqemail, roll: req.session.reqroll, password: req.session.reqpassword, booknumbers: 0, book1: "", book2: "", book3: "", book4: "", book5: "", book6: "", book7: "", book8: "", book9: "", book10: "", returned1: "", returned2: "", returned3: "", returned4: "", returned5: "", returned6: "", returned7: "", returned8: "", returned9: "", returned10: "", fine1: 0, fine2: 0, fine3: 0, fine4: 0, fine5: 0, fine6: 0, fine7: 0, fine8: 0, fine9: 0, fine10: 0, finesubmit1: 0, finesubmit2: 0, finesubmit3: 0, finesubmit4: 0, finesubmit5: 0, finesubmit6: 0, finesubmit7: 0, finesubmit8: 0, finesubmit9: 0, finesubmit10: 0,


        });
        newnote.save();
        res.sendFile(__dirname + "/landing-page/login.html");

    }
    else
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"> <h1> Your otp is not  correct</h1><hr><a href="/sign">Go to Sign Up page</a><hr> </center>`)
    {

    }
})
// let logindata, logmail, username, userpass, usermail;
app.post("/login", async (req, res) => {

    let result = await client.connect();
    let db = await result.db(database);
    let collection = await db.collection('notes');
    let responce1 = await collection.find({ email: req.body.email }).toArray();
    req.session.logmail = await req.body.email;
    // console.log(logindata[0].book1);
    let responce2 = await collection.find({ email: req.body.email, password: req.body.password }).toArray();
    console.log(responce1);
    if (responce1 == "") {
        console.log("No data found");
        // res.sendFile(__dirname + "/landing-page/login.html");
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:3rem;"> <h2> You have no account ! Please sign up </h2> <br> <hr> <a href="/sign">Sign Up</a> <hr></center>`)

    }
    else if (responce2 == "") {
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:3rem;"><h1>  Your password is not correct Please try again. <br> <a href="/login">Log In</a><br><hr><a href="/forgetpass">Forget Password</a><hr></h1></center>`)
    }

    else {
        req.session.logindata = await responce1;
        req.session.username = await responce1[0].name;
        req.session.usermail = await responce1[0].email;
        req.session.userpass = await responce1[0].password;
        if (responce1[0].email === adminmail && responce1[0].password == adminpass) {
            checklogin = 1;
            admincheck=1;
            res.render(__dirname + "/views/returnBook.ejs");
        }
        else {
            checklogin = 1;
            console.log("successfully login!");
            // alert("You have succesfully logged In !");
            res.sendFile(__dirname + "/landing-page/search.html");

        }

    }

});
//////////////////////////////////////////////////////////////////////
app.get("/fine", async (req, res) => {
    if (admincheck==1) {
        
        res.sendFile(__dirname + "/pdfs/document.pdf");
    }
    else
    {
        res.sendFile(__dirname+"/landing-page/Error404.html");
    }
})
///////////////////////////////////////////////////////////////////////
// const otp = require("./otp_module");
var otpGenerator = require('otp-generator');
const e = require("express");
const { name } = require("ejs");
var pinReturn = "";

function PinGenerator() {
    req.session.pinReturn = otpGenerator.generate(5, { digits: true, upperCase: true, specialChars: false, alphabets: false });
    console.log(req.session.pinReturn);
}

PinGenerator.prototype.getPin = function () {
    return req.session.pinReturn;
};

app.get("/forgetpass", async (req, res) => {

    res.sendFile(__dirname + "/landing-page/forget.html");
})
let forgetmail;
app.post("/forget", async (req, res) => {
    let result = await client.connect();
    let db = result.db(database);
    let collection = db.collection('notes');
    req.session.forgetmail = await req.body.email;
    let responce1 = await collection.find({ email: req.body.email }).toArray();
    if (responce1 == "") {
        console.log("No data found");
        // res.sendFile(__dirname + "/landing-page/login.html");
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"> <h2> You have no account ! Please sign up </h2> <br>  <a href="/sign">Sign Up</a></center>`)

    }
    else if (req.session.forgetmail==adminmail)
    {
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"><br><br><h1 style="font-size:4rem;"> You cannot update password here</h1><br><a href="/" style="font-size:3rem">Go to homepage</a></center>`);
    }
    else {


        PinGenerator();
        var nodemailer = require("nodemailer");
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL_FROM,
                pass: process.env.MAIL_PASSWORD,
            }
        });
        var mailoption = {
            from: process.env.MAIL_FROM,
            to: req.body.email,// req.body.email;
            subject: "IIITU library management password reset",
            text: "Your Pin is:",
            html: `<h3>Your pin is:</h3><h1>${req.session.pinReturn}</h1>`
        };
        console.log(req.session.pinReturn);


        transporter.sendMail(mailoption, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('Email has been sent');
            }
        })

        console.log('forget password function');
        res.sendFile(__dirname + "/landing-page/otp.html");
    }

})

app.post("/otp", async (req, res) => {
    let otpsubmit = req.body.otp;
    if (otpsubmit === req.session.pinReturn) {
        res.sendFile(__dirname + "/landing-page/resetpass.html")
    }
    else
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"> <h1> Your otp is not  correct</h1> </center>`)
    {

    }
})

/////////////////////////////////////////////////////////////
async function dbConnect() {
    let result = await client.connect();
    db = result.db('Students');
    return db.collection('notes');

}

//////////////////////////////////////////////////////////////////////
app.post("/changepass", async (req, res) => {

    let data = await dbConnect();
    let result = await data.updateMany(
        { email: req.session.forgetmail }, {
        $set: { password: req.body.pass1 }
    }
    );
    console.log(req.session.forgetmail);
    console.log(req.body.pass1);
    res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"> <h1> Your password has been changed successfully!<hr><hr> <a href="/login">Go to Login page</a></h1> </center>`)
})
let requestedbook;
app.post("/searchbook", async (req, res) => {
    let result = await client.connect();
    let db = result.db(database);
    let collection = db.collection('Books');
    let responce1 = await collection.find({ name: req.body.name }).toArray();

    if (responce1 != "") {

        req.session.requestedbook = await responce1[0].name;
        console.log(responce1);
        app.set('view engine', 'ejs');
        res.render(__dirname + "/views/allocatebook.ejs", { responce1 });

    }
    else {
        res.render(__dirname + "/views/booknotavailable.ejs");
    }

});
let status, numberofbooks;
app.get("/allocatebook", async (req, res) => {
    let logindata=req.session.logindata;
    let data = await dbConnect();
    if (checklogin == 1 && logindata[0].booknumbers < 10) {


        //////////////////////////////////////////
        console.log(logindata[0].book2);
        //////////////////////////////////////////
        if (logindata[0].book1 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book1: req.session.requestedbook, returned1: datetime }
            }
            );
        }
        else if (logindata[0].book2 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book2: req.session.requestedbook, returned2: datetime }
            }
            );
        }
        else if (logindata[0].book3 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book3: req.session.requestedbook, returned3: datetime }
            }
            );
        }
        else if (logindata[0].book4 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book4: req.session.requestedbook, returned4: datetime }
            }
            );
        }
        else if (logindata[0].book5 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book5: req.session.requestedbook, returned5: datetime }
            }
            );
        }
        else if (logindata[0].book6 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book6: req.session.requestedbook, returned6: datetime }
            }
            );
        }
        else if (logindata[0].book7 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book7: req.session.requestedbook, returned7: datetime }
            }
            );
        }
        else if (logindata[0].book8 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book8: req.session.requestedbook, returned8: datetime }
            }
            );
        }
        else if (logindata[0].book9 == "") {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book9: req.session.requestedbook, returned9: datetime }
            }
            );
        }
        else {
            let result = await data.updateMany(
                { email: req.session.logmail }, {
                    $set: { book10: req.session.requestedbook, returned10: datetime }
            }
            );
        }


        let result = await client.connect();
        let db = result.db(database);
        let collection = db.collection('Books');
        let collection2 = db.collection('notes');
        let responce1 = await collection.find({ name: req.session.requestedbook }).toArray();
        let responce2 = await collection2.find({ name: req.session.username }).toArray();
        // console.log(responce2);
        req.session.numberofbooks = await logindata[0].booknumbers;
        req.session.status = await responce1[0].status;
        if (req.session.status >= 1) {
            /////////////////////////////////////////////////////////////////////////////////////////////
            var nodemailer = require("nodemailer");
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.MAIL_FROM,
                    pass: process.env.MAIL_PASSWORD,
                }
            });
            var mailoption = {
                from: process.env.MAIL_FROM,
                to: req.body.email,
                subject: "IIITU library management:Return the book",
                html: `<h3>This is the last day For you to return the book <h2 style="color: red;">${req.session.requestedbook}</h2> <h5>If You have returned the book then ignore it</h5>`,
            };
            // console.log(pinReturn);
            setTimeout(() => {
                sending();
            }, 8646000 * 1000);
            function sending() {
                transporter.sendMail(mailoption, function (err, info) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('Email has been sent');
                    }
                })

            }
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////

            let result1 = await collection.updateOne(
                { name: req.session.requestedbook }, {
                    $set: { status: req.session.status - 1 }
            }
            );
            let result2 = await collection2.updateOne({ name: req.session.username }, { $set: { booknumbers: req.session.numberofbooks + 1 } });
            //////////////////////////////////////////////////////////////////
            console.log(req.session.logmail);
            console.log(req.session.requestedbook);
            res.render(__dirname + "/views/booksuccessfully.ejs");
        }
        else {
            res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"><h1>Your Required book is not currently available<br><a href="/">Go to Homepage</a></h1></center>`);
        }
    }
    else if (checklogin == 1) {
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"><h1>You are not allowed to get Books more than 10<br>Please return Books To get more Books<br><a href="/">Go to Homepage</a></h1></center>`);
    }
    else {
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem"><h1>Kindly First Login <br><a href="/login">Go to login Page</a> </h1></center>`)
    }
})

app.get("/returnBook", async (req, res) => {
    if (checklogin == 1 && admincheck==1) {
        res.render(__dirname + "/views/returnBook.ejs");
    }
    else if(checklogin==1)
    {
        res.sendFile(__dirname+"/landing-page/Error404.html");
    }
    else {
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:5rem;"><h1>Kindly First Login <hr><a href="/login">Go to login Page</a> </hr></h1></center>`)
    }
});

app.post("/returning", async (req, res) => {
    let result = await client.connect();
    let db = result.db(database);
    let collection = db.collection('notes');
    let collection2 = db.collection('Books');
    let responce1 = await collection.find({ email: req.body.email }).toArray();
    let responce2 = await collection2.find({ name: req.body.name }).toArray();
    let bookname = req.body.name;
    let fine, numberofbooks;
    if (responce2 != "" && responce1 != "") {
        let email = await responce1[0].email;
        let newstatus = await responce2[0].status;
        numberofbooks = await responce1[0].booknumbers;
        if (responce1[0].book1 == bookname) {
            if (responce1[0].fine1 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book1: "", booknumbers: numberofbooks - 1, returned1: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine1;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book1: "", fine1: 0, booknumbers: numberofbooks - 1, returned1: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book2 == bookname) {
            if (responce1[0].fine2 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book2: "", booknumbers: numberofbooks - 1, returned2: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine2;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book2: "", fine2: 0, booknumbers: numberofbooks - 1, returned2: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book3 == bookname) {
            if (responce1[0].fine3 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book3: "", booknumbers: numberofbooks - 1, returned3: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine3;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book3: "", fine3: 0, booknumbers: numberofbooks - 1, returned3: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book4 == bookname) {
            if (responce1[0].fine4 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book4: "", booknumbers: numberofbooks - 1, returned4: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine4;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book4: "", fine4: 0, booknumbers: numberofbooks - 1, returned4: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book5 == bookname) {
            if (responce1[0].fine5 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book5: "", booknumbers: numberofbooks - 1, returned5: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine5;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book5: "", fine5: 0, booknumbers: numberofbooks - 1, returned5: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book6 == bookname) {
            if (responce1[0].fine6 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book6: "", booknumbers: numberofbooks - 1, returned6: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine6;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book6: "", fine6: 0, booknumbers: numberofbooks - 1, returned6: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book7 == bookname) {
            if (responce1[0].fine7 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book7: "", booknumbers: numberofbooks - 1, returned7: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine7;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book7: "", fine7: 0, booknumbers: numberofbooks - 1, returned7: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book8 == bookname) {
            if (responce1[0].fine8 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book8: "", booknumbers: numberofbooks - 1, returned8: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine8;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book8: "", fine8: 0, booknumbers: numberofbooks - 1, returned8: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book9 == bookname) {
            if (responce1[0].fine9 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book9: "", booknumbers: numberofbooks - 1, returned9: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine9;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book9: "", fine9: 0, booknumbers: numberofbooks - 1, returned9: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else if (responce1[0].book10 == bookname) {
            if (responce1[0].fine10 == 0) {
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book10: "", booknumbers: numberofbooks - 1, returned10: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/returnedsuccessfully.ejs");
            }
            else {
                fine = responce1[0].fine10;
                let result1 = await collection.updateOne(
                    { email: email }, {
                    $set: { book10: "", fine10: 0, booknumbers: numberofbooks - 1, returned10: "" }
                }
                );
                let result2 = await collection2.updateOne({ name: bookname }, { $set: { status: newstatus + 1 } });
                res.render(__dirname + "/views/collect_fine.ejs", { fine });
            }
        }
        else {
            res.render(__dirname + "/views/not_issued.ejs", { responce1, bookname });
        }
    }
    else if (responce2 != "") {
        res.send(`<center><h1>Incorrect Email Address</h1></center>`);
    }
    else {
        res.send(`<center style="background-color:grey; height:93rem;padding-top:20rem;font-size:3rem;"><h1>You have not Entered correct Book name<br>***Book name is case sensitive</h1></center>`);
    }

})
app.get("/addbooks", async (req, res) => {
    if (req.session.usermail == adminmail && req.session.userpass == adminpass && admincheck==1)
        res.render(__dirname + "/views/addbook.ejs");
    else {
        // res.send(`<center ><h2 style="font-size:3rem;">You have not authentication to access this page<br><a href="/">Go to Homepage</a></h2></center>`);
        res.sendFile(__dirname + "/landing-page/Error404.html");
    }
})
let newbookname;
app.post("/addbook", async (req, res) => {
    let result = await client.connect();
    let db = await result.db(database);
    let collection = await db.collection('Books');
    let responce1 = await collection.find({ name: req.body.name }).toArray();
    req.session.newbookname = req.body.name;
    newbookname =req.session.newbookname;
    if (responce1 == "") {
        let result = await collection.insertOne({
            name: req.body.name,
            status: req.body.status,
            reference: req.body.reference
        });
        console.log(result);
        res.render(__dirname + "/views/addbooksuccess.ejs", { newbookname });

    }
    else {
        console.log(newbookname);
        res.render(__dirname + "/views/addbookfailed.ejs",{newbookname});
    }
});
app.get("/removebooks",async(req,res)=>{
    if (req.session.usermail == adminmail && req.session.userpass == adminpass && admincheck==1)
        // res.render(__dirname + "/views/addbook.ejs");
        res.render(__dirname+"/views/removebook.ejs");
    else {
        // res.send(`<center ><h2 style="font-size:3rem;">You have not authentication to access this page<br><a href="/">Go to Homepage</a></h2></center>`);
        res.sendFile(__dirname + "/landing-page/Error404.html");
    }
});
let removebookid,removebookname;
app.post("/removebook",async(req,res)=>{
    let data =await client.connect();
    let db = data.db("Students");
    let collection = db.collection('Books');
    req.session.removebookid = req.body.id;
    removebookid = req.session.removebookid;
    let responce1 = await collection.find({ _id: req.session.removebookid}).toArray();
    if (responce1!="") {
        req.session.removebookname = await responce1[0].name;
        removebookname = req.session.removebookname;
        let result = await collection.deleteOne({ _id: req.session.removebookid});
        console.log(result);
        res.render(__dirname+"/views/removebooksuccess.ejs",{removebookname});
    }
    else
    {
        res.render(__dirname+"/views/removebookfailed.ejs",{removebookid});
    }

});
app.get("/logout",(req,res)=>{
    checklogin=0;
    res.redirect('/login')
    // res.sendFile(__dirname+"/landing-page/login.html");
});
app.get("/seeaccount",(req,res)=>{
    if (req.session.usermail == adminmail && req.session.userpass == adminpass && admincheck==1)
    res.render(__dirname+"/views/seeaccount.ejs");
        // res.render(__dirname + "/views/addbook.ejs");
    else {
        // res.send(`<center ><h2 style="font-size:3rem;">You have not authentication to access this page<br><a href="/">Go to Homepage</a></h2></center>`);
        res.sendFile(__dirname + "/landing-page/Error404.html");
    }
})

app.post("/seeaccount",async(req,res)=>{
    let data = await client.connect();
    let db = await data.db("Students");
    let collection = await db.collection("notes");
    let responce1 = await collection.find({email:req.body.email}).toArray();
    console.log(responce1);
    if (responce1!="") {
        let logindata =await responce1;
        res.render(__dirname+"/views/accountdetails.ejs",{logindata});
    }
    else
    {
        res.render(__dirname+"/views/accountnotfound.ejs");
    }
})

app.get('*', (req, res) => {
    res.sendFile(__dirname + "/landing-page/Error404.html");
})

app.listen(port);