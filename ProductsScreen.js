import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, ActivityIndicator, Modal, ScrollView,
  RefreshControl, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import {
  getProducts, addProducts, editProduct,
  deleteProduct, uploadFile,
} from '../utils/api';
import Toast from 'react-native-toast-message';
import ImageViewing from 'react-native-image-viewing';

const CATEGORIES = [
  { label: 'Mugs',        value: 'mugs' },
  { label: 'T-Shirts',    value: 'tshirts' },
  { label: 'Caps',        value: 'caps' },
  { label: 'Home Decor',  value: 'homeDecor' },
  { label: 'Phone Covers',value: 'covers' },
  { label: 'Accessories', value: 'accessories' },
];

const EMPTY_FORM = {
  name: '', price: '', description: '',
  category: 'mugs', badge: '', imageUrl: '',
};

export default function ProductsScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const s = styles(theme);

  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [addModal,    setAddModal]    = useState(false);
  const [editModal,   setEditModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [viewerOpen,  setViewerOpen]  = useState(false);
  const [viewerImage, setViewerImage] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      Toast.show({ type: 'error', text1: 'Could not load products' });
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  // ── IMAGE PICK & UPLOAD ──
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const res = await uploadFile(
        { uri: asset.uri, name: `product_${Date.now()}.jpg`, mimeType: 'image/jpeg' },
        'products', token
      );
      if (res.url) {
        setForm(f => ({ ...f, imageUrl: res.url }));
        Toast.show({ type: 'success', text1: 'Image uploaded!' });
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Upload failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Upload failed' });
    }
    setUploading(false);
  };

  // ── ADD PRODUCT ──
  const handleAdd = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      Toast.show({ type: 'error', text1: 'Name and price are required' });
      return;
    }
    setSaving(true);
    try {
      const res = await addProducts([{
        name:        form.name.trim(),
        price:       form.price.trim(),
        description: form.description.trim(),
        category:    form.category,
        badge:       form.badge.trim(),
        imageUrl:    form.imageUrl.trim(),
      }], token);
      if (res.success) {
        Toast.show({ type: 'success', text1: `✓ Product added!` });
        setAddModal(false);
        setForm(EMPTY_FORM);
        load();
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Save failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Network error' });
    }
    setSaving(false);
  };

  // ── OPEN EDIT ──
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      name:        p.name || '',
      price:       p.price || '',
      description: p.description || '',
      category:    p.category || 'mugs',
      badge:       p.badge || '',
      imageUrl:    p.imageUrl || '',
    });
    setEditModal(true);
  };

  // ── SAVE EDIT ──
  const handleEdit = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      Toast.show({ type: 'error', text1: 'Name and price are required' });
      return;
    }
    setSaving(true);
    try {
      const res = await editProduct(editTarget.id, {
        name:        form.name.trim(),
        price:       form.price.trim(),
        description: form.description.trim(),
        category:    form.category,
        badge:       form.badge.trim(),
        imageUrl:    form.imageUrl.trim(),
      }, token);
      if (res.success) {
        Toast.show({ type: 'success', text1: '✓ Product updated!' });
        setEditModal(false);
        setEditTarget(null);
        setForm(EMPTY_FORM);
        load();
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Update failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Network error' });
    }
    setSaving(false);
  };

  // ── DELETE ──
  const confirmDelete = (p) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${p.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteProduct(p.id, token);
              if (res.success) {
                Toast.show({ type: 'success', text1: '✓ Product deleted' });
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

  // ── PRODUCT FORM (shared for add & edit) ──
  const renderForm = () => (
    <ScrollView style={s.formScroll} showsVerticalScrollIndicator={false}>
      <Text style={s.fieldLabel}>Product Name *</Text>
      <TextInput
        style={s.input} placeholder="e.g. Custom Ceramic Mug"
        placeholderTextColor={theme.muted} value={form.name}
        onChangeText={v => setForm(f => ({ ...f, name: v }))}
      />

      <Text style={s.fieldLabel}>Price *</Text>
      <TextInput
        style={s.input} placeholder="Rs.249"
        placeholderTextColor={theme.muted} value={form.price}
        onChangeText={v => setForm(f => ({ ...f, price: v }))}
      />

      <Text style={s.fieldLabel}>Description</Text>
      <TextInput
        style={[s.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Product description..." placeholderTextColor={theme.muted}
        multiline value={form.description}
        onChangeText={v => setForm(f => ({ ...f, description: v }))}
      />

      <Text style={s.fieldLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.value}
            style={[s.catChip, form.category === c.value && s.catChipActive]}
            onPress={() => setForm(f => ({ ...f, category: c.value }))}
          >
            <Text style={[s.catChipText, form.category === c.value && s.catChipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.fieldLabel}>Badge (optional)</Text>
      <TextInput
        style={s.input} placeholder="POPULAR / NEW / BESTSELLER"
        placeholderTextColor={theme.muted} value={form.badge}
        onChangeText={v => setForm(f => ({ ...f, badge: v }))}
      />

      <Text style={s.fieldLabel}>Product Image</Text>
      <TextInput
        style={s.input} placeholder="Paste image URL..."
        placeholderTextColor={theme.muted} value={form.imageUrl}
        onChangeText={v => setForm(f => ({ ...f, imageUrl: v }))}
      />

      <TouchableOpacity
        style={[s.uploadBtn, uploading && { opacity: 0.6 }]}
        onPress={pickImage} disabled={uploading}
      >
        {uploading
          ? <ActivityIndicator color={theme.accent} size="small" />
          : <Text style={s.uploadBtnText}>📷 Upload from Gallery</Text>
        }
      </TouchableOpacity>

      {!!form.imageUrl && (
        <Image
          source={{ uri: form.imageUrl }}
          style={s.previewImg}
          resizeMode="cover"
        />
      )}
    </ScrollView>
  );

  // ── PRODUCT CARD ──
  const renderItem = ({ item }) => (
    <View style={s.card}>
      <TouchableOpacity
        onPress={() => { setViewerImage(item.imageUrl); setViewerOpen(true); }}
        disabled={!item.imageUrl}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
          style={s.cardImg}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View style={s.cardInfo}>
        <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={s.cardPrice}>{item.price}</Text>
        <View style={s.cardRow}>
          <View style={s.catTag}>
            <Text style={s.catTagText}>{item.category}</Text>
          </View>
          {!!item.badge && (
            <View style={s.badgeTag}>
              <Text style={s.badgeTagText}>{item.badge}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.editBtn} onPress={() => openEdit(item)}>
          <Text style={s.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.delBtn} onPress={() => confirmDelete(item)}>
          <Text style={s.delBtnText}>Del</Text>
        </TouchableOpacity>
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
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Products</Text>
        <Text style={s.headerCount}>{products.length} total</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyText}>No products yet</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => { setForm(EMPTY_FORM); setAddModal(true); }}>
        <Text style={s.fabText}>+ Add</Text>
      </TouchableOpacity>

      {/* ADD MODAL */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Product</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {renderForm()}
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleAdd} disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveBtnText}>Save Product</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {renderForm()}
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleEdit} disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveBtnText}>Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* IMAGE VIEWER */}
      <ImageViewing
        images={[{ uri: viewerImage }]}
        imageIndex={0}
        visible={viewerOpen}
        onRequestClose={() => setViewerOpen(false)}
      />
    </View>
  );
}

