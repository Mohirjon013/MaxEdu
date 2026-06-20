import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Avatar, CircularProgress,
  Chip, Slider, TextField, IconButton
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MicIcon from '@mui/icons-material/Mic';
import axiosClient from '../api/axios';
import Loader from './Loader';
import ErrorModal from './ErrorModal';

function HomeworkCheck() {
  const { id, hwId, studentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState(null);
  const [result, setResult] = useState(null);

  const [score, setScore] = useState(60);
  const [comment, setComment] = useState('');
  const [teacherFile, setTeacherFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch homework description first to get lesson_id
        const hwResponse = await axiosClient.get(`/homework/${id}`);
        const hwData = hwResponse.data?.data || hwResponse.data || [];
        const hwList = Array.isArray(hwData) ? hwData : [];
        const currentHw = hwList.find(h => String(h.id) === String(hwId) || (h.homework && h.homework.some(hw => String(hw.id) === String(hwId))));
        setHomework(currentHw);

        let lessonId = currentHw?.lesson_id || currentHw?.lesson?.id || '';
        if (!lessonId && currentHw?.homework) {
          lessonId = currentHw.id; // currentHw is actually the lesson object
        }

        // Fetch specific student's result using correct endpoint
        const resResult = await axiosClient.get(`/group/${id}/lesson/${lessonId}/homework/${hwId}/student/${studentId}`);
        const resultData = resResult.data?.data || resResult.data;
        setResult(resultData);

      } catch (err) {
        console.error("Ma'lumotni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, hwId, studentId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month}, ${year} ${h}:${m}`;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTeacherFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        grade: score,
        title: comment,
        homework_answer_id: Number(result?.id)
      };

      await axiosClient.post(`/group/${id}/homework/${hwId}/check`, payload);
      navigate(-1);
    } catch (error) {
      console.error(error);
      setErrorModal({ open: true, message: `Saqlashda xatolik yuz berdi: ${error.response?.data?.message || error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  // Parsing student files safely
  let studentFiles = [];
  if (result?.file) {
    if (Array.isArray(result.file)) {
      studentFiles = result.file;
    } else if (typeof result.file === 'string') {
      studentFiles = result.file.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // URL formatter for images
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://najot-edu.softwareengineer.uz/files/files/${path}`;
  };

  return (
    <Box sx={{ fontFamily: 'Roboto, sans-serif', pb: 4, maxWidth: '800px' }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <Typography
          onClick={() => navigate(-1)}
          sx={{ fontWeight: 600, fontSize: '18px', color: '#111827', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
        >
          Kutayotganlar
        </Typography>
        <ArrowBackIosNewIcon sx={{ fontSize: '12px', color: '#64748b' }} />
        <Typography sx={{ fontSize: '18px', color: '#64748b' }}>
          Uyga vazifa
        </Typography>
      </Box>


      {/* Student Submission Box */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', bgcolor: '#f8fafc' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#334155', mb: 3 }}>
          {result?.students?.full_name || result?.student?.full_name || "O'quvchi ismi"}
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, mb: 3, bgcolor: '#fff', p: 2.5, borderRadius: '8px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 0.5, fontWeight: 500 }}>Vaqti:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>
              {formatDate(result?.created_at || new Date().toISOString())}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 0.5, fontWeight: 500 }}>Fayllar soni:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{studentFiles.length}</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 0.5, fontWeight: 500 }}>Status:</Typography>
            <Chip
              label={
                result?.status === 'PENDING' ? 'Kutayabti' : 
                result?.status === 'ACCEPTED' ? 'Qabul qilingan' : 
                result?.status === 'REJECTED' ? 'Qaytarilgan' : 
                (result?.status || 'Kutayabti')
              }
              sx={{ 
                bgcolor: result?.status === 'ACCEPTED' ? '#d1fae5' : result?.status === 'REJECTED' ? '#fef3c7' : '#f3f0ff', 
                color: result?.status === 'ACCEPTED' ? '#059669' : result?.status === 'REJECTED' ? '#d97706' : '#7C3AED', 
                fontWeight: 600, borderRadius: '4px', height: '24px', fontSize: '13px' 
              }}
            />
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <Typography sx={{ fontWeight: 500, color: '#94a3b8', fontSize: '14px', mb: 2 }}>
            Fayl: <span style={{ color: '#111827', fontWeight: 600 }}>{studentFiles.length}</span>
          </Typography>

          {studentFiles.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {studentFiles.map((file, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={getImageUrl(file)}
                  alt={`file-${idx}`}
                  sx={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                  onClick={() => window.open(getImageUrl(file), '_blank')}
                />
              ))}
            </Box>
          )}

          <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <Typography sx={{ color: '#64748b', fontSize: '13px', mb: 1 }}>Uyga vazifa izohi:</Typography>
            {result?.title && result.title.startsWith('http') ? (
              <a href={result.title} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '15px', fontWeight: 500, textDecoration: 'none', wordBreak: 'break-all' }}>
                {result.title}
              </a>
            ) : (
              <Typography sx={{ color: '#3b82f6', fontSize: '15px', fontWeight: 500, wordBreak: 'break-word' }}>
                {result?.title || 'Izoh kiritilmagan'}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Grade Submission Box */}
      {result?.status === 'ACCEPTED' || result?.status === 'REJECTED' || result?.status === 'Qabul qilingan' || result?.status === 'Qaytarilgan' ? (
        <Paper sx={{ p: 4, borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '18px', mb: 2 }}>
            Tekshirilgan
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '14px', mb: 3 }}>
            Ushbu uyga vazifa tekshirilgan va unga baho berilgan. Dastlabki holatini faqat ko'rishingiz mumkin, o'zgartirish kiritish imkonsiz.
          </Typography>

          <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid #e5e7eb' }}>
            {(() => {
              const teacherGrade = result?.result?.grade ?? result?.check?.grade ?? result?.homework_result?.grade ?? result?.grade ?? result?.score;
              const teacherComment = result?.result?.title || result?.result?.comment || result?.check?.title || result?.check?.comment || result?.homework_result?.title || result?.homework_result?.comment || result?.teacher_comment;
              
              return (
                <Box>
                  <Typography sx={{ color: '#111827', fontSize: '16px', fontWeight: 600, mb: 1 }}>
                    O'qituvchi izohi:
                  </Typography>
                  <Typography sx={{ color: '#3b82f6', fontSize: '15px', fontWeight: 500, mb: 3, wordBreak: 'break-word' }}>
                    {teacherComment || "Izoh mavjud emas"}
                  </Typography>

                  {teacherGrade !== undefined && teacherGrade !== null && (
                    <Typography sx={{ color: '#111827', fontSize: '16px', fontWeight: 600 }}>
                      Qo'yilgan ball: <span style={{ color: '#7C3AED' }}>{teacherGrade}</span>
                    </Typography>
                  )}
                </Box>
              );
            })()}
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          {/* Info Alert */}
          <Box sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', p: 2, borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 4 }}>
            <InfoIcon sx={{ color: '#3b82f6', mt: 0.2 }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1e40af' }}>
              60-100 oraliq'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oraliq'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
            </Typography>
          </Box>

          {/* Ball Slider */}
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '16px', mb: 3 }}>Ball</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5, px: 1 }}>
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Slider
                value={score}
                onChange={(e, val) => setScore(val)}
                min={0} max={100}
                sx={{
                  color: '#7C3AED',
                  height: 8,
                  '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #7C3AED', width: 24, height: 24 },
                  '& .MuiSlider-track': { border: 'none' },
                  '& .MuiSlider-rail': { bgcolor: '#e2e8f0', opacity: 1 }
                }}
              />
              <Typography sx={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                O'tish bali
              </Typography>
            </Box>
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', width: '64px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#111827', fontSize: '16px' }}>
              {score}
            </Box>
          </Box>

          {/* File Upload Box */}
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '16px', mb: 2 }}>Fayllar</Typography>
          <Box
            sx={{
              border: '1.5px dashed #7C3AED',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              mb: 4,
              cursor: 'pointer',
              bgcolor: '#f5f3ff',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: '#ede9fe' }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUploadIcon sx={{ fontSize: '48px', color: '#7C3AED', mb: 1 }} />
            <Typography sx={{ color: '#111827', fontWeight: 500, fontSize: '15px', mb: 1 }}>
              {teacherFile ? teacherFile.name : "Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling"}
            </Typography>
            {!teacherFile && (
              <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                .jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin
              </Typography>
            )}
            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />
          </Box>

          {/* Comment Textarea */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Izohingiz"
              value={comment}
              onChange={e => setComment(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
                  paddingBottom: '40px'
                }
              }}
            />
            <Box sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: '#7C3AED', borderRadius: '50%', p: 0.5, display: 'flex', cursor: 'pointer' }}>
              <MicIcon sx={{ color: '#fff', fontSize: '20px' }} />
            </Box>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                color: '#64748b',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                bgcolor: '#7C3AED',
                color: '#fff',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#6D28D9', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#c4b5fd', color: '#fff' }
              }}
            >
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Yuborish'}
            </Button>
          </Box>
        </Paper>
      )}

      <ErrorModal
        open={errorModal.open}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
        message={errorModal.message}
      />
    </Box>
  );
}

export default HomeworkCheck;
