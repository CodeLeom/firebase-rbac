"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function Page() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await loadPosts();
      else setPosts([]);
    });
    return () => unsubscribe();
  }, []);

  const loadPosts = async () => {
    const snapshot = await getDocs(collection(db, "posts"));
    setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in!");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login failed:", error.message);
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleAddPost = async () => {
    try {
      await addDoc(collection(db, "posts"), { text: newPost });
      setNewPost("");
      await loadPosts();
      alert("New Post added!");
    } catch (e) {
      alert("Opps!! Only admins can add posts.");
      console.error(e.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-indigo-400">
          Firebase RBAC Demo (Next.js)
        </h1>

        {/* Login Form */}
        {!user ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-medium text-white"
            >
              Login
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <p className="text-gray-300 mb-2">
                Logged in as{" "}
                <span className="font-semibold text-indigo-400">
                  {user.email}
                </span>
              </p>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 underline"
              >
                Logout
              </button>
            </div>

            <section className="border-t border-gray-700 pt-4">
              <h2 className="text-lg font-semibold text-indigo-300 mb-3">
                Posts
              </h2>

              {posts.length > 0 ? (
                <ul className="space-y-2">
                  {posts.map((p) => (
                    <li
                      key={p.id}
                      className="bg-gray-700 rounded-md px-3 py-2 text-gray-200"
                    >
                      {p.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">No posts yet.</p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <input
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="New post"
                  className="flex-1 px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleAddPost}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition font-medium text-white"
                >
                  Add
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      <footer className="mt-8 text-gray-500 text-sm">
        Built with Next.js + Firebase | &copy; FreeCodeCamp 2025
      </footer>
    </main>
  );
}