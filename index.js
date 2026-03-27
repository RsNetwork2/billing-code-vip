const admin = require('firebase-admin');
const { RouterOSClient } = require('routeros-client'); // এখানে পরিবর্তন করা হয়েছে

// ১. ফায়ারবেস ইনিশিয়ালাইজেশন
try {
  if (!process.env.FIREBASE_CONFIG) {
    throw new Error("FIREBASE_CONFIG is missing in Environment Variables");
  }
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

    // এখানে RouterOSClient ব্যবহার করা হয়েছে
    const client = new RouterOSClient({
        host: host,
        port: parseInt(port) || 8728,
        user: process.env.ROUTER_USER,
        password: process.env.ROUTER_PASS,
        timeout: 15
    });

    try {
        console.log(`📡 Connecting to MikroTik at ${host}:${port}...`);
        const api = await client.connect();
        
        await api.write('/ip/hotspot/user/add', [
            '=name=' + newUser.username,
            '=password=' + newUser.password,
            '=profile=' + newUser.package
        ]);
        
        console.log(`✅ User ${newUser.username} added to MikroTik!`);
        await api.close();
    } catch (err) {
        console.error("❌ MikroTik Error:", err.message);
    }
}

// ৩. ফায়ারবেস লিসেনার
console.log("⏳ Waiting for changes in Firestore 'users' collection...");

db.collection('users').onSnapshot(snapshot => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
            const newUser = change.doc.data();
            if (newUser.username && newUser.password) {
                console.log(`🔔 User detected/updated: ${newUser.username}`);
                addMicrotikUser(newUser);
            }
        }
    });
}, err => {
    console.error("❌ Firestore Listen Error:", err.message);
});
