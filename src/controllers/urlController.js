const validUrl = require('valid-url')
const shortId = require('shortid')
const urlModel = require("../models/urlModel")



//VALIDATION_FUNCTIONS-

//Function 1-
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

//Function 2-
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'String' && value.trim().length === 0) return false
    return true
}




//CREATE_URL-
const createUrl = async function (req, res) {
    try {

        let data = req.body;

        //validations-
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some input to create data" })
        }

        if (!isValid(data.longUrl)) {
            return res.status(400).send({ status: false, msg: "please provide a url" })
        }

        //validating with valid-url package-
        if (!validUrl.isUri(data.longUrl)) {
            return res.status(400).send({ status: false, msg: "please provide a valid url" })
        }



        //generating urlCode with shortId package
        let urlCode = shortId.generate().toLowerCase()
        //creating shortUrl with base url & urlCode
        let shortUrl = `http://localhost:3000/${urlCode}`

        data.urlCode = urlCode
        data.shortUrl = shortUrl

        let duplicateUrl = await urlModel.findOne({longUrl:data.longUrl})

        if(duplicateUrl){return res.status(200).send({status:true, message:"This url has already created short url", data:duplicateUrl})}

        let createNewUrl = await urlModel.create(data);
        //console.log(createNewUrl)
        return res.status(201).send({ status: true, message: "url created successfully", data: createNewUrl })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}




//getAPIforRedirect-

const getUrlData = async function (req, res) {
    try {
        let data = req.params.urlCode;
        //console.log(data);

        let getData = await urlModel.findOne({ urlCode: data })
        //console.log(getData);
        if (!getData) { return res.status(404).send({ status: false, message: "no short url available for your request" }) }

        return res.status(301).redirect(getData.longUrl)
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}





module.exports.createUrl = createUrl
module.exports.getUrlData = getUrlData