import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Linking,
  Platform 
} from 'react-native';
import { 
  AlertCircle, 
  Phone, 
  MapPin, 
  Calendar,
  MessageSquare
} from 'lucide-react-native';

export default function ExpiredMembers({ members }: any) {
  // --- आज की तारीख का दिन निकालना (e.g. 1 to 31) ---
  const today = new Date().getDate();

  // --- सिर्फ उन मेंबर्स को फिल्टर करना जिनका ड्यू डेट निकल गया है और जो जिम छोड़कर नहीं गए ---
  const expiredData = members.filter((m: any) => 
    m.status !== 'Left' && today > Number(m.dueDate)
  );

  // व्हाट्सएप पर मैसेज भेजने का फंक्शन (Extra SaaS Feature)
  const sendReminder = (phone: string, name: string) => {
    const msg = `Hello ${name}, this is a reminder from Royal Health Club regarding your gym fee which was due on ${today}th. Please settle it at the earliest.`;
    Linking.openURL(`whatsapp://send?phone=91${phone}&text=${msg}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <AlertCircle size={28} color="#f43f5e" strokeWidth={2.5} />
        </View>
        <View>
          <Text style={styles.title}>Overdue Fees</Text>
          <Text style={styles.subtitle}>{expiredData.length} Members Pending</Text>
        </View>
      </View>

      {/* Overdue List */}
      <FlatList 
        data={expiredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({item}) => (
          <View style={styles.expiredCard}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <View style={styles.infoRow}>
                  <Phone size={14} color="#64748b" />
                  <Text style={styles.infoText}>{item.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.infoText}>{item.location || 'No Location'}</Text>
                </View>
              </View>
              
              <View style={styles.dueBadge}>
                <Calendar size={12} color="#fff" />
                <Text style={styles.dueDateText}>DUE: {item.dueDate}th</Text>
              </View>
            </View>

            {/* Quick Action Button for Overdue */}
            <TouchableOpacity 
              style={styles.remindBtn}
              onPress={() => sendReminder(item.phone, item.name)}
            >
              <MessageSquare size={18} color="white" />
              <Text style={styles.remindBtnText}>Send Reminder</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>All Clear! 🎉</Text>
            <Text style={styles.emptySub}>No members have overdue fees today.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: 20, 
    paddingTop: 60 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30,
    gap: 15
  },
  headerIcon: {
    width: 55,
    height: 55,
    backgroundColor: '#fff1f2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe4e6'
  },
  title: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#0F172A',
    letterSpacing: -0.5
  },
  subtitle: { 
    fontSize: 14, 
    color: '#f43f5e', 
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  expiredCard: { 
    backgroundColor: 'white', 
    borderRadius: 25, 
    padding: 20, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffe4e6',
    shadowColor: '#f43f5e',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  memberName: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1E293B', 
    marginBottom: 6,
    textTransform: 'capitalize'
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 4 
  },
  infoText: { 
    color: '#64748B', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  dueBadge: { 
    backgroundColor: '#f43f5e', 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 10,
    gap: 5
  },
  dueDateText: { 
    color: 'white', 
    fontSize: 11, 
    fontWeight: '900' 
  },
  remindBtn: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 15,
    gap: 10
  },
  remindBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  emptyBox: { 
    marginTop: 80, 
    alignItems: 'center' 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#10b981' 
  },
  emptySub: { 
    color: '#94A3B8', 
    marginTop: 5,
    fontWeight: '600'
  }
});