import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// Prevent cors issue
const cors = require('cors')({origin: true});

var axios = require('axios');
// import axios from "axios";
admin.initializeApp();

exports.getValidatorInfo = functions.https.onRequest(async (req, res) => {
    cors(req, res, () => {
        const { network,order, limit = 100 } = req.query;

        var config = {
            method: 'get',
            url: `https://www.validators.app/api/v1/validators/${network}.json?order=${order}&limit=${limit}`,
            headers: {
                'token': 'qbHoX1pJdtgXYTXiT7HEVaEU'
            }
        };

        return axios(config)
            .then(function (response: any) {
                res.json(response.data);
            })
            .catch(function (error: any) {
                res.json(error);
            });
    })
    // Send back a message that we've successfully written the message
});
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
