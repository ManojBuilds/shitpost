export const fakeGitDiff = `
diff --git a/components/WaitlistForm.tsx b/components/WaitlistForm.tsx
index a1b2c3d..e4f5g6h 100644
--- a/components/WaitlistForm.tsx
+++ b/components/WaitlistForm.tsx
@@ -12,7 +12,10 @@
 const WaitlistForm = () => {
-  const [email, setEmail] = useState('');
+  const [email, setEmail] = useState('');
+  const [error, setError] = useState('');

   const handleSubmit = async (e) => {
     e.preventDefault();
-    await submitToHeysheet(email);
+    if (!email.includes('@')) {
+      setError("Please enter a valid email.");
+      return;
+    }
+    await submitToHeysheet(email);
   };

   return (
     <form onSubmit={handleSubmit}>
       <input
         type="email"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         placeholder="Enter your email"
       />
+      {error && <p className="text-red-500">{error}</p>}
       <button type="submit">Join Waitlist</button>
     </form>
   );
 };
`;
