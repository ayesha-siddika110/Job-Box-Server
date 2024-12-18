const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.nef3v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const database = client.db("Job-BoxDB")
        const jobsCollections = database.collection("jobboxDB")
        const jobsApplyCollections = client.db("Job-BoxDB").collection("applyjob")

        app.get('/jobs', async(req,res)=>{
            const email = req.query.email;
            let query = {};
            if(email){
                query = {hr_email: email}
            }
            const cursor = jobsCollections.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/jobs/:id', async(req,res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await jobsCollections.findOne(query);
            res.send(result)
        })

        app.post('/jobs', async(req,res)=>{
            const newJob = req.body;
            const result = await jobsCollections.insertOne(newJob)
            res.send(result)
        })

        // app.get('/jobapply',async(req,res)=>{
        //     const cursor = req.body
        //     const result = await jobsApplyCollections.find(cursor).toArray()
        //     res.send(result)
        // })
        // email diye data get

        app.get('/jobapply', async(req,res)=>{
            const email = req.query.email;
            const query = {applicant_email : email}
            const result = await jobsApplyCollections.find(query).toArray()

            for(const application of result){
                const query1 = {_id : new ObjectId(application.job_id)}
                const job = await jobsCollections.findOne(query1)

                if(job){
                    application.title = job.title;
                    application.company = job.company;
                    application.location = job.location
                }
            }
            res.send(result)
        })
        app.get('/jobapply/jobs/:job_id',async(req,res)=>{
            const jobId = req.params.job_id
            const query = {job_id: jobId}
            const result = await jobsApplyCollections.find(query).toArray()
            res.send(result)
        })

        app.post('/jobapply', async(req,res)=>{
            const applyNew = req.body;
            const result = await jobsApplyCollections.insertOne(applyNew)
            res.send(result)
        })

        app.patch('/jobapply/:id',async(req,res)=>{
            const id = req.params.id;
            const data = req.body;
            const filter = {_id: new ObjectId(id)}
            const UpdateStatus ={
                $set :{
                    status: data.status
                }
            }
            const result = await jobsApplyCollections.updateOne(filter, UpdateStatus)
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
    res.send('jobs are falling in the sky')
})
app.listen(port, () => {
    console.log(`Jobs server is running in port : ${port}`);

})