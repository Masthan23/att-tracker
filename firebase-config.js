(function (global) {
    const config = {
        apiKey: 'AIzaSyBVzj3TbLuYR9Vp0OwD_VraZgJt60If-cg',
        authDomain: 'rishika-4cce7.firebaseapp.com',
        projectId: 'rishika-4cce7',
        storageBucket: 'rishika-4cce7.firebasestorage.app',
        messagingSenderId: '685424292528',
        appId: '1:685424292528:web:b87ad69b053a0dff2f0175',
        measurementId: 'G-3D01S01FQ6'
    };

    // Primary name used throughout app.html/admin.html.
    global.FIREBASE_CONFIG = config;

    // Alias kept for anyone referencing the newer Firebase sample name.
    global.firebaseConfig = config;
})(typeof window !== 'undefined' ? window : globalThis);
