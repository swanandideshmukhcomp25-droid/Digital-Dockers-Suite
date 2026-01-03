import { useCallback, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Box, Paper, Typography, Avatar, Chip, useTheme } from '@mui/material';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';

const nodeWidth = 200;
const nodeHeight = 90;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const isHorizontal = false;

const CustomNode = ({ data }) => {
    return (
        <GlassCard
            sx={{
                p: 2,
                width: nodeWidth,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.4)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                '&:hover': {
                    transform: 'translateY(-5px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    borderColor: 'primary.main'
                }
            }}
        >
            <Avatar
                src={data.avatar}
                sx={{
                    width: 52,
                    height: 52,
                    bgcolor: 'primary.main',
                    border: '3px solid white',
                    boxShadow: 2
                }}
            >
                {data.fullName[0]}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {data.fullName}
                </Typography>
                <Chip
                    label={data.role.replace('_', ' ')}
                    size="small"
                    sx={{
                        mt: 0.6,
                        height: 22,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundImage: 'linear-gradient(to right, #4f46e5, #818cf8)',
                        color: 'white',
                        textTransform: 'uppercase',
                        border: 'none',
                        '& .MuiChip-label': { px: 1 }
                    }}
                />
            </Box>
        </GlassCard>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const OrgGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const theme = useTheme();

    useEffect(() => {
        const fetchOrgTree = async () => {
            try {
                const res = await api.get('/users/org-tree'); // Returns flat list of users
                const users = res.data;

                // Transform to Elements
                const newNodes = users.map(u => ({
                    id: u._id,
                    type: 'custom',
                    data: {
                        fullName: u.fullName,
                        role: u.role,
                        avatar: u.profileInfo?.avatar
                    },
                    position: { x: 0, y: 0 } // Layout handles this
                }));

                const newEdges = users
                    .filter(u => u.reportsTo)
                    .map(u => ({
                        id: `e-${u.reportsTo}-${u._id}`,
                        source: u.reportsTo,
                        target: u._id,
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: theme.palette.text.secondary, strokeWidth: 2 }
                    }));

                const layouted = getLayoutedElements(newNodes, newEdges);
                setNodes(layouted.nodes);
                setEdges(layouted.edges);

            } catch (err) {
                console.error("Failed to fetch org tree", err);
            }
        };

        fetchOrgTree();
    }, [setNodes, setEdges, theme]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Organization Structure</Typography>
            <Paper sx={{ height: '100%', width: '100%', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Controls />
                    <MiniMap style={{ borderRadius: 16 }} />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </Paper>
        </Box>
    );
};

export default OrgGraph;
