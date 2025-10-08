# Firebase RBAC Demo

A Next.js app that demonstrates Role-Based Access Control (RBAC) with Firebase Authentication custom claims and Firestore Security Rules.

The UI lets any authenticated user read posts. Only users with the `admin` role can create posts. Admin privileges are enforced by Firestore rules (not by client-side checks), so unauthorized writes fail securely.


## Features

- Read posts from Firestore for all users (and guests see login screen)
- Email/Password authentication
- Admin-only create access, enforced via Firestore rules using custom claims
- Minimal, modern UI using Tailwind CSS


## Tech Stack

- Next.js
- Firebase (Auth, Firestore, Admin)
- Tailwind CSS


## How RBAC Works Here

1. Users authenticate with Firebase Auth (Email/Password).
2. An admin role is attached to a user via a custom claim: `request.auth.token.role == 'admin'`.
3. Firestore Security Rules check the claim and allow only admins to write to the `posts` collection. Everyone can read posts.

This app intentionally catches write errors client-side and shows a friendly message if the user lacks permissions.

---

## Prerequisites

- Node.js 18+ and npm
- A Firebase project with:
  - Authentication (Email/Password) enabled
  - Firestore database created


## 1) Create Firebase Project + Enable Auth

1. Go to the Firebase Console → create a project.
2. Add a Web app to obtain your config values.
3. In Authentication → Sign-in method, enable Email/Password.
4. Create at least one test user (email + password) to sign in.


## 2) Configure Firestore Security Rules

Set rules so anyone can read posts, but only admins can write:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {

      // Anyone logged in can read
      allow read: if request.auth != null;

      // Only admins can write
      allow write: if request.auth.token.role == "admin";
    }
  }
}
```

> Publish the rules.

## 3) Set Environment Variables

Create a `.env.local` in the project root with your Firebase Web app config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

These are read in `src/lib/firebase.js` during client initialization.

## 4) Install and Run Locally

```
npm install
npm run dev
```

Open `http://localhost:3000`, sign in with your test user, and try adding a post.

- Non-admins will see an error alert on write due to security rules.
- Admins (with the custom claim) can add posts successfully.

---

## 5) Assign the Admin Role (Custom Claim)

This repo includes a small Node script to set a user’s custom claim using the Firebase Admin SDK.

Files: `firebase-admin-scripts/assignRole.js` and a placeholder for your service account key.

Steps:

1. In the Firebase Console → Project settings → Service accounts → Generate new private key. Save the JSON into `firebase-admin-scripts/` and update the filename in `assignRole.js` if needed.
2. In the same folder, create a `.env` with your target user’s UID:

   ```
   UID=your-firebase-auth-user-uid
   ```

3. From the project root, run:

   ```
   cd firebase-admin-scripts
   npm install
   node assignRole.js
   ```

If successful, it will print something like:

```
Assigned role "admin" to user <UID>
```

Sign the user out and back in on the client so the updated custom claims refresh in the ID token.

> Tip: You can get a user’s UID from Firebase Console → Authentication → Users.

---

## App Structure

- `src/lib/firebase.js`: Initializes Firebase app, exports `auth` and `db`.
- `src/app/page.js`: UI for login/logout, list posts, and add post.
- `firebase-admin-scripts/assignRole.js`: Sets `role: "admin"` claim for a given UID.

---

## Data Model

- Collection: `posts`
  - Document fields: `{ text: string }`

This demo intentionally keeps the schema minimal.

## Troubleshooting

- Write attempts fail even for admin:

  - Ensure the user’s ID token has refreshed after assigning the claim. Sign out/in.
  - Verify Firestore rules are published and include the `request.auth.token.role == 'admin'` check.
  - Confirm `.env.local` is correctly set and the app is pointing to the right Firebase project.

- Cannot sign in:
  - Ensure Email/Password is enabled and the user exists.

---

## Scripts

- `npm run dev`: Start Next.js dev server
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
