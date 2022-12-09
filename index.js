const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;

const cors = require('cors');

app.use(cors({
    origin : 'http://localhost:3000',
    credentials: true,
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    headers: 'Origin, Pragma, Cache-control, X-Requested-With, Content-Type, Accept, Authorization'
}));

function getClient() {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://testUser:a0BM47G47PeyPuZR@cluster0.km0w9wk.mongodb.net/?retryWrites=true&w=majority";
    return new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
}

app.get('/students', (req, res) => {
    const client = getClient();
    client.connect(async err => {
        const collection = client.db("school_app").collection("students");
        // perform actions on the collection object
        const students = await collection.find().toArray();
        res.send(students);
        client.close();
      });
});

const bodyParser = require('body-parser');

app.post('/students', bodyParser.json(), (req, res) => {
    const newStudent = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthYear: req.body.birthYear,
        grades: []
    }
    const client = getClient();
    client.connect(async err => {
        const collection = client.db("school_app").collection("students");
        const result = await collection.insertOne(newStudent);
        if (!result.insertedId) {
            res.send({error: "insert error"});
            return;
          };
        res.send(newStudent);  
        client.close();
    });
});

function getId(raw) {
    try {
      return new ObjectId(raw);
    } catch (error) {
      return "";
    }
  }

app.get('/students/:id', (req, res) => {
    const id = getId(req.params.id);
    if (!id) {
        res.send({error: "Invalid id"});
        return;
    }
    const client = getClient();
    client.connect(async err => {
        const collection = client.db("school_app").collection("students");
        // perform actions on the collection object
        const student = await collection.findOne({_id: id});
        if (!student) {
            res.send({error: "not found"});
            return;
        }  
        res.send(student);
        client.close();
    });
});

app.put('/students/:id', bodyParser.json(), (req, res) => {
    const updatedStudent = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthYear: req.body.birthYear        
    }
    const id = getId(req.params.id);
    if (!id) {
        res.send({error: "Invalid id"});
        return;
    }
    const client = getClient();
    client.connect(async err => {
        const collection = client.db("school_app").collection("students");
        // perform actions on the collection object
        const result = await collection.findOneAndUpdate({_id: id}, {$set: updatedStudent}, {returnDocument: "after"});
        if (!result.ok) {
            res.send({error: "not found"}).status(404);
            return;
        }  
        res.send(result.value);
        client.close();
    });
});

app.delete('/students/:id', (req, res) => {
    const id = getId(req.params.id);
    if (!id) {
        res.send({error: "Invalid id"});
        return;
    }
    const client = getClient();
    client.connect(async err => {
        const collection = client.db("school_app").collection("students");
        // perform actions on the collection object
        const result = await collection.deleteOne({_id: id});
        if (!result.deletedCount) {
            res.send({error: "not found"});
            return;
        }  
        res.send({id: req.params.id});
        client.close();
    });
});

app.post('/grades', bodyParser.json(), (req, res) => {
    const newGrade = req.body.grade;
    const id = getId(req.body.studentId);
    if (!id) {
        res.send({error: "Invalid id"});
        return;
    }
    const client = getClient();
    client.connect(async err => {
        const collection = client.db("school_app").collection("students");
        // perform actions on the collection object
        const result = await collection.findOneAndUpdate({_id: id}, {$push: {grades: newGrade}}, {returnDocument: "after"});
        if (!result.ok) {
            res.send({error: "not found"});
            return;
        }  
        res.send(result.value);
        client.close();
    });

});


app.listen(9000);
