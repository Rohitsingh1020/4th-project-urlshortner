const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const { default: mongoose } = require('mongoose');
const route = require('../src/routes/route')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb+srv://Projectblog1:Roomno20@cluster0.vl9g6.mongodb.net/rohitkumarsingh-DB?authSource=admin&replicaSet=atlas-fm8m4t-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true", { useNewUrlParser: true })

    .then(() => console.log("MongoDB is connected"))
    .catch(err => console.log(err))

app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
