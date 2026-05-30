import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image, Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import { getReviews, deleteReview } from '../utils/api';
import Toast from 'react-native-toast-message';
import ImageViewing from 'react-native-image-viewing';
import { ResizeMode, Video } from 'expo-av';

// ── Themed confirm dialog ──
function ConfirmModal({ visible, theme, title, message, onCancel, onConfirm }) {
  const s = confirmStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.box}>
          <View style={s.topBar} />
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          <View style={s.btnRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmBtn} onPress={onConfirm}>
              <Text style={s.confirmText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const confirmStyles = (t) => StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  box:        { backgroundColor: t.modalBg, borderRadius: 20, width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: t.border },
  topBar:     { height: 4, width: '100%', backgroundColor: t.red },
  title:      { fontSize: 18, fontWeight: '800', color: t.text, marginTop: 20, marginHorizontal: 20 },
  message:    { fontSize: 14, color: t.textSecondary, marginTop: 8, marginHorizontal: 20, lineHeight: 20, marginBottom: 24 },
  btnRow:     { flexDirection: 'row', borderTopWidth: 1, borderTopColor: t.border },
  cancelBtn:  { flex: 1, paddingVertical: 16, alignItems: 'center' },
  cancelText: { color: t.muted, fontWeight: '600', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: t.red },
  confirmText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
});

const STARS = (rating) =>
  '★'.repeat(rating) + '☆'.repeat(5 - rating);

export default function ReviewsScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const s = styles(theme);

  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [viewerOpen,   setViewerOpen]   = useState(false);
  const [viewerImg,    setViewerImg]    = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      Toast.show({ type: 'error', text1: 'Could not load reviews' });
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteReview(deleteTarget.id, token);
      if (res.success) {
        Toast.show({ type: 'success', text1: '✓ Review deleted' });
        load();
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Delete failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Network error' });
    }
    setDeleteTarget(null);
  };

  const renderItem = ({ item: r }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarText}>{r.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={s.metaCol}>
          <Text style={s.reviewName}>{r.name}</Text>
          <Text style={s.stars}>{STARS(r.rating)}</Text>
          <Text style={s.reviewDate}>
            {new Date(r.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
        <TouchableOpacity style={s.delBtn} onPress={() => setDeleteTarget(r)}>
          <Text style={s.delBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.reviewText}>"{r.text}"</Text>

      {r.mediaUrl && r.mediaType === 'image' && (
        <TouchableOpacity
          onPress={() => { setViewerImg(r.mediaUrl); setViewerOpen(true); }}
        >
          <Image source={{ uri: r.mediaUrl }} style={s.mediaImg} resizeMode="cover" />
        </TouchableOpacity>
      )}
      {r.mediaUrl && r.mediaType === 'video' && (
        <Video
          source={{ uri: r.mediaUrl }}
          style={s.mediaVideo}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
        />
      )}
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
        <Text style={s.headerTitle}>Reviews</Text>
        <Text style={s.headerCount}>{reviews.length} total</Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>💬</Text>
            <Text style={s.emptyText}>No reviews yet</Text>
          </View>
        }
      />

      <ConfirmModal
        visible={!!deleteTarget}
        theme={theme}
        title="Delete Review"
        message={`Delete review from ${deleteTarget?.name}? This will also remove any attached media.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ImageViewing
        images={[{ uri: viewerImg }]}
        imageIndex={0}
        visible={viewerOpen}
        onRequestClose={() => setViewerOpen(false)}
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
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  avatarCircle:{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent + '33', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: t.accent, fontSize: 18, fontWeight: '800' },
  metaCol:     { flex: 1 },
  reviewName:  { fontSize: 15, fontWeight: '700', color: t.text },
  stars:       { fontSize: 13, color: t.yellow, letterSpacing: 1, marginVertical: 2 },
  reviewDate:  { fontSize: 12, color: t.muted },
  delBtn:      { backgroundColor: t.red + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  delBtnText:  { color: t.red, fontWeight: '700', fontSize: 12 },
  reviewText:  { fontSize: 14, color: t.textSecondary, lineHeight: 20, fontStyle: 'italic', marginBottom: 12 },
  mediaImg:    { width: '100%', height: 180, borderRadius: 12 },
  mediaVideo:  { width: '100%', height: 200, borderRadius: 12 },
  empty:       { alignItems: 'center', marginTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { color: t.muted, fontSize: 15 },
});
