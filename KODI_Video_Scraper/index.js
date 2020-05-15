let cors = require('cors');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let methodOverride = require('method-override');
let express = require('express');
let videoResolver = require('./video_resolver');


let app = express();
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-type,Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', (req, res) => {
    return res.send('Access Denied!');
});

app.post('/', (req, res) => {
    return res.send('Access Denied');
});

app.post('/get_playable_url', async (req, res) => {
    let server_type = req.body.server_type;
    let html_page = req.body.html_page;

    let resolved_url = '';
    if (server_type === 'mixdrop') {
        resolved_url = await videoResolver.ResolveMixdrop(html_page);
    } else if (server_type === 'uptostream') {
        resolved_url = await videoResolver.ResolveUptostream(html_page);
    }else if (server_type === 'streamz.cc') {
        resolved_url = await videoResolver.ResolveStreamzCC(html_page);
    }
    if (resolved_url === '')
        return res.send({'status': 'failed', 'data': resolved_url});
    else
        return res.send({'status': 'success', 'data': resolved_url});
});

app.listen(7777, () =>
    console.log(`Example app listening on port 7777!`),
);