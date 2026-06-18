import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Divider, Avatar, Chip } from '@mui/material';
import axiosClient from '../api/axios';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import ErrorModal from '../components/ErrorModal';

const formatDate = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axiosClient.get('/teachers/my/profile');
        setProfile(res.data?.data || res.data || {});
      } catch (error) {
        console.error(error);
        setErrorModal({ open: true, message: 'Profil ma\'lumotlarini yuklashda xatolik yuz berdi.' });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#7C3AED' }} />
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: '30px', mb: 4 }}>
        Profil
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>

        {/* LEFT CARD */}
        <Paper elevation={0} sx={{
          width: { xs: '100%', md: '280px' },
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          position: 'relative',
          border: '1px solid #f3f4f6'
        }}>
          {/* Purple Top Background */}
          <Box sx={{ height: '120px', backgroundColor: '#7C3AED', position: 'relative' }}>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pb: 4, mt: '-60px', position: 'relative', zIndex: 1 }}>
            <Avatar
              src={profile.photo ? (profile.photo.startsWith('http') ? profile.photo : `https://najot-edu.softwareengineer.uz/files/${profile.photo}`) : ''}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid #fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                bgcolor: '#f3f4f6',
                color: '#7C3AED',
                fontSize: '40px',
                fontWeight: 700
              }}
            >
              {(profile.full_name || 'T').charAt(0).toUpperCase()}
            </Avatar>

            <Typography sx={{ mt: 2, fontSize: '20px', fontWeight: 700, color: '#111827' }}>
              {profile.full_name || 'Ism kiritilmagan'}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#6b7280', mt: 0.5 }}>
              O'qituvchi
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT CARD */}
        <Paper elevation={0} sx={{
          flex: 1,
          borderRadius: '16px',
          p: { xs: 3, md: 4 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #f3f4f6'
        }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#111827', mb: 3 }}>
            Shaxsiy ma'lumotlar
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {/* Email */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <MailOutlineIcon sx={{ color: '#7C3AED', mt: 0.2, fontSize: '20px' }} />
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#9ca3af', mb: 0.5 }}>Email</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                  {profile.email || 'Kiritilmagan'}
                </Typography>
              </Box>
            </Box>

            {/* Telefon */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <LocalPhoneOutlinedIcon sx={{ color: '#7C3AED', mt: 0.2, fontSize: '20px' }} />
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#9ca3af', mb: 0.5 }}>Telefon raqam</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                  {profile.phone_number || profile.phone || 'Kiritilmagan'}
                </Typography>
              </Box>
            </Box>

            {/* Manzil */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <LocationOnOutlinedIcon sx={{ color: '#7C3AED', mt: 0.2, fontSize: '20px' }} />
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#9ca3af', mb: 0.5 }}>Manzil</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                  {profile.address || 'Tashkent'}
                </Typography>
              </Box>
            </Box>

            {/* Sana */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <CalendarTodayOutlinedIcon sx={{ color: '#7C3AED', mt: 0.2, fontSize: '20px' }} />
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#9ca3af', mb: 0.5 }}>Ro'yxatdan o'tgan sana</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                  {formatDate(profile.created_at || profile.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 4, borderColor: '#f3f4f6' }} />

          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#111827', mb: 2 }}>
            Guruhlar
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {profile.groups && profile.groups.length > 0 ? (
              profile.groups.map((group, idx) => (
                <Chip
                  key={idx}
                  icon={<GroupsIcon sx={{ fontSize: '16px !important', color: '#7C3AED' }} />}
                  label={typeof group === 'string' ? group : (group.name || `Guruh ${idx + 1}`)}
                  sx={{
                    bgcolor: '#f3e8ff',
                    color: '#7C3AED',
                    fontWeight: 700,
                    borderRadius: '8px',
                    px: 1,
                    py: 2,
                    fontSize: '14px',
                    '& .MuiChip-icon': { color: '#7C3AED' }
                  }}
                />
              ))
            ) : (
              <Typography sx={{ color: '#9ca3af', fontSize: '14px' }}>Guruhlar topilmadi</Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <ErrorModal
        open={errorModal.open}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
        message={errorModal.message}
      />
    </Box>
  );
}
