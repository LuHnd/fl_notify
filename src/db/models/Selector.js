const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    container: {type: String},
    title: {type: String},
    description: {type: String},
    price: {type: String},
})

module.exports = model('Selector', schema)