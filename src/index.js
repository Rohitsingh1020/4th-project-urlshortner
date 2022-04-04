const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const { default: mongoose } = require('mongoose');
const route = require('../src/routes/route')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb+srv://Pramod09:Pramod%4010@pramod09.i3td2.mongodb.net/pramod09-db", { useNewUrlParser: true })

    .then(() => console.log("MongoDB is connected"))
    .catch(err => console.log(err))

app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
