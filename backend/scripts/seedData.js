/**
 * Seed script to create test user, projects, sprints, and tasks
 * Run: node scripts/seedData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');

async function seedData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out to keep existing data)
        // await User.deleteMany({});
        // await Project.deleteMany({});
        // await Sprint.deleteMany({});
        // await Task.deleteMany({});

        // 1. Create test user
        let user = await User.findOne({ email: 'test@example.com' });
        
        if (!user) {
            user = await User.create({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123', // Will be hashed by model
                role: 'technical_team'
            });
            console.log('✅ Created test user:', user.email);
        } else {
            console.log('✓ Test user already exists:', user.email);
        }

        // 2. Create test project
        let project = await Project.findOne({ name: 'Digital Dockers Suite' });
        
        if (!project) {
            project = await Project.create({
                name: 'Digital Dockers Suite',
                key: 'DDS',
                description: 'Main project management application',
                lead: user._id,
                members: [user._id],
                nextIssueNumber: 1
            });
            console.log('✅ Created test project:', project.name);
        } else {
            console.log('✓ Test project already exists:', project.name);
        }

        // 3. Create sprints
        let sprintFuture = await Sprint.findOne({ project: project._id, name: 'Sprint 1' });
        
        if (!sprintFuture) {
            sprintFuture = await Sprint.create({
                project: project._id,
                name: 'Sprint 1',
                status: 'future',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
                goal: 'Initial features and bug fixes'
            });
            console.log('✅ Created future sprint:', sprintFuture.name);
        } else {
            console.log('✓ Future sprint already exists');
        }

        let sprintActive = await Sprint.findOne({ project: project._id, name: 'Current Sprint' });
        
        if (!sprintActive) {
            sprintActive = await Sprint.create({
                project: project._id,
                name: 'Current Sprint',
                status: 'active',
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                goal: 'Core features implementation'
            });
            console.log('✅ Created active sprint:', sprintActive.name);
        } else {
            console.log('✓ Active sprint already exists');
        }

        // 4. Create sample tasks
        const taskTitles = [
            { title: 'Fix login button UI', status: 'todo', priority: 'highest' },
            { title: 'Implement Kanban board', status: 'in_progress', priority: 'high' },
            { title: 'Add user authentication', status: 'in_progress', priority: 'highest' },
            { title: 'Create API documentation', status: 'review', priority: 'medium' },
            { title: 'Database schema optimization', status: 'todo', priority: 'medium' },
            { title: 'Add real-time notifications', status: 'todo', priority: 'low' },
            { title: 'Create Sprint board component', status: 'done', priority: 'high' },
            { title: 'Setup MongoDB Atlas', status: 'done', priority: 'highest' },
        ];

        for (let i = 0; i < taskTitles.length; i++) {
            const taskData = taskTitles[i];
            let existingTask = await Task.findOne({ 
                title: taskData.title, 
                project: project._id 
            });

            if (!existingTask) {
                const task = await Task.create({
                    key: `${project.key}-${i + 1}`,
                    title: taskData.title,
                    description: `Detailed description for ${taskData.title}`,
                    status: taskData.status,
                    priority: taskData.priority,
                    project: project._id,
                    sprint: i < 5 ? sprintActive._id : null, // Assign some to active sprint
                    assignedTo: [user._id],
                    assignedBy: user._id,
                    reporter: user._id,
                    issueType: 'task',
                    storyPoints: Math.floor(Math.random() * 13) + 1 // 1-13 points
                });
                console.log(`✅ Created task: ${task.key} - ${task.title}`);
            }
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Credentials:');
        console.log('Email: test@example.com');
        console.log('Password: password123');
        console.log('\nProject: Digital Dockers Suite (DDS)');
        console.log('Active Sprint: Current Sprint');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seedData();
