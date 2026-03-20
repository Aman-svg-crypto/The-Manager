import React, { useState, useEffect } from 'react';
import { 
  View, StyleSheet, TouchableOpacity, Modal, Text, 
  SafeAreaView, StatusBar, Dimensions, ActivityIndicator 
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 
import { 
  LayoutDashboard, Users, AlertCircle, UserMinus, 
  Plus, X, Settings as GearIcon, ShieldCheck, Crown 
} from 'lucide-react-native';

// Firebase Config
import { auth, db } from './src/config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth'; // सेशन चेक करने के लिए
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';

// Screens
import Auth from './src/screens/Auth'; 
import Dashboard from './src/screens/Dashboard';
import Members from './src/screens/Members';
import ExpiredMembers from './src/screens/ExpiredMembers';
import LeftMembers from './src/screens/LeftMembers';
import Settings from './src/screens/Settings';
import Upgrade from './src/screens/Upgrade';
import AdminPanel from './src/screens/AdminPanel';

const { width } = Dimensions.get('window');

export default function App() {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // शुरूआती चेकिंग के लिए
  const [userUid, setUserUid] = useState('');
  const [gymName, setGymName] = useState('Royal Gym');
  const [isPro, setIsPro] = useState(false);
  const [expiryDate, setExpiryDate] = useState<any>(null);
  
  const [screen, setScreen] = useState('Dashboard');
  const [members, setMembers] = useState<any[]>([]);
  const [isFabOpen, setFabOpen] = useState(false);

  // --- 1. Persistent Login Check (ब्रह्मास्त्र: लॉगिन हमेशा याद रहेगा) ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // अगर यूजर पहले से लॉगिन है, उसका डेटा लाओ
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setGymName(userData.gymName);
            setIsPro(userData.isPro || false);
            setExpiryDate(userData.expiryDate || null);
            setUserUid(user.uid);
            setIsAdmin(false); // नॉर्मल यूजर
            setIsLoggedIn(true);
          } else if (user.email === "admin@gym.com") { 
             // अगर एडमिन ईमेल है (वैकल्पिक)
             setIsAdmin(true);
             setIsLoggedIn(true);
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false); // चेकिंग पूरी हुई
    });
    return () => unsubscribeAuth();
  }, []);

  // --- 2. Firebase से मेंबर्स का डेटा सिंक ---
  useEffect(() => {
    if (isLoggedIn) {
      const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => console.error("Sync Error: ", error));
      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  // --- 3. Auto-Expiry Logic ---
  useEffect(() => {
    const checkExpiry = async () => {
      if (isLoggedIn && isPro && expiryDate && !isAdmin) {
        const today = new Date();
        const exp = new Date(expiryDate);
        if (today > exp) {
          setIsPro(false);
          await updateDoc(doc(db, "users", userUid), { isPro: false });
        }
      }
    };
    checkExpiry();
  }, [isLoggedIn, screen]);

  // लॉगिन सफल होने पर (Auth.tsx से कॉल होता है)
  const handleLoginSuccess = (name: string, proStatus: boolean, exp: any, uid: string, admin: boolean) => {
    setGymName(name);
    setIsPro(proStatus);
    setExpiryDate(exp);
    setUserUid(uid);
    setIsAdmin(admin);
    setIsLoggedIn(true);
  };

  // लॉगआउट फंक्शन (Settings.tsx के लिए)
  const handleLogoutSuccess = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setScreen('Dashboard');
  };

  const navigateTo = (screenName: string) => {
    setScreen(screenName);
    setFabOpen(false); 
  };

  // अगर ऐप अभी चेक कर रही है कि लॉगिन है या नहीं
  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#020617'}}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  // --- अगर लॉगिन नहीं है ---
  if (!isLoggedIn) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <Auth onLoginSuccess={handleLoginSuccess} />
      </GestureHandlerRootView>
    );
  }

  // --- लॉगिन होने के बाद मुख्य ऐप ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <View style={{ flex: 1 }}>
          {screen === 'Dashboard' && <Dashboard members={members} onNavigate={setScreen} gymName={gymName} isPro={isPro} expiryDate={expiryDate} isAdmin={isAdmin} />}
          {screen === 'Members' && <Members members={members.filter((m: any) => m.status !== 'Left')} />}
          {screen === 'Expired' && <ExpiredMembers members={members} />}
          {screen === 'Left' && <LeftMembers members={members} />}
          {screen === 'Settings' && <Settings gymName={gymName} isPro={isPro} onLogout={handleLogoutSuccess} />}
          {screen === 'Upgrade' && <Upgrade uid={userUid} gymName={gymName} onBack={() => setScreen('Dashboard')} />}
          {screen === 'AdminPanel' && <AdminPanel onBack={() => setScreen('Dashboard')} />}
        </View>

        {/* --- Floating Bottom Navigation --- */}
        <View style={styles.navWrapper} pointerEvents="box-none">
          <View style={styles.floatingNav}>
            
            <TouchableOpacity onPress={() => setScreen('Dashboard')} style={styles.navItem}>
              <LayoutDashboard color={screen === 'Dashboard' ? "#2563eb" : "#94a3b8"} size={24} />
              {screen === 'Dashboard' && <View style={styles.activeDot} />}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setScreen('Members')} style={styles.navItem}>
              <Users color={screen === 'Members' ? "#2563eb" : "#94a3b8"} size={24} />
              {screen === 'Members' && <View style={styles.activeDot} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.premiumFab} onPress={() => setFabOpen(true)}>
              <Plus color="white" size={32} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setScreen('Expired')} style={styles.navItem}>
              <AlertCircle color={screen === 'Expired' ? "#f43f5e" : "#94a3b8"} size={24} />
              {screen === 'Expired' && <View style={[styles.activeDot, {backgroundColor: '#f43f5e'}]} />}
            </TouchableOpacity>

            {isAdmin ? (
               <TouchableOpacity onPress={() => setScreen('AdminPanel')} style={styles.navItem}>
                <ShieldCheck color={screen === 'AdminPanel' ? "#2563eb" : "#94a3b8"} size={24} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setScreen('Settings')} style={styles.navItem}>
                <GearIcon color={screen === 'Settings' ? "#2563eb" : "#94a3b8"} size={24} />
                {screen === 'Settings' && <View style={styles.activeDot} />}
              </TouchableOpacity>
            )}

          </View>
        </View>

        {/* --- FAB Options Modal --- */}
        <Modal visible={isFabOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.menuCard}>
              <Text style={styles.menuTitle}>Actions</Text>
              <TouchableOpacity style={styles.menuOption} onPress={() => navigateTo('Members')}>
                <View style={[styles.optionIconCircle, {backgroundColor: '#eff6ff'}]}><Plus color="#2563eb" size={22} /></View>
                <Text style={styles.optionText}>Add New Member</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOption} onPress={() => navigateTo('Left')}>
                <View style={[styles.optionIconCircle, {backgroundColor: '#f8fafc'}]}><UserMinus color="#475569" size={22} /></View>
                <Text style={styles.optionText}>Mark Member Left</Text>
              </TouchableOpacity>
              {!isAdmin && !isPro && (
                <TouchableOpacity style={styles.menuOption} onPress={() => navigateTo('Upgrade')}>
                  <View style={[styles.optionIconCircle, {backgroundColor: '#fff7ed'}]}><Crown color="#f59e0b" size={22} /></View>
                  <Text style={styles.optionText}>Upgrade to Pro</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeFab} onPress={() => setFabOpen(false)}>
                <X color="white" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  navWrapper: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center', zIndex: 999 },
  floatingNav: { flexDirection: 'row', backgroundColor: 'white', width: width * 0.9, height: 75, borderRadius: 30, justifyContent: 'space-around', alignItems: 'center', elevation: 15, paddingHorizontal: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 50, height: 50 },
  activeDot: { width: 5, height: 5, backgroundColor: '#2563eb', borderRadius: 3, marginTop: 4 },
  premiumFab: { width: 65, height: 65, backgroundColor: '#0F172A', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: -45, borderWidth: 5, borderColor: '#F8FAFC', elevation: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
  menuCard: { backgroundColor: 'white', width: '85%', borderRadius: 35, padding: 25, alignItems: 'center' },
  menuTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 20 },
  menuOption: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 18, backgroundColor: '#f8fafc', borderRadius: 20, marginBottom: 12 },
  optionIconCircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  closeFab: { marginTop: 10, backgroundColor: '#0F172A', padding: 15, borderRadius: 50 }
});