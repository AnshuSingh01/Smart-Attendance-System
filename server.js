const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_attendance'
});

// Student login endpoint
app.post('/api/student-login', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM students WHERE usn = ?', 
            [req.body.usn]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Student not found' });
        }

        const student = rows[0];
        
        // Compare plaintext password (temporary)
        const validPassword = (req.body.password === student.password);
        // In production: await bcrypt.compare(req.body.password, student.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        res.json({
            success: true,
            user: {
                usn: student.usn,
                name: student.name,
                email: student.email
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// QR Session Endpoints
app.post('/api/create-qr-session', async (req, res) => {
    try {
        await pool.query(
            'INSERT INTO qr_sessions (id, teacher_id, subject, expiry_time) VALUES (?, ?, ?, ?)',
            [req.body.sessionId, req.body.teacherId, req.body.subject, req.body.expiryTime]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Unified Mark Attendance Endpoint
app.post('/api/mark-attendance', async (req, res) => {
    console.log('Received attendance request:', req.body);
    
    try {
        // Verify input format
        if (!req.body.studentUsn || !req.body.qrData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid request format' 
            });
        }

        // Check code validity (both QR sessions and manual codes)
        const [validCode] = await pool.query(
            `(SELECT teacher_id FROM qr_sessions WHERE id = ? AND expiry_time > NOW())
             UNION
             (SELECT teacher_id FROM manual_codes WHERE code = ? AND expires_at > NOW())`,
            [req.body.qrData, req.body.qrData]
        );

        console.log('Code validation result:', validCode);

        if (validCode.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired code' 
            });
        }

        // Check existing attendance
        const [existing] = await pool.query(
            'SELECT * FROM attendance WHERE student_usn = ? AND qr_code = ?',
            [req.body.studentUsn, req.body.qrData]
        );

        if (existing.length > 0) {
            return res.json({ 
                success: false, 
                message: 'Attendance already recorded for this session' 
            });
        }

        // Record attendance
        await pool.query(
            'INSERT INTO attendance (student_usn, teacher_id, qr_code, session_id) VALUES (?, ?, ?, ?)',
            [req.body.studentUsn, validCode[0].teacher_id, req.body.qrData, req.body.qrData]
        );

        res.json({ success: true });
        
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message
        });
    }
});

// Store Manual Code Endpoint
app.post('/api/store-manual-code', async (req, res) => {
    try {
        // First delete any existing codes for this teacher
        await pool.query(
            'DELETE FROM manual_codes WHERE teacher_id = ?',
            [req.body.teacherId]
        );
        
        // Insert new manual code
        await pool.query(
            'INSERT INTO manual_codes (teacher_id, code, expires_at) VALUES (?, ?, ?)',
            [req.body.teacherId, req.body.code, req.body.expiresAt]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});