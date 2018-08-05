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
    constructor (hosts, replicaSet, dbName) {
        this.client = null
        this.connection = null
        this.replicaSet = replicaSet
        this.dbName = dbName
        this.mongoUri = (
            'mongodb://' +
            hosts.map(
                host => host.ip + ':' + host.port
            ).join(',') + '/' + dbName
        )
    }

    /**
     * Initialize db connection
     * @returns {Object} connection
     */
    async init () {
        const client = await mongoClient.connect(
            this.mongoUri,
            {
                replicaSet: this.replicaSet,
                useNewUrlParser: true
            },
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
