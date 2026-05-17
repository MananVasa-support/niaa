// auth.js — Firebase auth logic.
// Include AFTER firebase-app-compat, firebase-auth-compat, auth-config.js
(function () {
  if (!window.AUTH_CONFIG) {
    console.error("auth.js: window.AUTH_CONFIG missing. Include auth-config.js first.");
    return;
  }
  if (typeof firebase === "undefined") {
    console.error("auth.js: Firebase SDK missing.");
    return;
  }

  // Initialize only once
  if (!firebase.apps.length) firebase.initializeApp(window.AUTH_CONFIG);
  var auth = firebase.auth();

  async function signIn(email, password, keepSignedIn) {
    var persistence = keepSignedIn
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;
    await auth.setPersistence(persistence);
    var cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  }

  async function signOut() { await auth.signOut(); }

  function guardPage(options) {
    var redirectTo = (options && options.redirectTo) || "niaalogin.html";
    auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.replace(redirectTo);
      } else {
        document.documentElement.style.visibility = "visible";
      }
    });
  }

  function redirectIfSignedIn(target) {
    auth.onAuthStateChanged(function (user) {
      if (user) window.location.replace(target || "niaadashboard.html");
    });
  }

  function friendlyError(err) {
    var code = (err && err.code) || "";
    if (["auth/wrong-password","auth/user-not-found","auth/invalid-credential","auth/invalid-email"].indexOf(code) > -1)
      return "Incorrect email or password.";
    if (code === "auth/too-many-requests") return "Too many attempts. Try again in a few minutes.";
    if (code === "auth/network-request-failed") return "Couldn\u2019t reach the server. Check your connection.";
    return "Something went wrong. Please try again.";
  }

  window.Auth = { signIn, signOut, guardPage, redirectIfSignedIn, friendlyError };
})();
