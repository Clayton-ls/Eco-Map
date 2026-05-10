import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchPoints = async () => {
  const snapshot = await getDocs(collection(db, 'points'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addPoint = async point => {
  // point: { name, type, description, latitude, longitude }
  return await addDoc(collection(db, 'points'), point);
};