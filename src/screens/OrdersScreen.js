import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import { getOrders, deleteOrder } from '../utils/api';
import Toast from 'react-native-toast-message';

export default function OrdersScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const s = styles(theme);

  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      Toast.show({ type: 'error', text1: 'Could not load orders' });
    }
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const confirmDelete = (o) => {
    Alert.alert(
      'Delete Order',
      `Delete order from ${o.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteOrder(o.id, token);
              if (res.success) {
                Toast.show({ type: 'success', text1: '✓ Order deleted' });
                load();
              } else {
                Toast.show({ type: 'error', text1: res.error || 'Delete failed' });
              }
            } catch {
              Toast.show({ type: 'error', text1: 'Network error' });
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item: o }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View>
          <Text style={s.orderId}>#{o.id?.slice(-8)?.toUpperCase()}</Text>
          <Text style={s.orderDate}>
            {new Date(o.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
        <TouchableOpacity style={s.delBtn} onPress={() => confirmDelete(o)}>
          <Text style={s.delBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      <View style={s.infoGrid}>
        <View style={s.infoItem}>
          <Text style={s.infoLabel}>Customer</Text>
          <Text style={s.infoValue}>{o.name}</Text>
        </View>
        <View style={s.infoItem}>
          <Text style={s.infoLabel}>Phone</Text>
          <Text style={s.infoValue}>{o.phone}</Text>
        </View>
        <View style={[s.infoItem, { flex: 2 }]}>
          <Text style={s.infoLabel}>Address</Text>
          <Text style={s.infoValue}>{o.address}</Text>
        </View>
      </View>

      {(o.items || []).length > 0 && (
        <View style={s.itemsList}>
          {o.items.map((it, idx) => (
            <View key={idx} style={s.itemRow}>
              <Text style={s.itemName}>{it.product} × {it.qty}</Text>
              <Text style={s.itemPrice}>{it.price}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalValue}>Rs.{o.total || '—'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Orders</Text>
        <Text style={s.headerCount}>{orders.length} total</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyText}>No orders yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = (t) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: t.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: t.text },
  headerCount: { fontSize: 13, color: t.muted, backgroundColor: t.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  card:        { backgroundColor: t.cardBg, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 16, marginBottom: 14 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId:     { fontSize: 13, fontWeight: '700', color: t.accent, letterSpacing: 0.5 },
  orderDate:   { fontSize: 12, color: t.muted, marginTop: 2 },
  delBtn:      { backgroundColor: t.red + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  delBtnText:  { color: t.red, fontWeight: '700', fontSize: 12 },
  divider:     { height: 1, backgroundColor: t.border, marginBottom: 12 },
  infoGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  infoItem:    { flex: 1, minWidth: '40%' },
  infoLabel:   { fontSize: 11, color: t.muted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue:   { fontSize: 14, color: t.text, fontWeight: '500' },
  itemsList:   { backgroundColor: t.surface2, borderRadius: 10, padding: 10, marginBottom: 12 },
  itemRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName:    { fontSize: 13, color: t.text },
  itemPrice:   { fontSize: 13, color: t.accent, fontWeight: '600' },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:  { fontSize: 13, color: t.muted },
  totalValue:  { fontSize: 16, fontWeight: '800', color: t.text },
  empty:       { alignItems: 'center', marginTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { color: t.muted, fontSize: 15 },
});
