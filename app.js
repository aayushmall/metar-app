const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');
const response = require('./src/helpers/response');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes(app);

app.get('/', (req, res) => res.send("Metar API Services"));

app.use(response.success);
app.use(response.error);

// eslint-disable-next-line no-console
app.listen(config.PORT, () => console.info(`Metar API Services listening on port ${config.PORT}!`));
