import React, { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, IconButton, Drawer, TextField, ThemeProvider, createTheme } from "@mui/material";
import { DeleteOutlined, EditOutlined, RefreshOutlined, Close as CloseIcon } from "@mui/icons-material";
import axiosClient from "../api/axios";
import loading from "../assets/images/loading.gif";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ErrorModal from "./ErrorModal";


const theme = createTheme({
  palette: {
    primary: { main: '#7C3AED' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7C3AED' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7C3AED', borderWidth: '1px' },
        },
        notchedOutline: {
          borderColor: '#d1d5db',
          transition: 'border-color 0.3s ease-in-out, border-width 0.3s ease-in-out',
        },
      },
    },
  },
});


const ManagementRoom = () => {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [room, setRoom] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  function resetForm() {
    setRoomName("");
    setRoomCapacity("");
    setIsEditing(false);
    setEditRoomId(null);
  }

  async function fetchRooms() {
    try {
      const res = await axiosClient.get(isArchiveView ? '/rooms/arxive' : '/rooms');
      if (res.status === 200) {
        const data = res.data?.data ?? res.data ?? [];
        startTransition(() => {
          setRoom(Array.isArray(data) ? data : []);
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, [isArchiveView]);

  async function handleSaveRoom() {
    if (!roomName.trim() || !roomCapacity) {
      setErrorModal({ open: true, message: "Iltimos, xona nomi va sig'imini kiriting!" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = { name: roomName, capacity: Number(roomCapacity) };

      let res;
      if (isEditing) {
        res = await axiosClient.patch(`/rooms/${editRoomId}`, payload);
      } else {
        res = await axiosClient.post('/rooms', payload);
      }

      if (res.status === 201 || res.status === 200) {
        setIsDrawerOpen(false);
        resetForm();
        await fetchRooms();
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      setErrorModal({ open: true, message: `Xato: ${error.response?.data?.message || error.message}` });
    } finally {
      setIsSaving(false);
    }
  }

  const handleEditClick = async (id) => {
    try {
      const res = await axiosClient.get(`/rooms/one/${id}`);
      const data = res.data?.data || res.data;
      setRoomName(data.name || "");
      setRoomCapacity(data.capacity || "");
      setEditRoomId(id);
      setIsEditing(true);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Ma'lumotni yuklashda xatolik:", error);
      setErrorModal({ open: true, message: "Xona ma'lumotlarini yuklashda xatolik yuz berdi" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete?.id) return;
    try {
      const res = await axiosClient.delete(`/rooms/${roomToDelete.id}`);
      if (res.status === 200 || res.status === 204) {
        setRoom(prev => prev.filter(r => r.id !== roomToDelete.id));
      }
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      setErrorModal({ open: true, message: "Xonani o'chirishda xatolik yuz berdi!" });
    } finally {
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>
        {/* Page Header */}
        <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', mb: 3 }}>
          Boshqarish
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 4, borderBottom: '1px solid #E5E7EB', mb: 4 }}>
          <Box component="button" onClick={() => navigate("/management/course")}
            sx={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: '#6B7280', pb: 1.5, borderBottom: '3px solid transparent', mb: '-1px', transition: 'color 0.2s', '&:hover': { color: '#7C3AED' } }}>
            Kurslar
          </Box>
          <Box component="button" onClick={() => navigate("/management/room")}
            sx={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#7C3AED', pb: 1.5, borderBottom: '3px solid #7C3AED', mb: '-1px' }}>
            Xonalar
          </Box>
          <Box component="button"
            sx={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: '#6B7280', pb: 1.5, borderBottom: '3px solid transparent', mb: '-1px', transition: 'color 0.2s', '&:hover': { color: '#7C3AED' } }}>
            Xodimlar
          </Box>
        </Box>

        {/* Main Card */}
        {isPending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '480px' }}>
            <img src={loading} alt="loading" width={90} height={90} />
          </Box>
        ) : (
          <Paper sx={{ height: '480px', bgcolor: '#fff', borderRadius: '12px', p: 3, border: '1px solid #f3f4f6', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            {/* Card Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>
                  Xonalar {isArchiveView && <span style={{ color: '#7C3AED', fontSize: '24px' }}>(Arxiv)</span>}
                </Typography>
                <IconButton size="small" onClick={fetchRooms} sx={{ color: '#9ca3af', transition: 'color 0.2s', '&:hover': { color: '#111827' } }}>
                  <RefreshOutlined fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                  variant={isArchiveView ? 'contained' : 'outlined'}
                  onClick={() => setIsArchiveView(!isArchiveView)}
                  sx={{
                    fontWeight: 600, fontSize: '14px', px: 2.5, py: 1,
                    borderRadius: '8px', textTransform: 'none', transition: 'all 0.2s',
                    ...(isArchiveView
                      ? { bgcolor: '#7C3AED', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#5B21B6', boxShadow: 'none' } }
                      : { color: '#333', borderColor: '#e0e0e0', boxShadow: 'none', '&:hover': { borderColor: '#ccc', bgcolor: '#f9f9f9' } }
                    )
                  }}
                >
                  Arxiv
                </Button>
                <Button
                  onClick={() => { resetForm(); setIsDrawerOpen(true); }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#7C3AED',
                    color: '#fff', fontSize: '14px', fontWeight: 600, px: 2.5, py: 1,
                    borderRadius: '8px', textTransform: 'none', transition: 'all 0.2s',
                    boxShadow: '0 4px 14px 0 rgba(124,58,237,0.2)',
                    '&:hover': { bgcolor: '#6D28D9', boxShadow: '0 4px 14px 0 rgba(124,58,237,0.3)' }
                  }}
                >
                  <Typography component="span" sx={{ fontSize: '18px', lineHeight: 1 }}>+</Typography>
                  Xonani qo'shish
                </Button>
              </Box>
            </Box>

            {/* Grid */}
            <Box sx={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2.5,
              maxHeight: '380px', overflowY: 'auto', pr: 1,
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: '#e5e7eb', borderRadius: '10px' },
              '&::-webkit-scrollbar-thumb:hover': { background: '#d1d5db' },
            }}>
              {room.length > 0 ? room.map((r, index) => (
                <Box key={r.id || index}
                  sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
                      {r.name}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                      Sig'imi: {r.capacity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small"
                      onClick={() => { setRoomToDelete(r); setDeleteModalOpen(true); }}
                      sx={{ color: '#ef4444', transition: 'color 0.2s', '&:hover': { color: '#dc2626', bgcolor: '#fee2e2' } }}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small"
                      onClick={() => handleEditClick(r.id)}
                      sx={{ color: '#7C3AED', transition: 'color 0.2s', '&:hover': { color: '#6D28D9', bgcolor: '#ede9fe' } }}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )) : (
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <Typography sx={{ color: '#9CA3AF', fontSize: '15px' }}>Hozircha xonalar mavjud emas</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Drawer */}
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); resetForm(); }}
          sx={{ zIndex: 9999, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 }, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }}>
          {/* Drawer Header */}
          <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
            <IconButton onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              sx={{ position: 'absolute', right: 16, top: 16, color: '#9ca3af', '&:hover': { color: '#111827' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
              {isEditing ? "Xonani tahrirlash" : "Xonani qo'shish"}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
              {isEditing ? "Bu yerda xona ma'lumotlarini tahrirlashingiz mumkin." : "Bu yerda siz yangi xona qo'shishingiz mumkin."}
            </Typography>
          </Box>

          {/* Drawer Body */}
          <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Nomi</Typography>
              <TextField fullWidth placeholder="Xona nomi" size="small"
                value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Sig'imi</Typography>
              <TextField fullWidth placeholder="Masalan: 20" size="small" type="number"
                value={roomCapacity} onChange={(e) => setRoomCapacity(e.target.value)} />
            </Box>
          </Box>

          {/* Drawer Footer */}
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              sx={{ color: '#1f2937', bgcolor: '#fff', border: '1px solid #e5e7eb', textTransform: 'none', px: 3.5, py: 1, borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' } }}>
              Bekor qilish
            </Button>
            <Button onClick={handleSaveRoom} variant="contained" disabled={isSaving}
              sx={{ bgcolor: '#8b5cf6', color: '#fff', textTransform: 'none', px: 4, py: 1, borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#7c3aed', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: '#c4b5fd', color: '#fff' } }}>
              {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </Box>
        </Drawer>

        {/* Delete Modal */}
        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Xonani o'chirish"
          onConfirm={handleDeleteConfirm}
        />

        {/* Error Modal */}
        <ErrorModal
          open={errorModal.open}
          onClose={() => setErrorModal({ ...errorModal, open: false })}
          message={errorModal.message}
        />
      </Box>
    </ThemeProvider>
  );
};

export default ManagementRoom;
