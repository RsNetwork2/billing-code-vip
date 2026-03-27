const admin = require('firebase-admin');
const RosApi = require('routeros-client').default;

// ডাটা লোড করার সময় এরর হ্যান্ডলিং
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
  });
  console.log("Firebase Admin SDK Initialized Successfully!");
} catch (e) {
  console.error("Error parsing FIREBASE_CONFIG:", e.message);
  process.exit(1); // ভুল থাকলে অ্যাপ বন্ধ হয়ে যাবে যাতে লগে কারণ দেখা যায়
}

const db = admin.firestore();
// বাকি কোড আগের মতোই থাকবে...

// ২. মাইক্রোটিক কানেকশন (পোর্টসহ আইপি আলাদা করার লজিক)
const hostWithPort = process.env.ROUTER_HOST; // যেমন: 59.152.99.22:7885
const [host, port] = hostWithPort.includes(':') ? hostWithPort.split(':') : [hostWithPort, 8728];

const connection = new RosApi({
    host: host,
    port: parseInt(port),
    user: process.env.ROUTER_USER,
    password: process.env.ROUTER_PASS
});

console.log(`Connecting to MikroTik at ${host}:${port}...`);

// ৩. ফায়ারবেস থেকে ডাটা শোনা (Listening)
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
                console.log(`User ${newUser.username} added successfully to MikroTik!`);
                api.close();
            } catch (err) {
                console.error("MikroTik Connection Error:", err.message);
            }
        }
    });
});
