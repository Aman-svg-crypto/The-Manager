import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { 
  Users, 
  AlertCircle, 
  UserMinus, 
  IndianRupee, 
  ChevronRight, 
  TrendingUp, 
  Settings as GearIcon,
  Crown,
  BellRing
} from 'lucide-react-native';
// एड्स और तारीख कैलकुलेशन के लिए ज़रूरी इम्पोर्ट्स
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { differenceInDays } from 'date-fns';

const { width } = Dimensions.get('window');

// --- AdMob ID Setup ---
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-7078968623067562/7032503393';

export default function Dashboard({ members, onNavigate, gymName, isPro, expiryDate, isAdmin }: any) {
  const todayDate = new Date().getDate();
  const todayFull = new Date();

  // --- 1. लॉजिक और सांख्यिकी (Stats) ---
  const activeMembers = members.filter((m: any) => m.status !== 'Left');
  const expiredMembersCount = activeMembers.filter((m: any) => todayDate > Number(m.dueDate)).length;
  const leftMembersCount = members.filter((m: any) => m.status === 'Left').length;
  const totalRevenue = activeMembers.reduce((acc: number, curr: any) => acc + (Number(curr.fee) || 0), 0);

  // --- 2. प्रो प्लान एक्सपायरी अलर्ट लॉजिक ---
  let daysRemaining = -1;
  if (isPro && expiryDate && !isAdmin) {
    daysRemaining = differenceInDays(new Date(expiryDate), todayFull);
  }

  // --- 3. 🛡️ ब्रह्मास्त्र: सुरक्षित एड रेंडर फंक्शन (Expo Go क्रैश फिक्स) ---
  const renderBannerAd = () => {
    // अगर यूजर Pro है या Admin है, तो एड्स मत दिखाओ
    if (isPro || isAdmin) return null;

    try {
      return (
        <View style={styles.adWrapper}>
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdFailedToLoad={(error) => console.log('Ad error:', error)}
          />
        </View>
      );
    } catch (error) {
      // अगर Expo Go में है तो क्रैश होने के बजाय ये दिखेगा
      return (
        <View style={[styles.adWrapper, { padding: 5 }]}>
          <Text style={{ color: '#94a3b8', fontSize: 10 }}>Ads active in APK mode</Text>
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>{gymName || 'Royal Gym'}</Text>
            <Text style={styles.subText}>Gym Overview & Analytics</Text>
          </View>
          {isPro && (
            <View style={styles.proBadge}>
              <Crown size={14} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
        </View>

        {/* 🔔 Expiry Alert Banner */}
        {isPro && daysRemaining <= 3 && daysRemaining >= 0 && !isAdmin && (
          <TouchableOpacity 
            style={styles.alertBanner} 
            onPress={() => onNavigate('Upgrade')}
            activeOpacity={0.8}
          >
            <BellRing size={22} color="#fff" />
            <View style={{flex: 1}}>
              <Text style={styles.alertTitle}>Plan Expiring Soon!</Text>
              <Text style={styles.alertSub}>Your premium access expires in {daysRemaining} days. Renew now to stay Ad-free.</Text>
            </View>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Stats Grid */}
        <View style={styles.grid}>
          <StatCard title="Active Members" value={activeMembers.length.toString()} icon={Users} color="#2563eb" />
          <StatCard title="Expired Fees" value={expiredMembersCount.toString()} icon={AlertCircle} color="#f43f5e" />
          <StatCard title="Left Members" value={leftMembersCount.toString()} icon={UserMinus} color="#475569" />
          <StatCard title="Revenue" value={`₹${totalRevenue}`} icon={IndianRupee} color="#10b981" />
        </View>
        
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        
        <ActionBtn title="Manage Active Members" icon={Users} color="#2563eb" onPress={() => onNavigate('Members')} />
        <ActionBtn title="View Overdue Fees" icon={AlertCircle} color="#f43f5e" onPress={() => onNavigate('Expired')} />
        <ActionBtn title="Left Members Record" icon={UserMinus} color="#475569" onPress={() => onNavigate('Left')} />
        
        {!isAdmin && (
          <ActionBtn title="Settings & Configuration" icon={GearIcon} color="#264c83" onPress={() => onNavigate('Settings')} />
        )}

      </ScrollView>

      {/* एड्स को सुरक्षित तरीके से यहाँ बुलाएँ */}
      {renderBannerAd()}

    </View>
  );
}

// --- Helper Components ---
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Icon size={20} color={color} />
    </View>
    <Text style={styles.statLabel}>{title}</Text>
    <View style={styles.valRow}>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.trendIcon}><TrendingUp size={10} color="#10b981" /></View>
    </View>
  </View>
);

const ActionBtn = ({ title, icon: Icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.mainActionBtn} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIconCircle, { backgroundColor: color }]}>
      <Icon size={20} color="white" />
    </View>
    <Text style={styles.mainActionText}>{title}</Text>
    <ChevronRight size={18} color="#cbd5e1" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 180, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#000', letterSpacing: -1, textTransform: 'uppercase', flex: 1 },
  subText: { fontSize: 14, color: '#64748b', marginBottom: 25 },
  proBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#fed7aa', gap: 5 },
  proText: { color: '#f59e0b', fontWeight: '900', fontSize: 12 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f43f5e', padding: 18, borderRadius: 25, gap: 15, marginBottom: 20, elevation: 4 },
  alertTitle: { color: '#fff', fontWeight: '900', fontSize: 16 },
  alertSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  statCard: { width: (width - 64) / 2, backgroundColor: '#fff', padding: 20, borderRadius: 28, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  valRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#000' },
  trendIcon: { padding: 4, backgroundColor: '#f0fdf4', borderRadius: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', marginTop: 25, marginBottom: 15, letterSpacing: 1 },
  mainActionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', gap: 15, backgroundColor: '#fff', marginBottom: 12, elevation: 1 },
  actionIconCircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  mainActionText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#000' },
  adWrapper: { position: 'absolute', bottom: 105, width: '100%', alignItems: 'center', backgroundColor: 'transparent', paddingVertical: 5 }
});