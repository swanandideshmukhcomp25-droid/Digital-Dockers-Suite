import { Typography, Paper, Box, Chip, Card, CardContent } from '@mui/material';
import { Circle } from '@mui/icons-material';

const TaskBoard = () => {
    const columns = [
        {
            title: 'To Do',
            color: '#5E6C84',
            tasks: [
                { id: 1, title: 'Update API documentation', priority: 'Medium', assignee: 'YD' },
                { id: 2, title: 'Fix login bug', priority: 'High', assignee: 'JD' },
            ]
        },
        {
            title: 'In Progress',
            color: '#0052CC',
            tasks: [
                { id: 3, title: 'Implement dashboard', priority: 'High', assignee: 'YD' },
                { id: 4, title: 'Code review', priority: 'Low', assignee: 'SK' },
            ]
        },
        {
            title: 'Done',
            color: '#00875A',
            tasks: [
                { id: 5, title: 'Setup database', priority: 'High', assignee: 'YD' },
            ]
        },
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return { bg: '#FFEBE6', color: '#DE350B' };
            case 'Medium': return { bg: '#FFF0B3', color: '#FF991F' };
            case 'Low': return { bg: '#E3FCEF', color: '#00875A' };
            default: return { bg: '#F4F5F7', color: '#5E6C84' };
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                border: '1px solid #DFE1E6',
                borderRadius: 1,
            }}
        >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Task Board
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                {columns.map((column) => (
                    <Box
                        key={column.title}
                        sx={{
                            minWidth: 280,
                            flex: 1,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Circle sx={{ fontSize: 12, color: column.color }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: '#5E6C84' }}>
                                {column.title}
                            </Typography>
                            <Chip
                                label={column.tasks.length}
                                size="small"
                                sx={{
                                    height: 20,
                                    minWidth: 20,
                                    fontSize: '0.75rem',
                                    bgcolor: '#F4F5F7',
                                    color: '#5E6C84',
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {column.tasks.map((task) => {
                                const priorityStyle = getPriorityColor(task.priority);
                                return (
                                    <Card
                                        key={task.id}
                                        elevation={0}
                                        sx={{
                                            border: '1px solid #DFE1E6',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: '#0052CC',
                                                boxShadow: '0 0 0 1px #0052CC',
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                                                {task.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Chip
                                                    label={task.priority}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.75rem',
                                                        bgcolor: priorityStyle.bg,
                                                        color: priorityStyle.color,
                                                        fontWeight: 600,
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        bgcolor: '#0052CC',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {task.assignee}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default TaskBoard;
