import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Modal, Select, MenuItem, TextField } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import axiosClient from '../api/axios';

const getVideoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = axiosClient.defaults?.baseURL ? axiosClient.defaults.baseURL.replace('/api/v1', '') : '';
  return `${base}/files/files/${url}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const year = date.getFullYear();
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${year} ${hours}:${minutes}`;
};

const formatDateOnly = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const year = date.getFullYear();
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const month = months[date.getMonth()];
  return `${day} ${month}, ${year}`;
};

const calculateDeadline = (dateString, hours = 20) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  date.setHours(date.getHours() + hours);
  return date;
};

function GroupLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeLessonTab, setActiveLessonTab] = useState('Uyga vazifa');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openAddVideoModal, setOpenAddVideoModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [groupLessons, setGroupLessons] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    async function fetchLessons() {
      if (activeLessonTab === 'Uyga vazifa') {
        setLoading(true);
        try {
          const res = await axiosClient.get(`/homework/${id}`);
          const data = res.data?.data || res.data || [];
          setLessons(Array.isArray(data) ? data : [data]);
        } catch (error) {
          console.error("Homework yuklashda xatolik:", error);
          setLessons([]);
        } finally {
          setLoading(false);
        }
      } else if (activeLessonTab === 'Videolar') {
        setLoading(true);
        try {
          const res = await axiosClient.get(`/files/${id}`);
          const data = res.data?.data || res.data || [];
          setLessons(Array.isArray(data) ? data : [data]);
        } catch (error) {
          console.error("Videolarni yuklashda xatolik:", error);
          setLessons([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLessons([]);
      }
    }
    fetchLessons();
  }, [id, activeLessonTab, refreshKey]);

  useEffect(() => {
    if (openAddVideoModal && groupLessons.length === 0) {
      async function fetchGroupLessons() {
        try {
          const res = await axiosClient.get(`/lessons/my/group/${id}`);
          const data = res.data?.data || res.data || [];
          setGroupLessons(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Darslarni yuklashda xatolik:", err);
        }
      }
      fetchGroupLessons();
    }
  }, [openAddVideoModal, id, groupLessons.length]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        file,
        fileName: file.name,
        videoName: file.name,
        lessonId: ''
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = null;
  };

  const updateFile = (fileId, field, value) => {
    setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, [field]: value } : f));
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    const invalidFiles = selectedFiles.filter(f => !f.lessonId);
    if (invalidFiles.length > 0) {
      alert("Iltimos, barcha fayllar uchun darsni tanlang!");
      return;
    }

    setUploadLoading(true);
    try {
      for (const fileObj of selectedFiles) {
        const formData = new FormData();
        const renamedFile = new File([fileObj.file], fileObj.videoName || fileObj.fileName, { type: fileObj.file.type });
        formData.append('file', renamedFile);

        await axiosClient.post(`/files/group/${id}/upload`, formData, {
          params: { lessonId: fileObj.lessonId },
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setOpenAddVideoModal(false);
      setSelectedFiles([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Yuklashda xatolik:", error);
      alert("Fayllarni yuklashda xatolik yuz berdi.");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Guruh darsliklari</Typography>
          <Box sx={{ display: 'flex', bgcolor: '#f8fafc', borderRadius: '8px', p: 0.5 }}>
            {['Uyga vazifa', 'Videolar', 'Imtihonlar', 'Jurnal'].map(tab => (
              <Button
                key={tab}
                onClick={() => setActiveLessonTab(tab)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: activeLessonTab === tab ? '#111827' : '#64748b',
                  bgcolor: activeLessonTab === tab ? '#fff' : 'transparent',
                  boxShadow: activeLessonTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  borderRadius: '6px',
                  px: 3,
                  py: 0.75,
                  minWidth: '100px',
                  '&:hover': {
                    bgcolor: activeLessonTab === tab ? '#fff' : '#f1f5f9',
                  }
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>
        </Box>
        <Button
          onClick={() => {
            if (activeLessonTab === 'Videolar') {
              setOpenAddVideoModal(true);
            } else {
              navigate(`/dashboard/groups/${id}/homework/create`);
            }
          }}
          variant="contained"
          sx={{
            bgcolor: '#10b981',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '15px',
            borderRadius: '10px',
            px: 3.5,
            py: 0.8,
            boxShadow: '0px 1px 3px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#059669',
              boxShadow: '0px 2px 4px rgba(16, 185, 129, 0.5)',
            },
            '&:active': {
              boxShadow: '0px 2px 3px rgba(16, 185, 129, 0.4)',
            }
          }}
        >
          Qo'shish
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            {activeLessonTab === 'Uyga vazifa' && (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>#</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Mavzu</TableCell>
                    <TableCell align="center" sx={{ color: '#94a3b8', py: 2, borderBottom: '1px solid #e2e8f0' }}><PersonOutlinedIcon fontSize="small" /></TableCell>
                    <TableCell align="center" sx={{ color: '#f59e0b', py: 2, borderBottom: '1px solid #e2e8f0' }}><TimerOutlinedIcon fontSize="small" /></TableCell>
                    <TableCell align="center" sx={{ color: '#10b981', py: 2, borderBottom: '1px solid #e2e8f0' }}><CheckCircleOutlinedIcon fontSize="small" /></TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Berilgan vaqt</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Tugash vaqti</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Dars sanasi</TableCell>
                    <TableCell align="right" sx={{ color: '#64748b', fontWeight: 600, py: 2, borderBottom: '1px solid #e2e8f0' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={30} sx={{ color: '#7C3AED' }} />
                      </TableCell>
                    </TableRow>
                  ) : lessons.length > 0 ? (
                    lessons.map((lesson, index) => (
                      <TableRow 
                        key={lesson.id || index} 
                        onClick={() => navigate(`/dashboard/groups/${id}/homework/${lesson.id}`)}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                      >
                        <TableCell sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{index + 1}</TableCell>
                        <TableCell sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.topic || '—'}</TableCell>
                        <TableCell align="center" sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.existStudentsIngroup || 0}</TableCell>
                        <TableCell align="center" sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.homeworkPending || 0}</TableCell>
                        <TableCell align="center" sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.homeworkAccept || 0}</TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDate(lesson.homework?.[0]?.created_at || lesson.created_at)}</TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDate(lesson.deadline || calculateDeadline(lesson.homework?.[0]?.created_at || lesson.created_at, 20))}</TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDateOnly(lesson.created_at)}</TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                          <IconButton size="small" sx={{ color: '#94a3b8' }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ color: '#64748b', py: 3, fontSize: '14px' }}>
                        Hozircha ma'lumot yo'q.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}

            {activeLessonTab === 'Videolar' && (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>#</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Video nomi</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Dars nomi</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Status</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Dars sanasi</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Hajmi</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Qo'shilgan vaqti</TableCell>
                    <TableCell align="right" sx={{ color: '#64748b', fontWeight: 600, py: 2, borderBottom: '1px solid #e2e8f0' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={30} sx={{ color: '#7C3AED' }} />
                      </TableCell>
                    </TableRow>
                  ) : lessons.length > 0 ? (
                    lessons.map((video, index) => (
                      <TableRow key={video.id || index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{index + 1}</TableCell>
                        <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                          <Box
                            onClick={() => setSelectedVideo(video)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover p': { textDecoration: 'underline' } }}
                          >
                            <PlayCircleOutlineIcon sx={{ color: '#3b82f6', fontSize: '20px' }} />
                            <Typography sx={{ color: '#3b82f6', fontWeight: 600, fontSize: '14px' }}>
                              {video.originalName || video.original_name || video.video_url || '—'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{video.lesson?.topic || '—'}</TableCell>
                        <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                          <Box sx={{ bgcolor: '#dcfce7', color: '#16a34a', px: 1.5, py: 0.5, borderRadius: '20px', display: 'inline-block', fontSize: '12px', fontWeight: 600 }}>
                            Tayyor
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDateOnly(video.lesson?.created_at || video.created_at)}</TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{video.size_mb ? `${Number(video.size_mb).toFixed(2)} MB` : '—'}</TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDateOnly(video.created_at)}</TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                          <IconButton size="small" sx={{ color: '#94a3b8' }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ color: '#64748b', py: 3, fontSize: '14px' }}>
                        Hozircha ma'lumot yo'q.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}

            {activeLessonTab !== 'Uyga vazifa' && activeLessonTab !== 'Videolar' && (
              <TableBody>
                <TableRow>
                  <TableCell align="center" colSpan={8} sx={{ color: '#64748b', py: 3, fontSize: '14px' }}>
                    Tez orada ishga tushadi...
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>

      {/* Video Modal */}
      <Modal open={!!selectedVideo} onClose={() => setSelectedVideo(null)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ bgcolor: '#0f172a', borderRadius: '12px', overflow: 'hidden', width: '90%', maxWidth: '900px', outline: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #1e293b' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PlayCircleOutlineIcon sx={{ color: '#3b82f6', fontSize: '20px' }} />
              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                {selectedVideo?.originalName || selectedVideo?.original_name || selectedVideo?.video_url}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setSelectedVideo(null)} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ width: '100%', bgcolor: '#000', display: 'flex', justifyContent: 'center', maxHeight: '65vh' }}>
            {selectedVideo && (
              <video
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '65vh', outline: 'none' }}
                src={getVideoUrl(selectedVideo.video_url)}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, p: 2, borderTop: '1px solid #1e293b', bgcolor: '#1e293b', flexWrap: 'wrap' }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
              <Box component="span" sx={{ color: '#64748b', fontWeight: 600, mr: 0.5 }}>Fayl:</Box>
              <Box component="span" sx={{ color: '#f8fafc', fontWeight: 500 }}>{selectedVideo?.originalName || selectedVideo?.original_name || selectedVideo?.video_url}</Box>
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
              <Box component="span" sx={{ color: '#64748b', fontWeight: 600, mr: 0.5 }}>Hajmi:</Box>
              <Box component="span" sx={{ color: '#f8fafc', fontWeight: 500 }}>{selectedVideo?.size_mb ? `${Number(selectedVideo.size_mb).toFixed(2)} MB` : '—'}</Box>
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
              <Box component="span" sx={{ color: '#64748b', fontWeight: 600, mr: 0.5 }}>Dars:</Box>
              <Box component="span" sx={{ color: '#f8fafc', fontWeight: 500 }}>{selectedVideo?.lesson?.topic || '—'}</Box>
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
              <Box component="span" sx={{ color: '#64748b', fontWeight: 600, mr: 0.5 }}>Sana:</Box>
              <Box component="span" sx={{ color: '#f8fafc', fontWeight: 500 }}>{formatDateOnly(selectedVideo?.created_at)}</Box>
            </Typography>
          </Box>
        </Box>
      </Modal>

      {/* Add Video Modal */}
      <Modal open={openAddVideoModal} onClose={() => setOpenAddVideoModal(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ bgcolor: '#fff', borderRadius: '12px', overflow: 'hidden', width: '90%', maxWidth: '800px', outline: 'none', p: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#111827' }}>
              Qo'shish
            </Typography>
            <IconButton size="small" onClick={() => setOpenAddVideoModal(false)} sx={{ color: '#64748b', '&:hover': { color: '#111827' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ p: 4 }}>
            <Box
              component="label"
              sx={{
                border: '1.5px dashed #10b981',
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                p: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f0fdf4' },
                textAlign: 'center'
              }}
            >
              <input type="file" multiple accept=".mp4,.webm,.mpeg,.avi,.mkv,.mov,.ogm" style={{ display: 'none' }} onChange={handleFileSelect} />
              <NoteAddOutlinedIcon sx={{ fontSize: '48px', color: '#10b981', mb: 2 }} />
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: '#111827', mb: 1 }}>
                Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>
                Videofayl: .mp4, .webm, .mpeg, .avi, .mkv, .mov, .ogm formatlaridan birida bo'lishi kerak
              </Typography>
            </Box>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 4, border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 60px', bgcolor: '#f8fafc', p: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>File name</Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}><span style={{ color: '#ef4444' }}>*</span> Dars</Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}><span style={{ color: '#ef4444' }}>*</span> Video nomi</Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', textAlign: 'center' }}>Actions</Typography>
                </Box>
                {selectedFiles.map((item) => (
                  <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 60px', p: 1.5, borderBottom: '1px solid #e2e8f0', alignItems: 'center', gap: 2, '&:last-child': { borderBottom: 'none' } }}>
                    <Typography sx={{ fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.fileName}
                    </Typography>
                    <Select
                      size="small"
                      value={item.lessonId}
                      onChange={(e) => updateFile(item.id, 'lessonId', e.target.value)}
                      displayEmpty
                      sx={{ fontSize: '14px', bgcolor: '#fff', borderRadius: '6px' }}
                    >
                      <MenuItem value="" disabled>Darsni tanlang</MenuItem>
                      {groupLessons.map(lesson => (
                        <MenuItem key={lesson.id} value={lesson.id}>{lesson.topic || lesson.title || `Dars ${lesson.id}`}</MenuItem>
                      ))}
                    </Select>
                    <TextField
                      size="small"
                      value={item.videoName}
                      onChange={(e) => updateFile(item.id, 'videoName', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', bgcolor: '#fff', borderRadius: '6px' } }}
                    />
                    <IconButton size="small" onClick={() => removeFile(item.id)} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 3, gap: 2 }}>
            <Button
              onClick={() => { setOpenAddVideoModal(false); setSelectedFiles([]); }}
              sx={{
                textTransform: 'none',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '14px',
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              Bekor qilish
            </Button>
            {selectedFiles.length > 0 && (
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploadLoading}
                sx={{
                  bgcolor: '#10b981',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#059669', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#6ee7b7', color: '#fff' }
                }}
              >
                {uploadLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : "Fayllarni yuklash"}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default GroupLessons;
