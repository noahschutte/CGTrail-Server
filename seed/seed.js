require('dotenv').config()

const MongoClient = require('../MongoClient')
const mongoUri = process.env.MONGO_URI
const dbName = 'cgtrail'
const mongoClient = new MongoClient(mongoUri, dbName)
const businesses = require('./businesses')

async function _main () {
    const mongoConnection = await mongoClient.init()
    console.log('Starting to seed mongo db...')

    businesses.forEach(business => {
        new Promise(() => {
            mongoConnection.collection('businesses').insertOne(business)
            console.log("Uploaded!")
        })
    })

    console.log('Done seeding db.')
}

_main().then(() => {
    process.exit(0)
}, (err) => {
    console.error(err)
})
