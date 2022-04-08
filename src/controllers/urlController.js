const validUrl = require('valid-url')
const shortId = require('shortid')
const urlModel = require("../models/urlModel")
const redis = require('redis')
const { promisify } = require("util");





//Connect to redis--
const redisClient = redis.createClient(
    19136,
    "redis-19136.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("wBlVV7JVKIBa0AZAy3HhmPh5aniXh9YX", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});


//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);




//VALIDATION_FUNCTIONS-

//Function 1-
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

//Function 2
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'String' && value.trim().length === 0) return false
    return true
}




//CREATE_URL
const createUrl = async function (req, res) {
    try {

        let data = req.body;

        //validations
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


        let duplicateUrl = await urlModel.findOne({ longUrl: data.longUrl })

        if (duplicateUrl) { return res.status(200).send({ status: true, message: "This url has already created short url", data: duplicateUrl }) }

        //generating urlCode with shortId package
        let urlCode = shortId.generate().toLowerCase()
        //creating shortUrl with base url & urlCode
        let shortUrl = `http://localhost:3000/${urlCode}`

        data.urlCode = urlCode
        data.shortUrl = shortUrl

        let createNewUrl = await urlModel.create(data);
        //console.log(createNewUrl)
        //set data in cache
        await SET_ASYNC(`${urlCode}`, JSON.stringify(createNewUrl))
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

        //checking if data available in cache
        let cachedUrl = await GET_ASYNC(`${data}`)
        //console.log(cachedUrl);

        //sending cache data in "if" condition here, if data available in cache
        parseData = JSON.parse(cachedUrl)
        //console.log(parseData);

        if (cachedUrl) {
            return res.status(301).redirect(`${parseData.longUrl}`)
        } else {
            let getData = await urlModel.findOne({ urlCode: data })
            //console.log(getData);

            if (!getData) { return res.status(404).send({ status: false, message: "no short url available for your request" }) }

            await SET_ASYNC(`${data}`, JSON.stringify(getData))
            return res.status(301).redirect(getData.longUrl)
        } //in else condition, if data not available in cache then making db call for getting data then
        //setting that data in cache and sending data in response 
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}





module.exports.createUrl = createUrl
module.exports.getUrlData = getUrlData