import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  X, 
  User 
} from 'lucide-react-native';

// Firebase Config Import
import { db } from '../config/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function Members({ members }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [fee, setFee] = useState('');
  const [dueDate, setDueDate] = useState('1'); // नया कॉलम: Due Date के लिए

  // --- फंक्शन: नया मेंबर ऐड करने के लिए ---
  const handleAddMember = async () => {
    // Validation में dueDate को भी चेक किया
    if (!name || !phone || !fee || !dueDate) {
      Alert.alert("Missing Info", "Please fill Name, Phone, Fee and Due Date.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "members"), {
        name: name,
        phone: phone,
        location: location || 'Not Specified',
        fee: Number(fee),
        dueDate: Number(dueDate), // Firebase में Due Date सेव करना
        status: 'Active',
        createdAt: serverTimestamp(),
      });
      
      setModalVisible(false);
      // फॉर्म रिसेट करना
      setName(''); 
      setPhone(''); 
      setLocation(''); 
      setFee('');
      setDueDate('1'); 
      
      Alert.alert("Success", "New member added to the club!");
    } catch (error) {
      Alert.alert("Error", "Could not save. Check your internet.");
      console.error(error);
    }
    setLoading(false);
  };

  // --- फंक्शन: मेंबर डिलीट करने के लिए ---
  const deleteMember = (id: string, memberName: string) => {
    Alert.alert(
      "Delete Member",
      `Are you sure you want to remove ${memberName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "members", id));
            } catch (e) {
              Alert.alert("Error", "Could not delete.");
            }
          } 
        }
      ]
    );
  };

  // सर्च फिल्टर
  const filteredMembers = members.filter((m: any) => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.phone.includes(search)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Members</Text>
          <Text style={styles.subtitle}>{members.length} Total Registered</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={18} color="white" strokeWidth={3} />
          <Text style={styles.btnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#94a3b8" />
        <TextInput 
          placeholder="Search by name or phone..." 
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Member List */}
      <FlatList 
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({item}) => (
          <View style={styles.memberCard}>
            <View style={styles.avatar}>
              <User size={20} color="#2563eb" />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.name}</Text>
              <View style={styles.row}><Phone size={12} color="#64748b" /><Text style={styles.subText}>{item.phone}</Text></View>
              <View style={styles.row}><MapPin size={12} color="#64748b" /><Text style={styles.subText}>{item.location}</Text></View>
            </View>
            <View style={styles.rightSide}>
              <Text style={styles.feeText}>₹{item.fee}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn}><Edit2 size={16} color="#2563eb" /></TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteMember(item.id, item.name)}>
                  <Trash2 size={16} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members found. Add your first member!</Text>
        }
      />

      {/* Add Member Form (Modal) */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Registration</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#000" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>FULL NAME *</Text>
              <TextInput placeholder="e.g. Aman Pandey" style={styles.input} value={name} onChangeText={setName} />

              <Text style={styles.label}>PHONE NUMBER *</Text>
              <TextInput placeholder="10 Digit Mobile No." style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={10} />

              <Text style={styles.label}>LOCATION / ADDRESS</Text>
              <TextInput placeholder="e.g. Mumbai, Sector 4" style={styles.input} value={location} onChangeText={setLocation} />

              <Text style={styles.label}>MONTHLY FEE (₹) *</Text>
              <TextInput placeholder="e.g. 500" style={styles.input} keyboardType="numeric" value={fee} onChangeText={setFee} />

              {/* नया इनपुट फील्ड: Fee Due Date */}
              <Text style={styles.label}>FEE DUE DATE (DAY OF MONTH) *</Text>
              <Text style={styles.helperText}>Which date of the month should fees be due? (1-31)</Text>
              <TextInput 
                placeholder="1" 
                style={styles.input} 
                keyboardType="numeric" 
                value={dueDate} 
                onChangeText={setDueDate} 
                maxLength={2}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAddMember} disabled={loading}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Add Member</Text>}
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  addBtn: { backgroundColor: '#2563eb', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnText: { color: 'white', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 15, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '600', color: '#1E293B' },
  memberCard: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  avatar: { width: 45, height: 45, backgroundColor: '#EFF6FF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  memberInfo: { flex: 1, marginLeft: 15 },
  memberName: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  subText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  rightSide: { alignItems: 'flex-end' },
  feeText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  editBtn: { padding: 6, backgroundColor: '#F0F7FF', borderRadius: 8 },
  deleteBtn: { padding: 6, backgroundColor: '#FFF1F2', borderRadius: 8 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 50, fontWeight: '600' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  label: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 4, marginTop: 15, letterSpacing: 1 },
  helperText: { fontSize: 10, color: '#64748B', marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#F1F5F9', fontSize: 16, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 30, marginBottom: 20 },
  submitBtn: { flex: 1.5, backgroundColor: '#2563eb', padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: 'white', fontWeight: '900', fontSize: 16 },
  cancelBtn: { flex: 1, backgroundColor: '#F1F5F9', padding: 18, borderRadius: 20, alignItems: 'center' },
  cancelBtnText: { color: '#64748B', fontWeight: '800', fontSize: 16 }
});