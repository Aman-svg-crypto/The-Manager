import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { LogOut, User, Crown, ShieldCheck } from 'lucide-react-native';

export default function Settings({ gymName, isPro, onLogout }: any) {
  
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to exit?", [
      { text: "Cancel" },
      { text: "Log Out", onPress: async () => {
          await signOut(auth);
          onLogout();
      }, style: 'destructive'}
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
           <User color="#2563eb" size={30} />
        </View>
        <View>
          <Text style={styles.gymName}>{gymName}</Text>
          <Text style={styles.statusText}>{isPro ? "Premium Member" : "Free Plan"}</Text>
        </View>
        {isPro && <Crown color="#f59e0b" size={24} style={{marginLeft: 'auto'}} />}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color="#f43f5e" size={20} />
        <Text style={styles.logoutText}>Log Out from Device</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
         <ShieldCheck color="#94a3b8" size={16} />
         <Text style={styles.footerText}>Secured by Royal Gym Management</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#F8FAFC', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 30 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 25, gap: 15, elevation: 3 },
  avatar: { width: 60, height: 60, backgroundColor: '#eff6ff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  gymName: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  statusText: { color: '#64748B', fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 25, marginTop: 20, gap: 12, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#f43f5e', fontWeight: 'bold', fontSize: 16 },
  footer: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginBottom: 100 },
  footerText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }
});