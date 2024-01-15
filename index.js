const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.of1ofap.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
     
    const servicesCollection = client.db('geniusCar').collection('services');
    const bookingsCollection = client.db('geniusCar').collection('bookings');

    app.get('/services', async (req, res) => {
        const result = await servicesCollection.find().toArray();
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


    // bookings
    app.post('/bookings', async (req, res) => {
      const services = req.body;
      const result = await bookingsCollection.insertOne(services);
      res.send(result)
    });

    app.get('/bookings', async (req, res) => {
      console.log(req.query);
      const result = await bookingsCollection.find().toArray();
      res.send(result)
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