const styles = (t) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: t.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: t.text },
  headerCount:  { fontSize: 13, color: t.muted, backgroundColor: t.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  card:         { backgroundColor: t.cardBg, borderRadius: 16, borderWidth: 1, borderColor: t.border, flexDirection: 'row', marginBottom: 12, overflow: 'hidden' },
  cardImg:      { width: 90, height: 90 },
  cardInfo:     { flex: 1, padding: 12 },
  cardName:     { fontSize: 14, fontWeight: '700', color: t.text, marginBottom: 4 },
  cardPrice:    { fontSize: 14, fontWeight: '700', color: t.accent, marginBottom: 6 },
  cardRow:      { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  catTag:       { backgroundColor: t.surface2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  catTagText:   { fontSize: 11, color: t.muted },
  badgeTag:     { backgroundColor: t.accent + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTagText: { fontSize: 11, color: t.accent, fontWeight: '700' },
  cardActions:  { flexDirection: 'column', justifyContent: 'center', gap: 8, padding: 10 },
  editBtn:      { backgroundColor: t.surface2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: t.border },
  editBtnText:  { color: t.text, fontSize: 12, fontWeight: '600' },
  delBtn:       { backgroundColor: t.red + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  delBtnText:   { color: t.red, fontSize: 12, fontWeight: '700' },
  fab:          { position: 'absolute', bottom: 90, right: 20, backgroundColor: t.accent, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 14, elevation: 6 },
  fabText:      { color: '#fff', fontWeight: '800', fontSize: 15 },
  empty:        { alignItems: 'center', marginTop: 60 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { color: t.muted, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox:     { backgroundColor: t.modalBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', padding: 24 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 20, fontWeight: '800', color: t.text },
  modalClose:   { fontSize: 20, color: t.muted, padding: 4 },
  formScroll:   { maxHeight: 480 },
  fieldLabel:   { fontSize: 13, fontWeight: '600', color: t.textSecondary, marginBottom: 6 },
  input:        { backgroundColor: t.inputBg, borderWidth: 1.5, borderColor: t.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: t.text, fontSize: 14, marginBottom: 16 },
  catChip:      { backgroundColor: t.surface2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: t.border },
  catChipActive:{ backgroundColor: t.accent, borderColor: t.accent },
  catChipText:  { color: t.muted, fontSize: 13 },
  catChipTextActive: { color: '#fff', fontWeight: '700' },
  uploadBtn:    { borderWidth: 1.5, borderColor: t.accent, borderRadius: 12, borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  uploadBtnText:{ color: t.accent, fontWeight: '600', fontSize: 14 },
  previewImg:   { width: '100%', height: 160, borderRadius: 12, marginBottom: 16 },
  saveBtn:      { backgroundColor: t.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:  { color: '#fff', fontWeight: '700', fontSize: 16 },
});
