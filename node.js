// Create QR Session
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

// Mark Attendance
app.post('/api/mark-attendance', async (req, res) => {
    try {
        // Verify QR session is valid
        const [session] = await pool.query(
            'SELECT * FROM qr_sessions WHERE id = ? AND expiry_time > NOW()',
            [req.body.qrData]
        );
        
        if (session.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired QR code' });
        }
        
        // Check if already marked
        const [existing] = await pool.query(
            'SELECT * FROM attendance WHERE student_usn = ? AND session_id = ?',
            [req.body.studentUsn, req.body.qrData]
        );
        
        if (existing.length > 0) {
            return res.json({ success: true, message: 'Attendance already marked' });
        }
        
        // Record attendance
        await pool.query(
            'INSERT INTO attendance (student_usn, teacher_id, qr_code, session_id) VALUES (?, ?, ?, ?)',
            [req.body.studentUsn, session[0].teacher_id, req.body.qrData, req.body.qrData]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Attendance Data
app.get('/api/get-attendance', async (req, res) => {
    try {
        const [attendance] = await pool.query(`
            SELECT s.usn, s.name, a.timestamp 
            FROM attendance a
            JOIN students s ON a.student_usn = s.usn
            WHERE a.teacher_id = ? AND a.session_id = (
                SELECT id FROM qr_sessions 
                WHERE teacher_id = ? 
                ORDER BY expiry_time DESC LIMIT 1
            )
        `, [req.query.teacherId, req.query.teacherId]);
        
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


















// Add this new endpoint for manual codes
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
  
  // Modify the existing mark-attendance endpoint to check both QR and manual codes
  app.post('/api/mark-attendance', async (req, res) => {
    try {
      // Check both QR sessions and manual codes
      const [validCode] = await pool.query(
        `(SELECT teacher_id FROM qr_sessions WHERE id = ? AND expiry_time > NOW())
         UNION
         (SELECT teacher_id FROM manual_codes WHERE code = ? AND expires_at > NOW())`,
        [req.body.qrData, req.body.qrData]
      );
  
      if (validCode.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
      }
  
      // Rest of your existing attendance logic...
      const [existing] = await pool.query(
        'SELECT * FROM attendance WHERE student_usn = ? AND session_id = ?',
        [req.body.studentUsn, req.body.qrData]
      );
      
      if (existing.length > 0) {
        return res.json({ success: true, message: 'Attendance already marked' });
      }
      
      await pool.query(
        'INSERT INTO attendance (student_usn, teacher_id, qr_code, session_id) VALUES (?, ?, ?, ?)',
        [req.body.studentUsn, validCode[0].teacher_id, req.body.qrData, req.body.qrData]
      );
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });


















  app.post('/api/mark-attendance', async (req, res) => {
    console.log('Received attendance request:', req.body);
    
    try {
      // Verify input format
      if (!req.body.studentUsn?.match(/^S\d{3}$/) || !req.body.qrData) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid request format' 
        });
      }
  
      // Check code validity
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
          message: 'Invalid/expired code' 
        });
      }
  
      // Check existing attendance
      const [existing] = await pool.query(
        'SELECT * FROM attendance WHERE student_usn = ? AND session_id = ?',
        [req.body.studentUsn, req.body.qrData]
      );
  
      if (existing.length > 0) {
        return res.json({ 
          success: false, 
          message: 'Attendance already recorded' 
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
        message: 'Database operation failed' 
      });
    }
  });








  