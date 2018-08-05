const mongo = require('mongodb')

/**
 * BusinessesRepository class
 */
class BusinessesRepository {
    /**
     * Construct businesses repository instance
     * @param {Object} mongoConnection
     */
    constructor (mongoConnection) {
        this.collection = mongoConnection.collection('businesses')
    }

    findAll () {
        return this.collection.find({}).toArray()
    }

    /**
     * Find a single business by id
     * @param {string} id
     * @returns {Object} affiliateAgreement document
     */
    findById (id) {
        return this.collection.findOne({ _id: new mongo.ObjectID(id) })
    }
}

module.exports = BusinessesRepository
