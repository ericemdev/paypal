require('dotenv').config();
const axios = require('axios');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

async function generateAccessToken() {
    try {
        const response = await axios({
            url: `${PAYPAL_API}/v1/oauth2/token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
            },
            data: 'grant_type=client_credentials'
        });

        console.log("Access Token Generated:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error("Failed to fetch access token:", error.response ? error.response.data : error.message);
        throw new Error("Could not generate access token");
    }
}


exports.createOrder = async function () {
    try {
        const accessToken = await generateAccessToken();

        const response = await axios({
            url: `${PAYPAL_API}/v2/checkout/orders`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            data: {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: '10.00'
                        }
                    }
                ]
            }
        });

        console.log("Order Created:", response.data);
        return response.data.links.find(link => link.rel === 'approve').href;
    } catch (error) {
        console.error("Failed to create order:", error.response ? error.response.data : error.message);
        throw new Error("Could not create PayPal order");
    }
};


exports.captureOrder = async function (orderId) {
    try {
        const accessToken = await generateAccessToken();

        const response = await axios({
            url: `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log("captured:", response.data);
        return response.data.id;
    } catch (error) {
        console.error("F:", error.response ? error.response.data : error.message);
        throw new Error("Could not capture PayPal order");
    }
};
