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
      type:String,
      required: false
    },
  }]
})

const User = new mongoose.model('User',UserSchema);

// MongoDB methods

const errorHandle = (err) =>{
  console.log("Eroor: "+err);
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
    let user = await User.findById({_id:id});
    return user;
  } catch(err) {
    errorHandle(err)
  }
}

const addExerciseToUser = async (id,desc,dur,date) => {
  try{
    let user = await User.findById({_id:id});
    user.exercise.push({'description':desc,'duration':dur,'date':new Date(date).toDateString()});
    await user.save();
    return user 
  } catch(err) {
    errorHandle(err)
  }
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
    res.json({"username":req.body.username,"_id":id._id})
  })

app.get('/api/users',async (req,res)=>{
  const list = await listUsers()
  res.json(list); 
})

app.post('/api/users/:id/exercises',async (req,res)=>{
  try{
    req.body.date?req.body.date+='T00:00:00':undefined;
    if (!req.body.date) req.body.date = Date.now();
    let dateFormat = new Date(req.body.date).toDateString();
    let user = await addExerciseToUser(req.params.id,req.body.description,req.body.duration,dateFormat)
    res.json({'_id':user._id,'username':user.username,'date':dateFormat,'duration':Number(req.body.duration),'description':req.body.description})
  } catch(err) {
    errorHandle(err)
    res.json(err)
  }
  })

app.get('/api/users/:id/logs',async (req,res)=>{
  let user = await findUserById(req.params.id);
  let exercises = user.exercise
 
    req.query.from?(exercises=exercises.filter(x=>new Date(x.date)>new Date(req.query.from+'T00:00:00'))):exercises
    req.query.to?exercises=exercises.filter(x=>new Date(x.date)<new Date(req.query.to+'T00:00:00')):exercises
    req.query.limit?exercises=exercises.filter((x,i)=>i<Number(req.query.limit)):exercises
    //exercises = exercises.filter((x,i)=>new Date(x.date)>new Date(req.query.from) && new Date(x.date)<new Date(req.query.to) && i<=req.query.limit)
    exercises = exercises.map(x=>({'description':x.description,'duration':x.duration,'date':x.date}))


  let count = exercises.length;
  res.json({_id:user._id,username:user.username,from:req.query.from?new Date(req.query.from+'T00:00:00').toDateString():undefined,to:req.query.to?new Date(req.query.to+'T00:00:00').toDateString():undefined,limit:req.query.limit,count:count,log:exercises})
  console.log({_id:user._id,username:user.username,from:req.query.from?new Date(req.query.from+'T00:00:00').toDateString():undefined,to:req.query.to?new Date(req.query.to+'T00:00:00').toDateString():undefined,limit:req.query.limit,count:count,log:exercises})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
