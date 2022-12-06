const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

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

const UserSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  exercise:[{
    description: {
      type:String,
      required: false
    },
    duration: {
      type:Number,
      required: false
    },
    date: {
      type:Date,
      required: false
    },
  }]
})

const User = new mongoose.model('User',UserSchema);

// MongoDB methods

const errorHandle = (err) =>{
  console.log("Trouble connecting to database"+err);
}
const findUserByName = async (uname) => {
  try {
    let found = await User.findOne({'username':uname});
    return found
  } catch {
    errorHandle(err)
  }
}

const listUsers = () => {
  try {
    const list = User.find().select('username')
    return list;
  } catch {
    errorHandle(err);
  }
}

const createUser = async (uname) => {
  await User.create({'username':uname})
}

const findUserById = async (id) =>{
  try {
    let user = User.findById({_id:id});
    return user;
  } catch {
    errorHandle(err)
  }
}
const addExerciseToUser = async (id,desc,dur,date) => {
  let user = await User.findUserById(id);
  user.exercises.push({'description':desc,'duration':dur,'date':new date});
  user.save();
}

// Middleware section
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Http calls

app.post('/api/users',async (req,res,next)=>{
  let id = await findUserByName(req.body.username)
  if (id == null) {
    await createUser(req.body.username);
    id = await findUserByName(req.body.username)
  }
  next()
  },async (req,res)=>{
    let id = await findUserByName(req.body.username)
    res.json({"username":req.body.username,"id":id._id})
  })

app.get('/api/users',async (req,res)=>{
  const list = await listUsers()
  res.json(list); 
})

app.post('/api/users/:id/exercises',async (req,res)=>{
  let user = await findUserById(req.params.id)
  res.json({'_id':user._id,'username':user.username,'date':req.body.date,'duration':req.body.duration,'description':req.body.description})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
