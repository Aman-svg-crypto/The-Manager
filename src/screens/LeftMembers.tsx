import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { UserMinus, CheckCircle, Circle } from 'lucide-react-native';
import { db } from '../config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function LeftMembers({ members }: any) {
  const [viewMode, setViewMode] = useState('History'); // History or Declare
  
  const activeMembers = members.filter((m: any) => m.status !== 'Left');
  const leftMembers = members.filter((m: any) => m.status === 'Left');

  const handleMarkAsLeft = async (id: string, name: string) => {
    Alert.alert("Confirm Exit", `Mark ${name} as a Left Member?`, [
      { text: "Cancel" },
      { text: "Confirm", onPress: async () => {
          await updateDoc(doc(db, "members", id), { status: 'Left' });
          setViewMode('History');
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{viewMode === 'History' ? 'Left Records' : 'Mark Left'}</Text>
        <TouchableOpacity style={styles.toggle} onPress={() => setViewMode(viewMode === 'History' ? 'Declare' : 'History')}>
           <Text style={styles.toggleText}>{viewMode === 'History' ? '+ Declare' : 'Cancel'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={viewMode === 'History' ? leftMembers : activeMembers}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {viewMode === 'Declare' && (
              <TouchableOpacity onPress={() => handleMarkAsLeft(item.id, item.name)}>
                <Circle color="#cbd5e1" size={24} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900' },
  toggle: { backgroundColor: '#000', padding: 10, borderRadius: 10 },
  toggleText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#f8fafc', borderRadius: 20, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold' }
});