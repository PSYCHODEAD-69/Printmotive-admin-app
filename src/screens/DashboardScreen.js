import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getProducts, getOrders, getReviews } from '../utils/api';
import Toast from 'react-native-toast-message';

export default function DashboardScreen() {
  const { theme, isDark } = useTheme();
  const { token } = useAuth();
  const s = styles(theme);

  const [counts, setCounts] = useState({ products: 0, orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [products, orders, reviews] = await Promise.all([
        getProducts(),
        getOrders(token),
        getReviews(),
      ]);
      setCounts({
        products: Array.isArray(products) ? products.length : 0,
        orders:   Array.isArray(orders)   ? orders.length   : 0,
        reviews:  Array.isArray(reviews)  ? reviews.length  : 0,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Could not load dashboard' });
    }
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  const cards = [
    {
      label: 'Total Products',
      count: counts.products,
      icon:  'cube',
      color: theme.accent,
      bg:    theme.accent + '20',
    },
    {
      label: 'Total Orders',
      count: counts.orders,
      icon:  'receipt',
      color: theme.green,
      bg:    theme.green + '20',
    },
    {
      label: 'Total Reviews',
      count: counts.reviews,
      icon:  'chatbubbles',
      color: theme.yellow,
      bg:    theme.yellow + '20',
    },
  ];

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
          colors={[theme.accent]}
        />
      }
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Welcome back 👋</Text>
          <Text style={s.subGreeting}>Here's your store overview</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {/* Stat Cards */}
      {cards.map((card) => (
        <View key={card.label} style={[s.card, { borderLeftColor: card.color, borderLeftWidth: 4 }]}>
          <View style={[s.iconWrap, { backgroundColor: card.bg }]}>
            <Ionicons name={card.icon} size={28} color={card.color} />
          </View>
          <View style={s.cardText}>
            <Text style={s.cardCount}>{card.count}</Text>
            <Text style={s.cardLabel}>{card.label}</Text>
          </View>
        </View>
      ))}

      {/* Footer note */}
      <Text style={s.note}>Pull down to refresh data</Text>
    </ScrollView>
  );
}

const styles = (t) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: t.bg },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting:    { fontSize: 22, fontWeight: '800', color: t.text },
  subGreeting: { fontSize: 13, color: t.muted, marginTop: 4 },
  refreshBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: t.surface2, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' },
  card:        { backgroundColor: t.cardBg, borderRadius: 16, borderWidth: 1, borderColor: t.border, flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 16, gap: 16 },
  iconWrap:    { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardText:    { flex: 1 },
  cardCount:   { fontSize: 32, fontWeight: '900', color: t.text },
  cardLabel:   { fontSize: 14, color: t.muted, marginTop: 2 },
  note:        { textAlign: 'center', color: t.muted, fontSize: 12, marginTop: 8 },
});
