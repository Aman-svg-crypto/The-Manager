import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

export default function Upgrade({ uid, onBack }: any) {
  const [plan, setPlan] = useState('Monthly');
  const [transId, setTransId] = useState('');

  const handlePaymentSubmit = async () => {
    if (transId.length < 5) {
      Alert.alert("Error", "Please enter a valid Transaction ID");
      return;
    }
    try {
      await addDoc(collection(db, "paymentRequests"), {
        userId: uid,
        plan: plan,
        transactionId: transId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      Alert.alert("Request Sent", "Admin will verify your payment within 24 hours.");
      onBack();
    } catch (e) {
      Alert.alert("Error", "Server busy, try again later.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}><ChevronLeft color="#000" /></TouchableOpacity>
      <Text style={styles.title}>Go Premium 👑</Text>
      
      <View style={styles.planRow}>
        <TouchableOpacity style={[styles.planBox, plan==='Monthly' && styles.activePlan]} onPress={()=>setPlan('Monthly')}>
          <Text style={styles.planTitle}>Monthly</Text>
          <Text style={styles.planPrice}>₹99</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.planBox, plan==='Yearly' && styles.activePlan]} onPress={()=>setPlan('Yearly')}>
          <Text style={styles.planTitle}>Yearly</Text>
          <Text style={styles.planPrice}>₹999</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.qrCard}>
        <Text style={styles.qrHint}>1. Scan & Pay</Text>
        <Image source={{ uri: 'https://i.postimg.cc/8CtS4B9Y/Whats-App-Image-2025-03-04-at-13-17-48-2615462d.jpg' }} style={styles.qrImg} />
        <Text style={styles.qrHint}>2. Paste Transaction ID below</Text>
        <TextInput style={styles.input} placeholder="Enter Trans ID" value={transId} onChangeText={setTransId} placeholderTextColor="#94a3b8" />
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={handlePaymentSubmit}>
        <Text style={styles.mainBtnText}>Confirm Upgrade</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 50, backgroundColor: '#F8FAFC', alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 25 },
  planRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  planBox: { flex: 1, padding: 20, backgroundColor: '#fff', borderRadius: 20, borderWidth: 2, borderColor: '#f1f5f9', alignItems: 'center' },
  activePlan: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  planTitle: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  planPrice: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  qrCard: { backgroundColor: '#fff', padding: 20, borderRadius: 30, width: '100%', alignItems: 'center', elevation: 2 },
  qrImg: { width: 220, height: 220, marginVertical: 15, borderRadius: 15 },
  qrHint: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  input: { width: '100%', backgroundColor: '#f8fafc', padding: 18, borderRadius: 15, marginTop: 15, borderWidth: 1, borderColor: '#f1f5f9', fontWeight: 'bold' },
  mainBtn: { backgroundColor: '#0F172A', width: '100%', padding: 20, borderRadius: 22, marginTop: 30, alignItems: 'center' },
  mainBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 }
});