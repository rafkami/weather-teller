const mongoose = require('mongoose')

const schema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        id: {
            type: Number,
            required: [true, 'City ID field is required'],
            max: 200000000
        },
        name: {
          type: String,
          required: [true, 'Name field is required'],
          max: 100
        },
        country: {
          type: String,
          required: [true, 'Country symbol field is required'],
          uppercase: true,
          minlength: 2,
          maxlength: 2
        }
      }),
      City = mongoose.model('product', schema)
exports.City = City