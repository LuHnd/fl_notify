const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    title: {type: String},
    base: {type: String},
    selector: {type: Types.ObjectId, ref: 'Selector'},
    categories: [{type: Types.ObjectId, ref: 'Category'}]
})

module.exports = model('Source', schema)