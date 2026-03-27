const admin = require('firebase-admin');
const RosApi = require('routeros-client').default;

// ১. ফায়ারবেস অ্যাডমিন সেটআপ (আপনার সার্ভিস অ্যাকাউন্ট কী ব্যবহার করুন)
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// ২. মাইক্রোটিক কানেকশন সেটিংস
const connection = new RosApi({
    host: 'YOUR_ROUTER_IP_OR_DDNS', // আপনার রাউটারের আইপি
    user: 'api_user',
    password: 'password123'
});

console.log("Listening for new users in Firebase...");

// ৩. ফায়ারবেসে নজর রাখা (Real-time Listener)
db.collection('users').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
            const newUser = change.data();
            console.log("Adding to MikroTik:", newUser.username);

            try {
                const api = await connection.connect();
                // মাইক্রোটিকে হটস্পট ইউজার যোগ করার কমান্ড
                await api.write('/ip/hotspot/user/add', [
                    '=name=' + newUser.username,
                    '=password=' + newUser.password,
                    '=profile=' + newUser.package
                ]);
                console.log("Successfully added to MikroTik!");
                api.close();
            } catch (err) {
                console.error("MikroTik Error:", err);
            }
        }
    });
});
