import firebase from "firebase/app";
import "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAnznqfoxs5XsO3YGvHrXXBsX70m-0Gy9A",
  authDomain: "testggfb-bde24.firebaseapp.com",
  projectId: "testggfb-bde24",
  storageBucket: "testggfb-bde24.firebasestorage.app",
  messagingSenderId: "558017173421",
  appId: "1:558017173421:web:d95f39d73880f306387324",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await messaging.getToken({
        vapidKey:
          "BOJsUwKHal-OhY9KoWcO8acNwRNP-zRkpCg0-e_2xn2U9dQAEFR5bzEFk7RVr7BlnqgxZE8VEytZ1ECbzd14pOY",
      });
      return token;
    }
  } catch (err) {
    console.error("Lỗi lấy FCM Token:", err);
  }
};

export { messaging };
