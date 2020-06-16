require('dotenv').config()

const express = require('express')
const app = express()
const bodyPaser = require('body-parser')
app.use(bodyPaser.json())

const morgan = require('morgan')
// NOTE: data shouldn't appear in the log due to GDPR
morgan(':method :url :status :res[content-length] - :response-time ms')
app.use(morgan('combined'))

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

const PersonDBService = require('./model/persons')

const API_PREFIX = '/api'

app.get('/', (req, res) => {
  res.send('<h1> It Works! </h1>')
})

app.get(`${API_PREFIX}/persons`, (req, res) => {
  PersonDBService.find({}).then(persons => {
    res.json(persons)
  }).catch(err => next(err))
})

app.get(`${API_PREFIX}/persons/:id`, (req, res, next) => {
  const id = req.params.id
  PersonDBService.findById(id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  }).catch(err => next(err))
})

app.post(`${API_PREFIX}/persons`, async (req, res, next) => {
  const person = req.body
  if (person === undefined) {
    res.statusMessage = 'Person is undefined'
    res.status(400).end()
  } else {
    if (person.name === undefined || person.number === undefined) {
      res.statusMessage = 'name and number are requested'
      res.status(400).end()
    } else {
      const persons = await PersonDBService.find({})
      if (persons.find(p => p.name.toLowerCase() === person.name.toLowerCase())) {
        res.statusMessage = `${person.name} exists`
        res.status(400).end()
      } else {
        const p = new PersonDBService({
          name: person.name,
          number: person.number
        })

        p.save().then(savedPerson => {
          res.json(savedPerson)
        }).catch(err => next(err))
      }
    }
  }
})

app.put(`${API_PREFIX}/persons/:id`, (req, res, next) => {
  const id = req.params.id
  const person = req.body

  if (person === undefined) {
    res.statusMessage = 'Person is undefined'
    res.status(400).end()
  } else {
    if (person.name === undefined || person.number === undefined) {
      res.statusMessage = 'name and number are requested'
      res.status(400).end()
    } else {
      PersonDBService.findByIdAndUpdate(id, person, {new: true}).then(updatedPerson => {
        res.json(updatedPerson)
      }).catch(err => next(err))
    }
  }
})

app.delete(`${API_PREFIX}/persons/:id`, (req, res, next) => {
  const id = req.params.id
  PersonDBService.findByIdAndDelete(id).then(result => {
    res.status(204).end()
  }).catch(err => next(err))
})

app.get(`/info`, (req, res) => {
  const receivedDate = new Date()

  PersonDBService.find({}).then(persons => {
    res.send(`
      <p> Phonebook has info for ${persons.length} people </p>
      <p> ${receivedDate} </p>
    `)
  }).catch(err => next(err))  
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on part ${PORT}`)
})