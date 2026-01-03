const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const seedDemoData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/digital-dockers');
        console.log('MongoDB Connected');

        // Get or create users
        let yash = await User.findOne({ email: 'yash.dhadge_comp23@pccoer.in' });
        let sarah = await User.findOne({ email: 'sarah.pm@digitalDockers.com' });
        let michael = await User.findOne({ email: 'michael.lead@digitalDockers.com' });

        if (!yash || !sarah || !michael) {
            console.log('⚠️ Please run seedAllUsers.js first to create users');
            process.exit(1);
        }

        console.log('Found users:', yash.fullName, sarah.fullName, michael.fullName);

        // 1. Create/Update Project
        let project = await Project.findOne({ key: 'PROJ' });
        if (!project) {
            project = await Project.create({
                name: 'Platform Redesign',
                key: 'PROJ',
                description: 'Complete redesign of the web platform with modern UI/UX',
                projectType: 'scrum',
                lead: yash._id,
                members: [yash._id, sarah._id, michael._id],
                nextIssueNumber: 102
            });
            console.log('✅ Created project: Platform Redesign');
        } else {
            // Update to ensure lead and members are set
            project.lead = yash._id;
            project.members = [yash._id, sarah._id, michael._id];
            await project.save();
            console.log('✓ Project already exists: Platform Redesign');
        }

        // 2. Create Sprint
        const now = new Date();
        const sprintStart = new Date(now);
        sprintStart.setDate(now.getDate() - 10);
        const sprintEnd = new Date(now);
        sprintEnd.setDate(now.getDate() + 4);

        let sprint = await Sprint.findOne({ name: 'Sprint 5', project: project._id });
        if (!sprint) {
            sprint = await Sprint.create({
                name: 'Sprint 5',
                goal: 'Complete core UI components and API integration',
                project: project._id,
                status: 'active',
                startDate: sprintStart,
                endDate: sprintEnd,
                committedPoints: 40
            });
            console.log('✅ Created sprint: Sprint 5');
        } else {
            sprint.status = 'active';
            await sprint.save();
            console.log('✓ Sprint already exists: Sprint 5');
        }

        // 3. Create Demo Issues
        const issues = [
            {
                key: 'PROJ-1',
                title: 'Fix Header CSS',
                description: 'Header alignment issues on mobile devices',
                issueType: 'bug',
                priority: 'high',
                status: 'in_progress',
                storyPoints: 3,
                assignedTo: [yash._id],
                sprint: sprint._id
            },
            {
                key: 'PROJ-5',
                title: 'DB Schema Update',
                description: 'Update MongoDB schemas for new features',
                issueType: 'task',
                priority: 'medium',
                status: 'todo',
                storyPoints: 5,
                assignedTo: [yash._id],
                sprint: sprint._id
            },
            {
                key: 'PROJ-87',
                title: 'Implement Dashboard Charts',
                description: 'Add burndown and velocity charts to project dashboard',
                issueType: 'story',
                priority: 'high',
                status: 'done',
                storyPoints: 8,
                assignedTo: [sarah._id],
                sprint: sprint._id,
                completedAt: new Date(now.getTime() - 86400000)
            },
            {
                key: 'PROJ-98',
                title: 'API Rate Limiting',
                description: 'Implement rate limiting for public API endpoints',
                issueType: 'task',
                priority: 'medium',
                status: 'done',
                storyPoints: 5,
                assignedTo: [michael._id],
                sprint: sprint._id,
                completedAt: new Date(now.getTime() - 14400000)
            },
            {
                key: 'PROJ-101',
                title: 'User Avatar Upload',
                description: 'Allow users to upload custom profile pictures',
                issueType: 'story',
                priority: 'medium',
                status: 'review',
                storyPoints: 5,
                assignedTo: [yash._id],
                sprint: sprint._id
            },
            {
                key: 'PROJ-102',
                title: 'Notification System Refactor',
                description: 'Refactor notification system for real-time updates',
                issueType: 'story',
                priority: 'low',
                status: 'todo',
                storyPoints: 8,
                assignedTo: []
            },
            {
                key: 'PROJ-103',
                title: 'Mobile Navigation Improvement',
                description: 'Improve mobile navigation UX',
                issueType: 'task',
                priority: 'lowest',
                status: 'todo',
                storyPoints: 3,
                assignedTo: []
            }
        ];

        for (const issueData of issues) {
            const existing = await Task.findOne({ key: issueData.key });
            if (!existing) {
                await Task.create({
                    ...issueData,
                    project: project._id,
                    reporter: yash._id,
                    assignedBy: yash._id
                });
                console.log(`✅ Created issue: ${issueData.key}`);
            } else {
                // Update existing
                existing.status = issueData.status;
                existing.sprint = issueData.sprint || null;
                existing.project = project._id;
                await existing.save();
                console.log(`✓ Issue exists: ${issueData.key}`);
            }
        }

        // 4. Create Activity Logs
        const activities = [
            {
                actor: yash._id,
                actionType: 'created',
                entityType: 'issue',
                entityId: (await Task.findOne({ key: 'PROJ-101' }))?._id,
                entityKey: 'PROJ-101',
                project: project._id,
                message: 'PROJ-101 User Avatar Upload created',
                createdAt: new Date(now.getTime() - 7200000) // 2 hours ago
            },
            {
                actor: michael._id,
                actionType: 'status_changed',
                entityType: 'issue',
                entityId: (await Task.findOne({ key: 'PROJ-98' }))?._id,
                entityKey: 'PROJ-98',
                project: project._id,
                message: 'PROJ-98 moved to Done',
                details: { field: 'status', oldValue: 'review', newValue: 'done' },
                createdAt: new Date(now.getTime() - 14400000) // 4 hours ago
            },
            {
                actor: sarah._id,
                actionType: 'commented',
                entityType: 'comment',
                entityId: (await Task.findOne({ key: 'PROJ-87' }))?._id,
                entityKey: 'PROJ-87',
                project: project._id,
                message: 'Sarah commented on PROJ-87',
                createdAt: new Date(now.getTime() - 86400000) // 1 day ago
            },
            {
                actor: yash._id,
                actionType: 'sprint_started',
                entityType: 'sprint',
                entityId: sprint._id,
                project: project._id,
                message: 'Sprint 5 started',
                createdAt: sprintStart
            }
        ];

        // Clear old activity logs for this project and add new ones
        await ActivityLog.deleteMany({ project: project._id });
        for (const activity of activities) {
            if (activity.entityId) {
                await ActivityLog.create(activity);
            }
        }
        console.log('✅ Created activity logs');

        console.log('\n=== DEMO DATA SEEDED SUCCESSFULLY ===\n');
        console.log('Project: Platform Redesign (PROJ)');
        console.log('Sprint: Sprint 5 (Active, 4 days remaining)');
        console.log('Issues: PROJ-1, PROJ-5, PROJ-87, PROJ-98, PROJ-101, PROJ-102, PROJ-103');
        console.log('\nLogin with: yash.dhadge_comp23@pccoer.in / 123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding demo data:', error);
        process.exit(1);
    }
};

seedDemoData();
