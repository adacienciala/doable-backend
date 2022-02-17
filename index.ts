import {Db, MongoClient} from 'mongodb'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

async function connectToDb(): Promise<{
  db: Db | undefined;
  err: unknown | undefined;
}> {
  try {
    const client = await MongoClient.connect(`mongodb+srv://Lemon:${process.env.MONGO_PASS}@doable.fqkto.mongodb.net/doable?retryWrites=true&w=majority`); // , { useNewUrlParser: true }
    return { db: client.db("doable"), err: undefined}
  } catch(e) {
    return { db: undefined, err: e}
  }
}

(async () => {
  const { err, db } = await connectToDb();
  
  if (err) throw err;
  
  const app = express();
  app.use(express.json());
  
  app.get('/', (req, res) => {
    res.send('hey babe');
  });
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
  });
  
})();