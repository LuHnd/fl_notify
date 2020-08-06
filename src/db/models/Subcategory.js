const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    title: { type: String },
    path: { type: String },
    lastOffers: [ { type: Object } ]
})

module.exports = model('Subcategory', schema)