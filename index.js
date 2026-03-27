const admin = require('firebase-admin');
const { RouterOSClient } = require('routeros-client');

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
        
        // নতুন লাইব্রেরিতে 'api.menu' ব্যবহার করে ইউজার অ্যাড করা হয়
        const menu = api.menu('/ip/hotspot/user');
        
        await menu.add({
            name: newUser.username,
            password: newUser.password,
            profile: newUser.package
        });
        
        console.log(`✅ User ${newUser.username} added to MikroTik!`);
        await api.close();
    } catch (err) {
        // যদি ইউজার আগে থেকেই থাকে, তবে এরর না দেখিয়ে কনসোলে জানাবে
        if (err.message.includes("already has")) {
            console.log(`ℹ️ User ${newUser.username} already exists on MikroTik.`);
        } else {
            console.error("❌ MikroTik Error:", err.message);
        }
    }
}

// ৩. ফায়ারবেস লিসেনার
console.log("⏳ Waiting for changes in Firestore 'users' collection...");

db.collection('users').onSnapshot(snapshot => {
    snapshot.docChanges().forEach((change) => {
        // শুধুমাত্র নতুন ডাটা যোগ হলে বা আপডেট হলে মাইক্রোটিকে পাঠাবে
        if (change.type === 'added' || change.type === 'modified') {
            const newUser = change.doc.data();
            
            // ফায়ারবেসের ফিল্ডগুলোর নাম (username, password, package) সঠিক আছে কি না চেক করে
            if (newUser.username && newUser.password) {
                console.log(`🔔 User detected/updated: ${newUser.username}`);
                addMicrotikUser(newUser);
            }
        }
    });
}, err => {
    console.error("❌ Firestore Listen Error:", err.message);
});
