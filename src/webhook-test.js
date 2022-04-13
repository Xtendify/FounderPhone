// For ES6 support, see https://medium.freecodecamp.org/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
	console.log(req.body);
	return res.sendStatus(200);
});
app.set('port', '3002');

app.listen('3002', () => {
	console.log(`Example app listening at http://localhost:3002`);
});

export default app;
