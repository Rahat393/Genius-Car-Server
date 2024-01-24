const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.of1ofap.mongodb.net/?retryWrites=true&w=majority`;
 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT = (req, res, next) => {
 
  const authorization = req.headers.authorization;
  if(!authorization) {
    return res.status(401).send({error: true, message: 'unauthorized access'})
  };
  const token = authorization.split(' ')[1];
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if(error){
      return res.status(403).send({error: true, message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
     
    const servicesCollection = client.db('geniusCar').collection('services');
    const bookingsCollection = client.db('geniusCar').collection('bookings');

    app.get('/services', async (req, res) => {
      const sort = req.query.sort;
        console.log(sort);
        const search = req.query.search;
        console.log(search);
        // const query = { price : {$gte: 30, $lte: 150}};
        const query = {title : {$regex : search, $options : 'i'}};
        const options = {
          // Sort matched documents in descending order by rating
          sort: { 
            "price":  sort === 'asc' ? 1 : -1 
          },
         
        };
        const result = await servicesCollection.find( query, options).toArray();
        res.send(result)
    });

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;  
      const query = {_id: new ObjectId(id)};
      const options = {
         
        // Include only the `title` and `imdb` fields in the returned document
        projection: {  title: 1, price: 1, img:1 },
      };
      const result = await servicesCollection.findOne(query, options)
      res.send(result)
    });

    // JWT
    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
      });
      res.send({token})
    })


    // bookings
    app.post('/bookings', async (req, res) => {
      const services = req.body;
      const result = await bookingsCollection.insertOne(services);
      res.send(result)
    });

    app.get('/bookings', verifyJWT, async (req, res) => {
     const decoded = req.decoded;
    console.log( 'comming back ', decoded.email);
    if(decoded.email !== req.query.email){
      return res.status(403).send({error : 1, message: 'forbidden access'})
    }
      let query ={};
      if(req.query?.email){
        query = {
          email : req.query.email
        }
      }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result)
    });

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
    });

    app.put('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};         
      const updatedBooking = req.body;
      const updatedDoc = {
        $set: {
          status: updatedBooking.status
        }
      };
      const result = await bookingsCollection.updateOne(filter, updatedDoc);
      res.send(result);
      
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server running ....')
})

app.listen(port, () => console.log(`genius car running on ${port}`));