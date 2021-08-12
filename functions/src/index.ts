import {v4 as uuidv4} from 'uuid';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req: any, res: any) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages').add({original: original});
  // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
    .onCreate((snap: any, context: any) => {
      // Grab the current value of what was written to Firestore.
      const original = snap.data().original;

      // Access the parameter `{documentId}` with `context.params`
      functions.logger.log('Uppercasing', context.params.documentId, original);
      
      const uppercase = original.toUpperCase();
      
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to Firestore.
      // Setting an 'uppercase' field in Firestore document returns a Promise.
      return snap.ref.set({uppercase}, {merge: true});
    });

enum AccountType {
    Cash = "cash",
    Bank = "bank",
    Wallet = "wallet"
}

// interface Account {
//     name: string;
//     type: AccountType;
//     currentBalance: number;
// }

function checkNullOrUndefined(obj: any) {
    return obj === null || obj === undefined
}

exports.addAccount = functions.https.onRequest(async (req: any, res: any) => {
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

exports.getAccounts = functions.https.onRequest(async (req: any, res: any) => {
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

exports.addTransaction = functions.https.onRequest(async (req: any, res: any) => {
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

exports.getTransactions = functions.https.onRequest(async (req: any, res: any) => {
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