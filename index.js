const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const db = admin.firestore();
exports.updateUser = functions.firestore
    .document('users/{uid}')
    .onUpdate((change, context) => {
        console.log("********************Cloud function executed******************************************");
        const newValue = change.after.data();
        const oldValue = change.before.data();
        const uid = newValue.uid;
        const newUsername = newValue.name;
        const oldUsername = oldValue.name;
        const chatCollectionRef = db.collection('chat');
        getChatUserData(uid).then(chatData => {

            chatData.forEach(document => {
                var groupName = document.data()['name'];
                const groupNameArray = groupName.split(",");
                if (document.data()['groups'][0] == uid) {
                    groupName = newUsername.concat(', ', groupNameArray[1]);
                }
                else {
                    groupName = groupNameArray[0].concat(', ', newUsername);
                }
                //updating "chat" collection
                var result = chatCollectionRef.doc(document.id).update({ 'name': groupName });

            });
        });
        return true;
    });

//getting matched records from "chat" collection
async function getChatUserData(uid) {

    const chatCollectionRef = db.collection('chat');
    const chatData = await chatCollectionRef.where('groups', 'array-contains', uid).where('isUserCreatedGroup', '==', true)
        .get();

    return chatData;
}
