const mongoClient = require('mongodb').MongoClient

/**
 * MongoClient class
 */
class MongoClient {
    /**
     * Construct mongo client instance
     * @param {Array} [hosts]
     * @param {string} replicaSet
     * @param {string} dbName
     */
    constructor (mongoUri, dbName) {
        this.client = null
        this.connection = null
        this.dbName = dbName
        this.mongoUri = mongoUri
    }

    /**
     * Initialize db connection
     * @returns {Object} connection
     */
    async init () {
        const client = await mongoClient.connect(
            this.mongoUri,
            { useNewUrlParser: true }
        )
        this.client = client
        this.connection = client.db(this.dbName)
        return this.connection
    }

    /**
     * Close db connection
     * @returns {Promise<Resolve>}
     */
    async closeConnection () {
        if (this.connection) {
            this.connection = null
        }
        if (this.client) {
            await this.client.close()
            this.client = null
        }
    }
}

module.exports = MongoClient
