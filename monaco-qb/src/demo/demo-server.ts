import express from 'express';
import * as expressHandlebars from 'express-handlebars';
import {AddressInfo} from 'net';
import path from 'path';
import {version as monacoVersion} from 'monaco-editor/package.json';

const packageRootPath = path.join(__dirname, '..', '..');

const app = express();

app.engine('.hbs', expressHandlebars.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(packageRootPath, 'src', 'demo'));

app.get('/', (req, res) => {
  res.render('demo', {
    layout: false,
    monacoVersion,
  });
});

app.use(express.static(path.join(packageRootPath, 'src', 'demo')));

const server = app.listen(process.env.PORT ?? 3000);
const address = server.address() as AddressInfo;
console.log(`Starting server on http://localhost:${address.port}/`);
