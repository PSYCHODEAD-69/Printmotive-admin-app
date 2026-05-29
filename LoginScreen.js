import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import { loginApi } from '../utils/api';
import Toast         from 'react-native-toast-message';

export default function LoginScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const s = styles(theme);

  const doLogin = async () => {
    if (!username.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Please fill in both fields' });
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(username.trim(), password);
      if (res.token) {
        await login(res.token);
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Invalid credentials' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Network error. Check your connection.' });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      {/* Theme toggle */}
      <TouchableOpacity style={s.themeBtn} onPress={toggleTheme}>
        <Text style={s.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <View style={s.box}>
        {/* Logo */}
        <View style={s.logoRow}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>
            Print<Text style={{ color: theme.accent }}>Motive</Text>
          </Text>
          <View style={s.adminBadge}>
            <Text style={s.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        <Text style={s.title}>Welcome back</Text>
        <Text style={s.sub}>Sign in to manage your store</Text>

        <TextInput
          style={s.input}
          placeholder="Username"
          placeholderTextColor={theme.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={s.input}
          placeholder="Password"
          placeholderTextColor={theme.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={doLogin}
        />

        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={doLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Sign In</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (t) => StyleSheet.create({
  root: {
    flex: 1, backgroundColor: t.bg,
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  themeBtn: {
    position: 'absolute', top: 56, right: 24,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: t.surface2, borderWidth: 1, borderColor: t.border,
    alignItems: 'center', justifyContent: 'center',
  },
  themeIcon: { fontSize: 18 },
  box: {
    width: '100%', maxWidth: 380,
    backgroundColor: t.surface, borderRadius: 24,
    borderWidth: 1, borderColor: t.border,
    padding: 28,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: t.accent },
  logoText: { fontSize: 20, fontWeight: '800', color: t.text, letterSpacing: 0.5 },
  adminBadge: {
    backgroundColor: t.accent, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', color: t.text, marginBottom: 4 },
  sub:   { fontSize: 14, color: t.muted, marginBottom: 28 },
  input: {
    backgroundColor: t.inputBg, borderWidth: 1.5, borderColor: t.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: t.text, fontSize: 15, marginBottom: 14,
  },
  btn: {
    backgroundColor: t.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
