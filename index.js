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

let persons = [
  {
    name: 'test',
    number: '123-456-789',
    id: 1
  }
]

const API_PREFIX = '/api'

app.get('/', (req, res) => {
  res.send('<h1> It Works! </h1>')
})

app.get(`${API_PREFIX}/persons`, (req, res) => {
  PersonDBService.find({}).then(persons => {
    res.json(persons)
  })
})

app.get(`${API_PREFIX}/persons/:id`, (req, res) => {
  const id = Number(req.params.id)
  let foundPerson = persons.find(p => p.id === id)
  if (foundPerson) {
    res.json(foundPerson)
  }
  res.status(404).end()
})

app.post(`${API_PREFIX}/persons`, (req, res) => {
  const person = req.body
  if (person === undefined) {
    res.statusMessage = 'Person is undefined'
    res.status(400).end()
  } else {
    if (person.name === undefined || person.number === undefined) {
      res.statusMessage = 'name and number are requested'
      res.status(400).end()
    } else {
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
        })
      }
    }
  }
})

app.delete(`${API_PREFIX}/persons/:id`, (req, res) => {
  const id = Number(req.params.id)
  let foundPerson = persons.find(p => p.id === id)
  if (foundPerson) {
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
  }
  res.status(404).end()
})

app.get(`/info`, (req, res) => {
  const receivedDate = new Date()

  res.send(`
    <p> Phonebook has info for ${persons.length} people </p>
    <p> ${receivedDate} </p>
  `)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on part ${PORT}`)
})