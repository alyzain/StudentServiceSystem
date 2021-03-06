var mysql = require("mysql");
var express = require("express");
var router = express.Router();
module.exports = router;
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
var nodemailer = require("nodemailer");
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var connection = require("../controllers/dbconnection");
var env = require("dotenv").config({ path: __dirname + "../.env" });
var bcrypt = require("bcryptjs");
var pwd = " ";
var email = " ";
router.post("/changepass/Secretary", function (request, res) {
  if (request.user) {
    var username = request.user.username;
    var oldPass = request.body.newPassword.oldPass;
    var newPass = request.body.newPassword.newPass;
    var confirmNewPass = request.body.newPassword.confirmNewPass;

    connection.query("USE AlexUni");
    connection.query(
      "SELECT * FROM Secretary WHERE Username = ?",
      [username],
      function (error, results, fields) {
        if (results.length > 0) {
          Object.keys(results).forEach(function (key) {
            var row = results[key];
            pwd = row.Password;
            email = row.email;
          });

          if (pwd == oldPass) {
            if (newPass == confirmNewPass) {
              connection.query(
                "UPDATE Secretary SET Password=? WHERE ID=?",
                [newPass, username],
                function (error, results) {
                  if (error) throw error;
                  else {
                    const output = `
                      <p>You have changed your login password in Alexandria University Student Service System.</p>
                      <ul>
                      <li>New Password: ${newPass}</li>
                      </ul>
                      <h3>Note:</h3>
                      <p>Please keep your new password in a safe place.</p>  `;

                    let transporter = nodemailer.createTransport({
                      host: "smtp.gmail.com",
                      port: 587,
                      secure: false, // true for 465, false for other ports
                      auth: {
                        user: "alexandriauniversity7@gmail.com", // generated ethereal user
                        pass: "Unified7!!", // generated ethereal password
                      },
                      tls: {
                        rejectUnauthorized: false,
                      },
                    });

                    let mailOptions = {
                      from:
                        '"Alexandria University" <alexandriauniversity7@gmail.com>', // sender address
                      to: email, // list of receivers
                      subject: "Alexandria University", // Subject line
                      text: "Hello world?", // plain text body
                      html: output, // html body
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        throw error;
                      } else {
                        res.status(200).send({
                          error: false,
                          message:
                            "تم تغير كلمة السر بنجاح. رجاء تفقد بريدك الالكتروني.",
                        });
                      }
                    });
                  }
                }
              );
            } else {
              return res.status(401).json({
                error: true,
                message: "تأكيد كلمة السر لا تطابق كلمة السر الجديدة",
              });
            }
          } else {
            return res.status(401).json({
              error: true,
              message: "كلمة المرور الحالية خاطئة",
            });
          }
        }
      }
    );
  } else {
    res.status(401).send({
      error: true,
      message: "Please log in to view this page!",
    });
  }
});
