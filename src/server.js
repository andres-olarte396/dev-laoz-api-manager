require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Docker = require('dockerode');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3800;
const REPO_BASE_PATH = process.env.REPO_BASE_PATH || '/app/repos';

// Docker connection (socket mounted from host)
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. DOCKER OPERATIONS
app.get('/api/manager/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });
        // Filtrar solo los de la red webtools o un label específico si se desea
        res.json(containers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/manager/containers/:id/start', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        await container.start();
        res.json({ message: 'Container started' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/manager/containers/:id/stop', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        await container.stop();
        res.json({ message: 'Container stopped' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/manager/containers/:id/logs', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const logs = await container.logs({
            stdout: true,
            stderr: true,
            tail: 100
        });
        res.send(logs.toString('utf-8'));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GIT OPERATIONS
app.post('/api/manager/git/clone', async (req, res) => {
    const { repoUrl, folderName } = req.body;
    if (!repoUrl || !folderName) return res.status(400).json({ error: 'Missing params' });

    const targetPath = path.join(REPO_BASE_PATH, folderName);

    if (fs.existsSync(targetPath)) {
        return res.status(409).json({ error: 'Repo already exists' });
    }

    try {
        await simpleGit().clone(repoUrl, targetPath);
        res.json({ message: 'Cloned successfully', path: targetPath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/manager/git/status/:folderName', async (req, res) => {
    const { folderName } = req.params;
    const targetPath = path.join(REPO_BASE_PATH, folderName);

    if (!fs.existsSync(targetPath)) return res.status(404).json({ error: 'Repo not found' });

    try {
        const status = await simpleGit(targetPath).status();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/manager/git/pull/:folderName', async (req, res) => {
    const { folderName } = req.params;
    const targetPath = path.join(REPO_BASE_PATH, folderName);

    if (!fs.existsSync(targetPath)) return res.status(404).json({ error: 'Repo not found' });

    try {
        await simpleGit(targetPath).pull();
        res.json({ message: 'Pull successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-manager' }));

app.listen(PORT, () => {
    console.log(`ApiManager running on port ${PORT}`);
    console.log(`Repo Base Path: ${REPO_BASE_PATH}`);
});
