importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyAnznqfoxs5XsO3YGvHrXXBsX70m-0Gy9A",
  authDomain: "testggfb-bde24.firebaseapp.com",
  projectId: "testggfb-bde24",
  storageBucket: "testggfb-bde24.firebasestorage.app",
  messagingSenderId: "558017173421",
  appId: "1:558017173421:web:d95f39d73880f306387324",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Nhận tin nhắn ngầm:", payload);

  const title = payload.notification?.title || "ClearLink Update";
  const options = {
    body: payload.notification?.body || "Bạn có thông báo mới từ hệ thống",
    icon: "/logo192.png",
    badge: "/logo192.png",
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("push", (event) => {
  console.log("[SW] Đã nhận được sự kiện Push!");
  if (event.data) {
    try {
      const data = event.data.json();
      console.log("[SW] Dữ liệu JSON:", data);
    } catch (e) {
      console.log("[SW] Dữ liệu dạng Text:", event.data.text());
    }
  }
});
