const express= require('express')
const cors=require('cors')

const app= express()
const port=process.env.PORT||5012
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

//middleware-------
app.use(cors());
app.use(express.json())

// user:electricbill    pass:GwWywrgzspkKc88h
const uri = "mongodb+srv://electricbill:GwWywrgzspkKc88h@cluster0.mnncxar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    // Send a ping to confirm a successful connection
    const subscriberCollection = client.db("ElectricBillGenerator").collection('subescriber');
    const billRateCollection = client.db("ElectricBillGenerator").collection('billRate');
    const billingDataCollection = client.db("ElectricBillGenerator").collection('billingData');
    const billCollection = client.db("ElectricBillGenerator").collection('Bill');

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

     //Post operation-----
     app.post('/subscriber', async(req,res)=>{   // Post Operation to store keeper
        const item=req.body
        const result=subscriberCollection.insertOne(item)
        res.send(result)
      })
      
     app.post('/genBill', async(req,res)=>{   // Post Operation to store keeper
        const item=req.body
        const result=billCollection.insertOne(item)
        res.send(result)
      })

     app.post('/billRate', async(req,res)=>{   // Post Operation to store keeper
        const item=req.body
        const result=billRateCollection.insertOne(item)
        res.send(result)
      })

     app.post('/billingData', async(req,res)=>{   // Post Operation to billingData
        const {q}=req.query
        const filter={ billingMonth: new RegExp(q, 'i') }
        const isBillingMonth= await billingDataCollection.findOne(filter)
        if(isBillingMonth){
          return
        }
        
        const item=req.body
        const result=billingDataCollection.insertOne(item)
        res.send(result)
        console.log('date',isBillingMonth)
      })

      //get operation----
      app.get('/subsfetch', async(req,res)=>{
        const cursor=await billRateCollection.find().toArray() 
        res.send(cursor)
      })

      app.get('/user', async(req,res)=>{
        const cursor=await subscriberCollection.find().sort({ grade: 1 }).toArray() 
        res.send(cursor)
      })

      app.get('/prevMonth', async (req, res) => {
  try {
    const { prevMonth } = req.query;
    console.log("Requested prevMonth:", prevMonth);

    const cursor = await billingDataCollection
      .find({ billingMonth: prevMonth })
      .toArray();

    res.send(cursor);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch previous month data" });
  }
});

      app.get('/bill', async(req,res)=>{
        const cursor=await billingDataCollection.find().toArray() 
        res.send(cursor)
      })

      app.get('/billRateFetch', async(req,res)=>{
        const cursor=await billRateCollection.find().toArray() 
        res.send(cursor)
      })

      
      app.get('/monthly', async(req,res)=>{
        const id = req.query.q
        console.log('bill id', id)
        //const cursor=await billRateCollection.find().toArray() 
        const result = await billingDataCollection.find({ _id: new ObjectId (id) }).toArray()
        res.send(result)
      })

    //   app.get('/monthly', async (req, res) => {
    //     const id = req.query.q;  // Extracting the 'q' query parameter
    //     console.log('bill id', id);
        
    
    //     try {
    //         // Assuming billRateCollection is your MongoDB collection, and you're querying by id
    //         const result = await billingDataCollection.find({ _id: new ObjectId (id) }).toArray();
    //         res.send(result);
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //         res.status(500).send('Error fetching data');
    //     }
    // });

      //Patch operation ------------
    app.patch('/billRateupdate', async(req,res)=>{
      const {q}= req.query
      console.log('idd',q)
      const filter={_id: new ObjectId(q)}
      const option={upsert:true}
      const updatedrate=req.body
      const item={
        $set:{
          stage1:updatedrate?.stage1,
          stage2:updatedrate?.stage2,
          stage3:updatedrate?.stage3,
          stage4:updatedrate?.stage4,
          stage5:updatedrate?.stage5,
          stage6:updatedrate?.stage6,
          stage7:updatedrate?.stage7,
        }
      }
      const result=await billRateCollection.updateOne(filter,item,option)
      res.send(result)
    })
  

  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req,res)=>{
    res.send('Electric bill generator server is running')
})

 app.listen(port, ()=>{
     console.log(`Electric bill generator server is running on port ${port}`)
 })
