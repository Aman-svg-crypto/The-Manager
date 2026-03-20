import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../config/firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { addDays } from 'date-fns';
import { Check, X, Shield } from 'lucide-react-native';

export default function AdminPanel({ onBack }: any) {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "paymentRequests"), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (req: any) => {
    try {
      const days = req.plan === 'Monthly' ? 30 : 365;
      const expiry = addDays(new Date(), days).toISOString();

      // यूजर को प्रो बनाना
      await updateDoc(doc(db, "users", req.userId), {
        isPro: true,
        expiryDate: expiry
      });

      // रिक्वेस्ट डिलीट करना
      await deleteDoc(doc(db, "paymentRequests", req.id));
      Alert.alert("Approved!", "User is now a PRO member.");
    } catch (e) {
      Alert.alert("Error", "Could not approve.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield color="#2563eb" size={30} />
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      <FlatList 
        data={requests}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.cardId}>User: {item.userId.substring(0,8)}...</Text>
            <Text style={styles.cardPlan}>Plan: <Text style={{color: '#2563eb'}}>{item.plan}</Text></Text>
            <Text style={styles.cardTrans}>Trans ID: {item.transactionId}</Text>
            
            <View style={styles.row}>
              <TouchableOpacity style={styles.approveBtn} onPress={()=>handleApprove(item)}>
                <Check color="#fff" size={20} />
                <Text style={styles.btnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn} onPress={()=>deleteDoc(doc(db, "paymentRequests", item.id))}>
                <X color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No pending requests.</Text>}
      />
      <TouchableOpacity onPress={onBack} style={styles.exitBtn}><Text style={styles.exitText}>Exit Admin Mode</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 60, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 25, marginBottom: 15, elevation: 3 },
  cardId: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
  cardPlan: { fontSize: 18, fontWeight: '900', marginVertical: 5 },
  cardTrans: { fontSize: 14, color: '#475569', backgroundColor: '#f1f5f9', padding: 8, borderRadius: 10 },
  row: { flexDirection: 'row', gap: 10, marginTop: 15 },
  approveBtn: { flex: 1, backgroundColor: '#10b981', flexDirection: 'row', padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 5 },
  declineBtn: { backgroundColor: '#f43f5e', padding: 12, borderRadius: 12, width: 50, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  exitBtn: { marginTop: 20, alignSelf: 'center' },
  exitText: { color: '#94a3b8', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 100, color: '#94a3b8', fontWeight: 'bold' }
});