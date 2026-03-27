const admin = require('firebase-admin');
const RosApi = require('routeros-client').default;

// ১. পরিবেশ ভেরিয়েবল থেকে ফায়ারবেস কনফিগারেশন নেওয়া
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

const db = admin.firestore();

// ২. মাইক্রোটিক কানেকশন সেটিংস (রেলওয়ে ভেরিয়েবল থেকে)
const connection = new RosApi({
    host: process.env.ROUTER_HOST,
    user: process.env.ROUTER_USER,
    password: process.env.ROUTER_PASS
});

console.log("Listening for new users in Firebase...");

db.collection('users').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
            const newUser = change.data();
            try {
                const api = await connection.connect();
                await api.write('/ip/hotspot/user/add', [
                    '=name=' + newUser.username,
                    '=password=' + newUser.password,
                    '=profile=' + newUser.package
                ]);
                console.log(`User ${newUser.username} added successfully!`);
                api.close();
            } catch (err) {
                console.error("MikroTik Error:", err);
            }
        }
    });
});
