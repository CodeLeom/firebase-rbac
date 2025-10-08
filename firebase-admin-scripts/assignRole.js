const admin = require("firebase-admin");
require("dotenv").config();


// Load your service account key JSON
const serviceAccount = require("./fir-rbac-4s2x-firebase-adminsdk-fbsvc-b1c53c8fd8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setUserRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`Assigned role "${role}" to user ${uid}`);
  process.exit(0);
}

// Replace with the Firebase Auth UID of your user, I added mine to env
setUserRole(process.env.UID, "admin");