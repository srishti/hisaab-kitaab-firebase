import {v4 as uuidv4} from 'uuid';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const app = express();

enum AccountType {
    Cash = "cash",
    Bank = "bank",
    Wallet = "wallet"
}

function checkNullOrUndefined(obj: any) {
    return obj === null || obj === undefined
}

app.get('/accounts', async (req: any, res: any) => {
    admin.firestore().collection("accounts")
    .get()
    .then((querySnapshot: any) => {
        let result: any[] = [];
        querySnapshot.forEach((doc: any) => {
            result.push(doc.data());
        });
        res.json(result);
    })
    .catch((error: any) => {
        res.status(400).json({success: false});
    });
});

app.post('/accounts/add', async (req: any, res: any) => {
    const data = req.body;

    // check name, type and currentBalance exists and is not empty
    if (!checkNullOrUndefined(data.name) && !checkNullOrUndefined(data.type) && !checkNullOrUndefined(data.currentBalance) && typeof data.name == "string" && typeof data.type == "string" && typeof data.currentBalance === "number" && Object.values(AccountType).includes(data.type)) {
        let id = uuidv4();
        await admin.firestore().collection('accounts').doc(id).set({id: id, name: data.name, type: data.type, currentBalance: data.currentBalance});
        res.json({id: id, name: data.name, type: data.type, currentBalance: data.currentBalance})
    } else {
        res.status(400).json({success: false})
    }
});

app.get('/transactions', async (req: any, res: any) => {
    admin.firestore().collection("transactions")
    .get()
    .then((querySnapshot: any) => {
        let result: any[] = [];
        querySnapshot.forEach((doc: any) => {
            result.push(doc.data());
        });
        res.json(result);
    })
    .catch((error: any) => {
        res.status(400).json({success: false});
    });
});

app.post('/transactions/add', async (req: any, res: any) => {
    const data = req.body;
    //date
    //description
    //from
    //to
    //amount
    if (!checkNullOrUndefined(data.date) && !checkNullOrUndefined(data.description) && !checkNullOrUndefined(data.from) && !checkNullOrUndefined(data.to) && !checkNullOrUndefined(data.amount) && typeof data.date == "number" && typeof data.description == "string" && typeof data.from === "string" && typeof data.to === "string" && typeof data.amount === "number") {
        var fromAccount = await admin.firestore().collection("accounts").doc(data.from).get();
        var toAccount = await admin.firestore().collection("accounts").doc(data.to).get();

        if (!checkNullOrUndefined(fromAccount) && !checkNullOrUndefined(toAccount)) {
            let id = uuidv4();
            let timestamp = Date.now();
            
            var fromRef = await admin.firestore().collection("accounts").doc(data.from);
            var toRef = await admin.firestore().collection("accounts").doc(data.to);

            if (!checkNullOrUndefined(fromRef) && !checkNullOrUndefined(toRef)) {

            }
            const newFromBalance = fromAccount.data().currentBalance - data.amount
            const newToBalance = toAccount.data().currentBalance + data.amount
            await fromRef.update({ currentBalance: newFromBalance })
            await toRef.update({ currentBalance: newToBalance })

            await admin.firestore().collection('transactions').doc(id).set({id: id, createdAt: timestamp, updatedAt: timestamp, date: data.date, description: data.description, from: data.from, to: data.to, amount: data.amount});
            res.json({id: id, createdAt: timestamp, updatedAt: timestamp, date: data.date, description: data.description, from: data.from, to: data.to, amount: data.amount});
        } else {
            res.status(400).json({success: false})
        }
    } else {
        res.status(400).json({success: false})
    }
});

exports.api = functions.https.onRequest(app);
