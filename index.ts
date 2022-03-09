import {Db, MongoClient} from 'mongodb'
import express from 'express'
import dotenv from 'dotenv'
import * as emailValidator from 'email-validator'
import * as bcrypt from 'bcrypt'
import * as hash from 'password-hash'
import cors from 'cors'
import { uuidv4} from 'uuid'

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
  
  if (err || !db) throw err;
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/', (req, res) => {
    res.send('hey babe');
  });

  app.post('/login', async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.json({
        success: false,
        msg: 'incomplete query'
      });
    }
    if (!emailValidator.validate(req.body.email)) {
      return res.json({
        success: false,
        msg: 'invalid email address'
      });
    }
    const user = await db.collection('accounts').findOne({email: req.body.email});
    if (!user) {
      return res.json({
        success: false,
        msg: 'incorrect email'
      });
    }
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.json({
        success: false,
        msg: 'incorrect password'
      });
    }
    const token = uuidv4();
    const tokenSelector = uuidv4();
    const hashedToken = hash.generate(token);
    await db.collection('accounts').updateOne({_id: user._id}, {$set: {
      token: hashedToken,
      tokenTimestamp: Date.now(),
      tokenSelector: tokenSelector
    }})
    res.json({token: token, selector: tokenSelector});
  });
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
  });
  
})();