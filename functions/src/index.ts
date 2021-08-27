import {v4 as uuidv4} from 'uuid';
const fetch = require("node-fetch");

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: "hisaab-kitaab-832bd" });

const express = require('express');
const app = express();
const cors = require('cors')({origin: true});
app.use(cors);

enum AccountType {
    Cash = "cash",
    Bank = "bank",
    Wallet = "wallet"
}

function checkNullOrUndefined(obj: any) {
    return obj === null || obj === undefined
}

function checkAuth(idToken: string, res: any, callback: any) {
    if (checkNullOrUndefined(idToken)) {
        res.status(401).json({success: false});
        return;
    }
    admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken: any) {
        var uid = decodedToken.uid;
        callback(uid);
    }).catch(function(error: any) {
        console.log(error);
        res.status(401).json({success: false});
    });
}

async function createAccountHolder(requestBody: any) {
    var myHeaders = {
        "X-Zeta-AuthToken": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidGFnIjoiczlxc2xJV2J5XzE5VWl4b05ObUp0USIsImFsZyI6IkExMjhHQ01LVyIsIml2IjoiZ2NROEZkdjFtVkVIY1BaRCJ9.T1fEtgMYlDo4ZE6JttD7kjDWtpTWDcrpU6yq1TmtWo4.n24aFI4mufAJwYPgNwn-fA.is6R9543WUU-lzK2aQ3fUsdknGsvChnM3YquN6X5RObz841smNVpYyYtmeZyxTKgLzFvZd4QjOklMUCLOgEV7jp3JtiQhg4Txf2eS2caHAyKz2_RT7sb8aXPI_8OLZ1meo5QV5ZpL-ITgJdmjutReCiQ8xSAr6ygfQphuyWpCix4MMwfv470uwBTeYeuWTTBtLOXp0Voj-oK9XaUWN55mSVUFjywEuaI_j30z68gzCfehWxBmZ9t8tvdzkgfF-XhXC5sCcUDiGRUokIo3I-ly_qe-0BPDyNWeU_7H7miKmFSXNsKLJhDiyol3KaWVjsYrK4tuMqKafOhucsGqmFJ_vSLiU0lKJI45tgSKC3Xl4yo-4k7WAZpKqRp86vhl-pC4dBe9jOl17hLIGI3O4_8NA.xFAS5di_kjSXA28d19yQDQ",
        "Content-Type": "application/json"
    };

    let id = uuidv4();
    var raw = JSON.stringify({
        "ifiID": "140793",
        "formID": id,
        "applicationType": "CREATE_ACCOUNT_HOLDER",
        "spoolID": id,
        "individualType": "REAL",
        "salutation": "",
        "firstName": requestBody.firstName,
        "middleName": "",
        "lastName": requestBody.lastName,
        "profilePicURL": "",
        "dob": {
            "year": requestBody.dateOfBirth.year,
            "month": requestBody.dateOfBirth.month,
            "day": requestBody.dateOfBirth.day
        },
        "gender": "",
        "mothersMaidenName": "",
        "kycDetails": {
            "kycStatus": "MINIMAL",
            "kycStatusPostExpiry": "KYC_EXPIRED",
            "kycAttributes": {},
            "authData": {
            "PAN": requestBody.pan
            },
            "authType": "PAN"
        },
        "vectors": [
            {
            "type": "p",
            "value": "+91" + requestBody.phoneNumber,
            "isVerified": true
            }
        ],
        "pops": [],
        "customFields": {
            "entity_id": "ABCD0005"
        }
    });

    var requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    const response = await fetch("https://fusion.preprod.zeta.in/api/v1/ifi/140793/applications/newIndividual", requestOptions);
    return response.json();
}

