const admin = require('firebase-admin');
const RosApi = require('routeros-client').default;

// ১. ফায়ারবেস ইনিশিয়ালাইজেশন
try {
  const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
  });
  console.log("✅ Firebase connected successfully!");
} catch (e) {
  console.error("❌ Firebase Config Error:", e.message);
  process.exit(1);
}

const db = admin.firestore();

// ২. মাইক্রোটিক কানেকশন ফাংশন
async function addMicrotikUser(newUser) {
    const hostWithPort = process.env.ROUTER_HOST || "";
    const [host, port] = hostWithPort.includes(':') ? hostWithPort.split(':') : [hostWithPort, 8728];

    const connection = new RosApi({
        host: host,
        port: parseInt(port) || 8728,
        user: process.env.ROUTER_USER,
        password: process.env.ROUTER_PASS,
        timeout: 10 // ১০ সেকেন্ড পর টাইমআউট হবে
    });

    try {
        console.log(`📡 Connecting to MikroTik at ${host}:${port}...`);
        const api = await connection.connect();
        await api.write('/ip/hotspot/user/add', [
            '=name=' + newUser.username,
            '=password=' + newUser.password,
            '=profile=' + newUser.package
        ]);
        console.log(`✅ User ${newUser.username} added to MikroTik!`);
        api.close();
    } catch (err) {
        console.error("❌ MikroTik Error:", err.message);
    }
}

// ৩. ফায়ারবেস লিসেনার
console.log("⏳ Waiting for new users in Firestore...");
db.collection('users').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const newUser = change.data();
            console.log(`🔔 New user detected: ${newUser.username}`);
            addMicrotikUser(newUser);
        }
    });
}, err => {
    console.error("❌ Firestore Listen Error:", err.message);
});
