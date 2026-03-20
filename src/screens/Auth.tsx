import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ImageBackground, 
  StatusBar, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Mail, Lock, User, Dumbbell, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

// Firebase Imports
import { auth, db } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function Auth({ onLoginSuccess }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [gymName, setGymName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !gymName)) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }

    // --- 🚀 ADMIN BYPASS LOGIC (ब्रह्मास्त्र) ---
    if (isLogin && email.trim() === "Admin" && password === "#Aman@321") {
      // params: name, isPro, expiryDate, uid, isAdmin
      onLoginSuccess("Owner Dashboard", true, null, "admin_master", true);
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        // --- 1. LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Dashboard को सारा डेटा भेजें
          onLoginSuccess(
            userData.gymName, 
            userData.isPro || false, 
            userData.expiryDate || null, 
            userCredential.user.uid, 
            false
          );
        } else {
          onLoginSuccess("Royal Gym", false, null, userCredential.user.uid, false);
        }
      } else {
        // --- 2. SIGNUP ---
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          gymName: gymName.trim(),
          email: cleanEmail,
          isPro: false, // नया यूजर हमेशा फ्री
          expiryDate: null,
          createdAt: new Date().toISOString()
        });
        Alert.alert("Success 🎉", "Registered! Now Login.");
        setIsLogin(true);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070' }} 
        style={styles.background}
      >
        <StatusBar barStyle="light-content" />
        
        <View style={styles.overlay} pointerEvents="box-none">
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent} 
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
            >
              
              <View style={styles.logoArea}>
                <View style={styles.logoCircle}>
                  <Dumbbell size={45} color="#fff" strokeWidth={2.5} />
                </View>
                <Text style={styles.brandTitle}>ROYAL GYM</Text>
                <Text style={styles.brandSubtitle}>MANAGEMENT SYSTEM</Text>
              </View>

              <View style={styles.glassCard}>
                <Text style={styles.formHeader}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </Text>
                
                <View style={styles.inputArea}>
                  {!isLogin && (
                    <View style={styles.inputWrapper}>
                      <User size={20} color="rgba(255,255,255,0.7)" />
                      <TextInput 
                        placeholder="Gym Name" 
                        placeholderTextColor="rgba(255,255,255,0.5)" 
                        style={styles.input}
                        value={gymName}
                        onChangeText={setGymName}
                      />
                    </View>
                  )}

                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput 
                      placeholder="Email or Admin" 
                      placeholderTextColor="rgba(255,255,255,0.5)" 
                      style={styles.input} 
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput 
                      placeholder="Password" 
                      placeholderTextColor="rgba(255,255,255,0.5)" 
                      style={styles.input} 
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)} 
                      style={styles.eyeIcon}
                      activeOpacity={0.5}
                    >
                      {showPassword ? <EyeOff size={20} color="#fff" /> : <Eye size={20} color="#fff" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.mainBtn} 
                  onPress={handleAuth}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <Text style={styles.mainBtnText}>{isLogin ? 'LOG IN' : 'REGISTER'}</Text>
                      <ArrowRight size={22} color="#000" strokeWidth={3} />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                   style={styles.switchBtn} 
                   onPress={() => setIsLogin(!isLogin)}
                   activeOpacity={0.6}
                >
                  <Text style={styles.switchText}>
                    {isLogin ? "New Gym? " : "Already Registered? "}
                    <Text style={styles.switchHighlight}>{isLogin ? 'Sign Up' : 'Login'}</Text>
                  </Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center' },
  scrollContent: { padding: 30, flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 30, zIndex: 5 },
  logoCircle: { width: 85, height: 85, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  brandTitle: { fontSize: 30, fontWeight: '900', color: '#fff', marginTop: 15, letterSpacing: 2 },
  brandSubtitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 4 },
  glassCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 35, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', zIndex: 999, elevation: 10 },
  formHeader: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 25 },
  inputArea: { gap: 15, marginBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingHorizontal: 15, height: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 10 },
  eyeIcon: { padding: 10, zIndex: 1000 },
  mainBtn: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 65, borderRadius: 20, gap: 10, marginTop: 5, elevation: 5, zIndex: 1000 },
  mainBtnText: { color: '#000', fontWeight: '900', fontSize: 17, letterSpacing: 1 },
  switchBtn: { marginTop: 20, alignItems: 'center', padding: 10, zIndex: 1000 },
  switchText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  switchHighlight: { color: '#fff', fontWeight: '900', textDecorationLine: 'underline' }
});