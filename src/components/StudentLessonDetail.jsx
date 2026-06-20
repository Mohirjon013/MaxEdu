import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import loginLogo from '../assets/images/login-logo.png'
import axiosClient from '../api/axios';

const StudentLessonDetail = () => {
    const { id, lessonId } = useParams();
    const navigate = useNavigate();

    // Lessons state
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Videos state
    const [activeVideos, setActiveVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Homework state
    const [homeworkData, setHomeworkData] = useState(null); // { homework, answer, result }
    const [homeworkLoading, setHomeworkLoading] = useState(false);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                // Fetch lessons list from API
                const res = await axiosClient.get(`/groups/${id}/lessons`);
                setLessons(res.data.data || res.data || []);
            } catch (error) {
                console.error("Error fetching lessons:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchLessons();
        }
    }, [id]);

    useEffect(() => {
        const fetchLessonData = async () => {
            if (!id || !lessonId) return;

            setVideosLoading(true);
            setHomeworkLoading(true);

            Promise.allSettled([
                axiosClient.get(`/groups/${id}/lessons/${lessonId}/videos`),
                axiosClient.get(`/groups/${id}/lessons/${lessonId}/homeworks`)
            ]).then(([videosRes, homeworksRes]) => {
                // Handle Videos
                if (videosRes.status === 'fulfilled') {
                    const vids = videosRes.value.data?.data || [];
                    setActiveVideos(vids);
                    if (vids.length > 0) {
                        setSelectedVideo(vids[0]);
                    } else {
                        setSelectedVideo(null);
                    }
                } else {
                    console.error("Error fetching videos:", videosRes.reason);
                    setActiveVideos([]);
                    setSelectedVideo(null);
                }

                // Handle Homeworks
                if (homeworksRes.status === 'fulfilled') {
                    setHomeworkData(homeworksRes.value.data?.data || null);
                } else {
                    console.error("Error fetching homework:", homeworksRes.reason);
                    setHomeworkData(null);
                }
            }).finally(() => {
                setVideosLoading(false);
                setHomeworkLoading(false);
            });
        };

        fetchLessonData();
    }, [id, lessonId]);

    const formatDateCustom = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy} M${mm} ${dd}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy} M${mm} ${dd} ${hh}:${min}`;
    };

    const getResultLabel = (result) => {
        if (!result) return null;
        const status = result.status || result;
        if (status === 'returned' || status === 'Qaytarilgan' || (result.grade !== undefined && result.grade < 60)) return { label: 'Vazifa qaytarildi', color: '#F59E0B' };
        if (status === 'accepted' || status === 'Qabul qilingan' || (result.grade !== undefined && result.grade >= 60)) return { label: 'Vazifa qabul qilindi', color: '#10B981' };
        if (status === 'pending' || status === 'Kutayotganlar') return { label: 'Tekshirilmoqda', color: '#6366F1' };
        return { label: String(status), color: '#6B7280' };
    };

    const getFileUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const base = axiosClient.defaults?.baseURL ? axiosClient.defaults.baseURL.replace('/api/v1', '') : 'https://najot-edu.softwareengineer.uz';
        return `${base}/files/files/${url}`;
    };

    const homework = homeworkData?.homework || null;
    const answer = homeworkData?.answer || null;
    const result = homeworkData?.result || null;
    const resultMeta = getResultLabel(result);

    const renderAttachedFile = (fileData) => {
        if (!fileData) return null;
        const files = Array.isArray(fileData) ? fileData : [fileData];
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {files.map((fileItem, idx) => (
                    <Box
                        key={idx}
                        onClick={() => window.open(getFileUrl(fileItem), '_blank')}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            p: 1.5,
                            width: 'fit-content',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: '#F9FAFB',
                                borderColor: '#D1D5DB'
                            }
                        }}
                    >
                        <AttachFileIcon sx={{ color: '#9CA3AF', fontSize: 20, transform: 'rotate(45deg)' }} />
                        <Typography sx={{ color: '#3b82f6', fontSize: 14, fontWeight: 500 }}>{fileItem}</Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', gap: 3, p: 3, height: 'calc(100vh - 112px)', overflow: 'hidden', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>
            {/* Left Content Area */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                height: '100%',
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: '4px' }
            }}>

                {/* Video Area */}
                <Paper elevation={0} sx={{ height: 450, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px', overflow: 'hidden', backgroundColor: selectedVideo ? '#000' : '#fff' }}>
                    {selectedVideo ? (
                        <video
                            src={getFileUrl(selectedVideo.video_url)}
                            controls
                            autoPlay
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <img src={loginLogo} alt="MaxEdu Logo" style={{ width: "min(350px, 65%)", height: "auto", objectFit: "contain", marginBottom: '8px' }} />
                            <Typography sx={{ color: '#575b63ff', fontSize: '18px', fontWeight: 600, letterSpacing: '0.5px' }}>
                                Video mavjud emas
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Homework Details Header */}
                <Paper elevation={0} sx={{ flexShrink: 0, p: 2, display: 'flex', justifyContent: 'space-between', borderRadius: '8px' }}>
                    <Typography sx={{ fontWeight: 600, color: '#5a3cd9', fontSize: 18 }}>Vazifalarim</Typography>
                    {(result?.grade != null || result?.score != null) && (
                        <Typography sx={{ fontWeight: 600, color: '#5a3cd9', fontSize: 18 }}>Ball: {result?.grade ?? result?.score}</Typography>
                    )}
                </Paper>

                {/* Homework Details Sections */}
                {homeworkLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, flexShrink: 0 }}>
                        <CircularProgress sx={{ color: '#5a3cd9' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                        {homework && (
                            <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', backgroundColor: '#ffffff' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 16 }}>Uyga vazifa</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {homework.deadline && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#FEE2E2', px: 1.5, py: 0.5, borderRadius: '4px' }}>
                                                <ReportProblemOutlinedIcon sx={{ color: '#EF4444', fontSize: 16 }} />
                                                <Typography sx={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>Uyga vazifa muddati: {formatDateTime(homework.deadline)}</Typography>
                                            </Box>
                                        )}
                                        {homework.file != null && (
                                            <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Fayllar soni: {Array.isArray(homework.file) ? homework.file.length : 1}</Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Typography sx={{ color: '#4B5563', fontSize: 14, mb: homework.file ? 2 : 3 }}>{homework.title || '-'}</Typography>
                                {renderAttachedFile(homework.file)}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>{formatDateCustom(homework.created_at)}</Typography>
                                </Box>
                            </Paper>
                        )}

                        {answer && (
                            <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', backgroundColor: '#ffffff' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 16 }}>Mening jo'natmalarim</Typography>
                                    {answer.file != null && (
                                        <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Fayllar soni: {Array.isArray(answer.file) ? answer.file.length : 1}</Typography>
                                    )}
                                </Box>
                                <Typography sx={{ color: '#4B5563', fontSize: 14, mb: answer.file ? 2 : 3 }}>{answer.title || answer.text || answer.content || '-'}</Typography>
                                {renderAttachedFile(answer.file)}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>{formatDateCustom(answer.created_at)}</Typography>
                                </Box>
                            </Paper>
                        )}

                        {result && (
                            <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', backgroundColor: '#ffffff' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 16 }}>O'qituvchi izohi</Typography>
                                    {resultMeta && (
                                        <Typography sx={{ color: resultMeta.color, fontSize: 14, fontWeight: 600 }}>{resultMeta.label}</Typography>
                                    )}
                                </Box>
                                <Typography sx={{ color: '#4B5563', fontSize: 14, mb: result.file ? 2 : 1 }}>{result.title || result.comment || result.text || '-'}</Typography>
                                {renderAttachedFile(result.file)}
                                {result.teacher_name && (
                                    <Typography sx={{ color: '#6B7280', fontSize: 13, mb: 3 }}>Tekshiruvchi: {result.teacher_name}</Typography>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>{formatDateCustom(result.created_at)}</Typography>
                                </Box>
                            </Paper>
                        )}

                        {!homeworkLoading && !homework && !answer && !result && (
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '8px', backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                                <Typography sx={{ color: '#9CA3AF', fontSize: 15 }}>
                                    Bu dars uchun vazifa mavjud emas
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                )}
            </Box>

            {/* Right Sidebar - Lessons List */}
            <Paper elevation={0} sx={{
                width: 350,
                minWidth: 350,
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                height: '100%',
                overflowY: 'auto',
                border: '1px solid #E2E8F0',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: '4px' }
            }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress sx={{ color: '#5a3cd9' }} />
                    </Box>
                ) : lessons.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', color: '#6B7280', py: 3 }}>Darslar topilmadi</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {lessons.map(lesson => {
                            const isActive = lesson.id === Number(lessonId);
                            const hasVideo = lesson.videoCount > 0;

                            return (
                                <Box key={lesson.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {/* Lesson Header */}
                                    <Box
                                        onClick={() => navigate(`/dashboard/my-groups/${id}/lessons/${lesson.id}`)}
                                        sx={{
                                            p: 2,
                                            borderRadius: '8px',
                                            backgroundColor: isActive ? '#7960daff' : '#F5F3FF',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: isActive ? '#6B52D4' : '#EDE9FE',
                                                boxShadow: '0 2px 8px rgba(107, 75, 232, 0.15)',
                                                transform: 'translateY(-1px)'
                                            }
                                        }}
                                    >
                                        <Box>
                                            <Typography sx={{ fontWeight: 600, color: isActive ? '#fff' : '#111827', fontSize: 16, mb: 0.5 }}>
                                                {lesson.topic}
                                            </Typography>
                                            <Typography sx={{ color: isActive ? 'rgba(255,255,255,0.8)' : '#4B5563', fontSize: 13 }}>
                                                Dars sanasi: {formatDateCustom(lesson.created_at)}
                                            </Typography>
                                        </Box>

                                        {/* Accordion icon logic */}
                                        {hasVideo && (
                                            isActive ? <KeyboardArrowUpIcon sx={{ color: '#fff' }} /> : <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
                                        )}
                                    </Box>

                                    {/* Videos Accordion Content */}
                                    {isActive && hasVideo && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {videosLoading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                                                    <CircularProgress size={20} sx={{ color: '#B45309' }} />
                                                </Box>
                                            ) : activeVideos.length > 0 ? (
                                                activeVideos.map((video, idx) => {
                                                    const isSelectedVideo = selectedVideo?.id === video.id;
                                                    return (
                                                        <Box
                                                            key={video.id}
                                                            onClick={() => setSelectedVideo(video)}
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: '8px',
                                                                backgroundColor: isSelectedVideo ? '#6B4BE8' : '#EDE9FE',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1.5,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                '&:hover': { backgroundColor: isSelectedVideo ? '#5B3DD8' : '#DDD6FE' }
                                                            }}
                                                        >
                                                            <PlayCircleOutlineIcon sx={{ color: isSelectedVideo ? '#fff' : '#6B4BE8', fontSize: 28 }} />
                                                            <Typography sx={{ color: isSelectedVideo ? '#fff' : '#111827', fontSize: 15, fontWeight: 500 }}>
                                                                {idx + 1}-video: {video.originalname || video.original_name || video.video_url}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })
                                            ) : (
                                                <Typography sx={{ color: '#6B7280', fontSize: 13, px: 2, pb: 1 }}>Videolar mavjud emas</Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )
                        })}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default StudentLessonDetail;
