const { Schema, model, Types } = require('mongoose');

const bookOrderedSchema = new Schema({
    book: {
        type: Types.ObjectId,
        ref: 'Book',
        required: true,
        immutable: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, '❌ Quantity must be at least 1'],
        validate: {
            validator: value => value % 1 === 0,
            message: '❌ Quantity must be a positive integer'
        }
    },
    priceAtPurchase: {
        type: Number,
        required: true,
        min: [0, '❌ Price cannot be negative'],
        immutable: true
    }
});

module.exports = bookOrderedSchema;
