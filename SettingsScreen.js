import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth }  from '../context/AuthContext';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const s = styles(theme);

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={s.root}>
      <Text style={s.pageTitle}>Settings</Text>

      {/* App Info */}
      <View style={s.section}>
        <View style={s.logoRow}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>
            Print<Text style={{ color: theme.accent }}>Motive</Text>
          </Text>
          <View style={s.adminBadge}>
            <Text style={s.adminBadgeText}>ADMIN</Text>
          </View>
        </View>
        <Text style={s.appVersion}>Version 1.0.0</Text>
      </View>

      {/* Theme */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Appearance</Text>
        <View style={s.row}>
          <View>
            <Text style={s.rowTitle}>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</Text>
            <Text style={s.rowSub}>Switch between dark and light theme</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={isDark ? theme.accent2 : '#fff'}
          />
        </View>
      </View>

      {/* API Info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Backend</Text>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Worker URL</Text>
          <Text style={s.infoValue} numberOfLines={1}>
            printmotive-worker.devpandey618.workers.dev
          </Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Storage</Text>
          <Text style={s.infoValue}>Cloudflare KV + R2</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout} activeOpacity={0.85}>
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (t) => StyleSheet.create({
  root:          { flex: 1, backgroundColor: t.bg, padding: 20 },
  pageTitle:     { fontSize: 22, fontWeight: '800', color: t.text, marginBottom: 24 },
  section:       { backgroundColor: t.surface, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 16, marginBottom: 16 },
  sectionTitle:  { fontSize: 12, fontWeight: '700', color: t.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  logoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  logoDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: t.accent },
  logoText:      { fontSize: 18, fontWeight: '800', color: t.text },
  adminBadge:    { backgroundColor: t.accent, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  adminBadgeText:{ color: '#fff', fontSize: 10, fontWeight: '700' },
  appVersion:    { fontSize: 12, color: t.muted },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle:      { fontSize: 15, fontWeight: '600', color: t.text },
  rowSub:        { fontSize: 12, color: t.muted, marginTop: 2 },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border },
  infoLabel:     { fontSize: 13, color: t.muted },
  infoValue:     { fontSize: 13, color: t.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  logoutBtn:     { backgroundColor: t.red + '22', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: t.red + '44', marginTop: 8 },
  logoutText:    { color: t.red, fontWeight: '700', fontSize: 16 },
});
