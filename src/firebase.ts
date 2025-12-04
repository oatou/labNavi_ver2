import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC6gQC_O0or4o7_hsXYNK2yJcKqXAgvsz0",
    authDomain: "lab-flow-chart.firebaseapp.com",
    projectId: "lab-flow-chart",
    storageBucket: "lab-flow-chart.firebasestorage.app",
    messagingSenderId: "1093906507686",
    appId: "1:1093906507686:web:b3b267893f90f919b25167"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
