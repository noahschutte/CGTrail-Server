const MongoClient = require('./MongoClient')
const hosts = [{ ip: 'localhost', port: '27017' }]
const replicaSet = ''
const dbName = 'cgtrail'
const mongoClient = new MongoClient(hosts, replicaSet, dbName)
const businesses = require('./businesses')

async function _main () {
    const mongoConnection = await mongoClient.init()
    console.log({mongoConnection})
    console.log('Starting to seed mongo db...')

    await new Promise((resolve, reject) => {
        businesses.forEach(async business => {
            await mongoConnection.collection('businesses').insertOne(business)
            console.log('uploaded!')
        })
    })

    console.log('Done seeding db.')
}

_main().then(() => {
    process.exit(0)
}, (err) => {
    console.error(err)
})