async function createBankAccount(accountHolderID: string, phoneNumber: string) {
    var myHeaders = {
        "X-Zeta-AuthToken": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidGFnIjoiczlxc2xJV2J5XzE5VWl4b05ObUp0USIsImFsZyI6IkExMjhHQ01LVyIsIml2IjoiZ2NROEZkdjFtVkVIY1BaRCJ9.T1fEtgMYlDo4ZE6JttD7kjDWtpTWDcrpU6yq1TmtWo4.n24aFI4mufAJwYPgNwn-fA.is6R9543WUU-lzK2aQ3fUsdknGsvChnM3YquN6X5RObz841smNVpYyYtmeZyxTKgLzFvZd4QjOklMUCLOgEV7jp3JtiQhg4Txf2eS2caHAyKz2_RT7sb8aXPI_8OLZ1meo5QV5ZpL-ITgJdmjutReCiQ8xSAr6ygfQphuyWpCix4MMwfv470uwBTeYeuWTTBtLOXp0Voj-oK9XaUWN55mSVUFjywEuaI_j30z68gzCfehWxBmZ9t8tvdzkgfF-XhXC5sCcUDiGRUokIo3I-ly_qe-0BPDyNWeU_7H7miKmFSXNsKLJhDiyol3KaWVjsYrK4tuMqKafOhucsGqmFJ_vSLiU0lKJI45tgSKC3Xl4yo-4k7WAZpKqRp86vhl-pC4dBe9jOl17hLIGI3O4_8NA.xFAS5di_kjSXA28d19yQDQ",
        "Content-Type": "application/json"
    };

    let id = uuidv4();
    var raw = JSON.stringify({
        "accountHolderID": accountHolderID,
        "name": "Testuser" + id,
        "phoneNumber": "+91" + phoneNumber
    });

    var requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    const response = await fetch("https://fusion.preprod.zeta.in/api/v1/ifi/140793/bundles/fb0cc2ba-3c9a-4f76-ae0e-b2e2fddf62f4/issueBundle", requestOptions)
    return response.json();
}

async function getBankTransactions(accountId: string) {
    var myHeaders = {
        "X-Zeta-AuthToken": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidGFnIjoiczlxc2xJV2J5XzE5VWl4b05ObUp0USIsImFsZyI6IkExMjhHQ01LVyIsIml2IjoiZ2NROEZkdjFtVkVIY1BaRCJ9.T1fEtgMYlDo4ZE6JttD7kjDWtpTWDcrpU6yq1TmtWo4.n24aFI4mufAJwYPgNwn-fA.is6R9543WUU-lzK2aQ3fUsdknGsvChnM3YquN6X5RObz841smNVpYyYtmeZyxTKgLzFvZd4QjOklMUCLOgEV7jp3JtiQhg4Txf2eS2caHAyKz2_RT7sb8aXPI_8OLZ1meo5QV5ZpL-ITgJdmjutReCiQ8xSAr6ygfQphuyWpCix4MMwfv470uwBTeYeuWTTBtLOXp0Voj-oK9XaUWN55mSVUFjywEuaI_j30z68gzCfehWxBmZ9t8tvdzkgfF-XhXC5sCcUDiGRUokIo3I-ly_qe-0BPDyNWeU_7H7miKmFSXNsKLJhDiyol3KaWVjsYrK4tuMqKafOhucsGqmFJ_vSLiU0lKJI45tgSKC3Xl4yo-4k7WAZpKqRp86vhl-pC4dBe9jOl17hLIGI3O4_8NA.xFAS5di_kjSXA28d19yQDQ",
        "Content-Type": "application/json"
    };
    
    var requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    const response = await fetch(`https://fusion.preprod.zeta.in/api/v1/ifi/140793/accounts/${accountId}/transactions?pageSize=50&pageNumber=1`, requestOptions);
    return response.json();
}

/*
Bank Account Model

- accountHolderId
- accountId

*/

app.post('/bankaccounts/create', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, async (userId: any) => {
        const data = req.body;
        // create account holder
        const accountHolderResponse = await createAccountHolder(data);
        console.log(accountHolderResponse);
        // check if account holder response is 200 and gave approved as status then proceed with issue bundle call
        if (checkNullOrUndefined(accountHolderResponse.individualID) || checkNullOrUndefined(accountHolderResponse.status) || accountHolderResponse.status != 'APPROVED') {
            res.status(500).json({success: false});
            return;
        }
        // save account holder data in db
        // create bank account and payment instruments
        const bankAccountResponse = await createBankAccount(accountHolderResponse.individualID, data.phoneNumber);
        console.log(bankAccountResponse);
        // check if bank account response is 200 and both account and payment instruments are issued
        // only one account is allowed per account holder id
        if (checkNullOrUndefined(bankAccountResponse.accounts) || bankAccountResponse.accounts.length == 0) {
            res.status(500).json({success: false});
            return;
        }

        let id = uuidv4();
        await admin.firestore().collection(userId).doc(userId).collection('bankaccounts').doc(id).set({
            accountHolderId: bankAccountResponse.accounts[0].accountHolderID,
            accountId: bankAccountResponse.accounts[0].accountID
        });
        // save bank account data in db
        // get data to create bank account
        res.json({
            accountHolderId: bankAccountResponse.accounts[0].accountHolderID,
            accountId: bankAccountResponse.accounts[0].accountID
        });
    });
});

