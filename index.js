const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

//mongoose config
const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://mars77:1234@cluster0.xbzwd5f.mongodb.net/mongodb-fcc?retryWrites=true&w=majority', 
{ 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}); 

const Exercise = new mongoose.Schema({
  username: {
    type:String,
    required: true
  },
  description: String,
  duration: Number,
  date: Date,
})

const User = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  exercise:{
    username: {
      type:String,
      required: true
    },
    description: {
      type:String,
      required: true
    },
    duration: {
      type:Number,
      required: true
    },
    date: {
      type:Date,
      required: true
    },
  }
})

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
