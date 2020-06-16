const mongoose = require('mongoose')

const db_url = process.env.MONGODB_URL
console.log('using', db_url)

mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true }).then(result => {
  console.log('connected to MongoDB')
}).catch((error) => {
  console.log('error connecting to MongoDB:', error.message)
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
  