app.get('/bankaccounts', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, async (userId: any) => {
        admin.firestore().collection(userId).doc(userId).collection("bankaccounts")
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
});

app.get('/accounts/linked', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, async (userId: any) => {
        admin.firestore().collection(userId).doc(userId).collection("linkedAccount")
        .get()
        .then((querySnapshot: any) => {
            if (querySnapshot.docs.length == 0) {
                res.json({linkedAccountId: ""});
                return;
            }
            res.json(querySnapshot.docs[0].data());
            return;
        })
        .catch((error: any) => {
            res.status(400).json({success: false});
        });
    });
});

app.get('/banktransactions/reconcile', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, async (userId: any) => {
        var linkedAccount = await admin.firestore().collection(userId).doc(userId).collection("linkedAccount").get();
        const linkedAccountId = linkedAccount.docs[0].data().linkedAccountId;
        // make fusion api call to get all transactions from a particular point in time
        var bankAccountDocs = await admin.firestore().collection(userId).doc(userId).collection('bankaccounts').get();
        if (bankAccountDocs.docs.length <= 0) {
            res.json([]);
            return;
        }

        const bankAccount = bankAccountDocs.docs[0].data();
        const bankTransactionsResponse = await getBankTransactions(bankAccount.accountId);
        // console.log(bankTransactionsResponse);
        if (!checkNullOrUndefined(bankTransactionsResponse.accountTransactionList)) {
            bankTransactionsResponse.accountTransactionList.forEach(async (bankTransaction: any) => {
                // save each transaction in DB
                await admin.firestore().collection(userId).doc(userId).collection('banktransactions').doc(bankTransaction.transactionID).set({id: bankTransaction.transactionID, recordType: bankTransaction.recordType, transactionAmount: bankTransaction.amount, timestamp: bankTransaction.timestamp, remarks: bankTransaction.remarks, reconciledLocalTransactionId: ""});
            });
        }
        // do matching criteria
        const localToAccountTransactions = admin.firestore().collection(userId).doc(userId).collection("transactions").where("toAccount.id", "==", linkedAccountId).where("reconciledBankTransactionId", "==", "").get();
        const localFromAccountTransactions = admin.firestore().collection(userId).doc(userId).collection("transactions").where("fromAccount.id", "==", linkedAccountId).where("reconciledBankTransactionId", "==", "").get();

        const [localToAccountTransactionsSnapshot, localFromAccountTransactionsSnapshot] = await Promise.all([localToAccountTransactions, localFromAccountTransactions]);

        const localTransactions = localToAccountTransactionsSnapshot.docs.concat(localFromAccountTransactionsSnapshot.docs);
        // console.log(localTransactions);
        const bankTransactions = await admin.firestore().collection(userId).doc(userId).collection('banktransactions').where("reconciledLocalTransactionId", "==", "").get();
        // console.log('bank transactions', bankTransactions.docs);
        let result: any[] = [];
        bankTransactions.docs.forEach((bankTransactionSnapshot: any) => {
            const bankTransaction = bankTransactionSnapshot.data();
            const bankTransactionDate = new Date(bankTransaction.timestamp);
            let localTransactionsTentative: any[] = [];
            let added = false;
            localTransactions.forEach((localTransactionSnapshot: any) => {
                const localTransaction = localTransactionSnapshot.data();
                const localTransactionDate = new Date(localTransaction.date);
                if ((localTransaction.amount === bankTransaction.transactionAmount) && (localTransactionDate.getDate() == bankTransactionDate.getDate()) && (localTransactionDate.getMonth() == bankTransactionDate.getMonth()) && (localTransactionDate.getFullYear() == bankTransactionDate.getFullYear())) {
                    localTransactionsTentative.push(localTransaction);
                    let currentBankTransaction = {...bankTransaction};
                    currentBankTransaction.localTransaction = localTransaction;
                    result.push(currentBankTransaction);
                    added = true;
                }
            });
            if (!added) {
                bankTransaction.localTransaction = null;
                result.push(bankTransaction);
            }
            // bankTransaction.localTransactions = localTransactionsTentative;
            // result.push(bankTransaction);
        });
        res.json(result);
    });
});

