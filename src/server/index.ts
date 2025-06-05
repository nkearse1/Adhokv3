import express from 'express';
import talentSignupRouter from './api/talent/signup';

const app = express();
const port = 3001;

app.use(express.json());
app.use('/api', talentSignupRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});