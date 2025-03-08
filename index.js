require('dotenv').config();
const express = require('express');
const paypal = require('./paypal');
const cors = require('cors');


const app = express();
app.use(cors());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('pay');
});

app.post('/pay', async (req, res) => {
    try {
        const approvalUrl = await paypal.createOrder();
        res.redirect(approvalUrl);
    } catch (error) {
        console.error(error);
        res.redirect('/error');
    }
});

app.get ('/success', async (req, res) => {
    try {
        const { orderId, payerId } = req.query;
        const captureId = await paypal.captureOrder(orderId, payerId);
        res.render('success', { captureId });
    } catch (error) {
        console.error(error);
        res.redirect('/error');
    }
} );


app.get ('/cancel', (req, res) => {
    res.render('cancel');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});