app.post('/banktransactions/reconcile/confirm', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, async (userId: any) => {
        const data = req.body;
        const bankTransactionId = data.bankTransactionId;
        const localTransactionId = data.localTransactionId;

        await admin.firestore().collection(userId).doc(userId).collection("banktransactions").doc(bankTransactionId).update({reconciledLocalTransactionId: localTransactionId});
        await admin.firestore().collection(userId).doc(userId).collection("transactions").doc(localTransactionId).update({reconciledBankTransactionId: bankTransactionId});

        res.json({success: true});
    });
});

app.post('/accounts/link', async (req: any, res: any) => {
    console.log(req.headers["x-auth-token"]);
    const data = JSON.parse(req.body);
    const accountIdToLink = data["accountId"];
    checkAuth(req.headers["x-auth-token"], res, async (userId: any) => {
        admin.firestore().collection(userId).doc(userId).collection('linkedAccount').doc('linkedAccount').set({linkedAccountId: accountIdToLink})
        .then((doc: any) => {
            res.json({success: true});
        })
        .catch((error: any) => {
            console.log(error);
            res.status(400).json({success: false});
        });
    });
});

app.get('/accounts', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, (userId: any) => {
        admin.firestore().collection(userId).doc(userId).collection("accounts")
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
});

app.post('/accounts/add', async (req: any, res: any) => {
    const data = req.body;
    checkAuth (req.headers["x-auth-token"], res, async (userId: any) => {
        // check name, type and currentBalance exists and is not empty
        if (!checkNullOrUndefined(data.name) && !checkNullOrUndefined(data.type) && !checkNullOrUndefined(data.currentBalance) && typeof data.name == "string" && typeof data.type == "string" && typeof data.currentBalance === "number" && Object.values(AccountType).includes(data.type)) {
            let id = uuidv4();
            await admin.firestore().collection(userId).doc(userId).collection('accounts').doc(id).set({id: id, name: data.name, type: data.type, currentBalance: data.currentBalance});
            res.json({id: id, name: data.name, type: data.type, currentBalance: data.currentBalance})
        } else {
            res.status(400).json({success: false})
        }
    });
});

app.get('/transactions', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, (userId: any) => {
        admin.firestore().collection(userId).doc(userId).collection("transactions")
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
});

app.post('/transactions/add', async (req: any, res: any) => {
    checkAuth(req.headers["x-auth-token"], res, async (userId: any) => {
        const data = req.body;
        if (!checkNullOrUndefined(data.date) && !checkNullOrUndefined(data.description) && !checkNullOrUndefined(data.fromAccount) && !checkNullOrUndefined(data.toAccount) && !checkNullOrUndefined(data.amount) && typeof data.date == "number" && typeof data.description == "string" && typeof data.fromAccount === "string" && typeof data.toAccount === "string" && typeof data.amount === "number") {
            var fromAccount = await admin.firestore().collection(userId).doc(userId).collection("accounts").doc(data.fromAccount).get();
            var toAccount = await admin.firestore().collection(userId).doc(userId).collection("accounts").doc(data.toAccount).get();

            if (!checkNullOrUndefined(fromAccount) && !checkNullOrUndefined(toAccount)) {
                let id = uuidv4();
                let timestamp = Date.now();
                
                var fromRef = await admin.firestore().collection(userId).doc(userId).collection("accounts").doc(data.fromAccount);
                var toRef = await admin.firestore().collection(userId).doc(userId).collection("accounts").doc(data.toAccount);

                if (!checkNullOrUndefined(fromRef) && !checkNullOrUndefined(toRef)) {
                    const newFromBalance = fromAccount.data().currentBalance - data.amount
                    const newToBalance = toAccount.data().currentBalance + data.amount
                    await fromRef.update({ currentBalance: newFromBalance })
                    await toRef.update({ currentBalance: newToBalance })

                    await admin.firestore().collection(userId).doc(userId).collection('transactions').doc(id).set({id: id, createdAt: timestamp, updatedAt: timestamp, date: data.date, description: data.description, fromAccount: {id: data.fromAccount, name: fromAccount.data().name}, toAccount: {id: data.toAccount, name: toAccount.data().name}, amount: data.amount, reconciledBankTransactionId: ''});
                    res.json({id: id, createdAt: timestamp, updatedAt: timestamp, date: data.date, description: data.description, fromAccount: {id: data.fromAccount, name: fromAccount.data().name}, toAccount: {id: data.toAccount, name: toAccount.data().name}, amount: data.amount, reconciledBankTransactionId: false});
                } else {
                    res.status(400).json({success: false})
                }
            } else {
                res.status(400).json({success: false})
            }
        } else {
            res.status(400).json({success: false})
        }
    });
});

exports.api = functions.https.onRequest(app);
