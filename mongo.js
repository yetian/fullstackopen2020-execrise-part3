// run: node mongo.js "$(< password)"

const mongoose = require('mongoose')

if ( process.argv.length != 3 && process.argv.length !== 5 ) {
  console.log('Please provide the password as an argument: node mongo.js <password> or node mongo.js <password> name number')
  process.exit(1)
}

const password = process.argv[2]
let personName = null
let personNumber = null

if (process.argv.length === 5) {
  personName = process.argv[3]
  personNumber = process.argv[4]
}

const url = `mongodb+srv://fullstack:${password}@cluster0-8rfml.mongodb.net/phonebook-app?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (personName === null || personNumber === null) {
  // list people
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else {
  // add new person
  const person = new Person({
    name: personName,
    number: personNumber
  })

  person.save().then(result => {
    console.log(`added ${personName} ${personNumber} to phonebook`)
    mongoose.connection.close()
  })
}