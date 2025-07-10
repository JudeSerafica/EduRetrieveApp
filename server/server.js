const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const upload = multer(); // For handling multipart/form-data

// =========================
// ✅ MIDDLEWARE SETUP
// =========================
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// =========================
// 🔐 FIREBASE ADMIN INIT
// =========================
admin.initializeApp({
  credential: admin.credential.cert(require('./EduRetrieve-ServiceAccount.json')),
});

// =========================
// 🧭 SUPABASE INIT
// =========================
const supabase = createClient(
  'https://dcepfndjsmktrfcelvgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZXBmbmRqc21rdHJmY2VsdmdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTAwMDkxNiwiZXhwIjoyMDY2NTc2OTE2fQ.uSduSDirvbRdz5_2ySrVTp_sYPGcg6ddP6_XfMDZZKQ',
);

// =========================
// ✅ FIREBASE TOKEN CHECK
// =========================
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// =========================
// 📤 MODULE UPLOAD
// =========================
app.post('/upload-module', verifyFirebaseToken, upload.single('file'), async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;
  const firebaseUid = req.user.uid;

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing title or description' });
  }

  let fileUrl = null;
  let filePath = null;

  try {
    if (file) {
      // ✅ Allow only specific MIME types
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only PDF, DOC, and DOCX allowed.' });
      }

      const fileExt = path.extname(file.originalname);
      filePath = `${firebaseUid}/${Date.now()}${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('eduretrieve')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError);
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicData, error: publicUrlError } = supabase.storage
        .from('eduretrieve')
        .getPublicUrl(filePath);

      if (publicUrlError) {
        console.error('❌ Get public URL error:', publicUrlError);
        return res.status(500).json({ error: publicUrlError.message });
      }

      fileUrl = publicData.publicUrl;
    }

    const moduleData = {
      title,
      description,
      uploadedBy: req.user.email,
      uploadedAt: new Date().toISOString(),
      user_id: firebaseUid,
      file_url: fileUrl || null,
      file_size: file ? file.size : null,
    };

    const { data, error } = await supabase.from('modules').insert([moduleData]);

    if (error) {
      console.error('❌ Upload error (Supabase insert):', error);

      // ✅ Cleanup uploaded file if insert fails
      if (filePath) {
        await supabase.storage.from('eduretrieve').remove([filePath]);
      }

      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Module uploaded successfully', data });
  } catch (err) {
    console.error('❌ Exception during upload:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================
// 💾 SAVE MODULE
// =========================
app.post('/save-module', verifyFirebaseToken, async (req, res) => {
  const { module_id, title } = req.body;
  const firebaseUid = req.user.uid;

  if (!module_id || !title) {
    return res.status(400).json({ error: 'Missing module_id or title' });
  }

  try {
    const { error } = await supabase.from('save_modules').insert([
      {
        user_id: firebaseUid,
        module_id,
        title,
      },
    ]);

    if (error) {
      console.error('❌ Supabase insert error (save_modules):', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Module saved successfully' });
  } catch (err) {
    console.error('❌ Exception during save:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// 🗑️ UNSAVE MODULE
// =========================
app.post('/unsave-module', verifyFirebaseToken, async (req, res) => {
  const { module_id } = req.body;
  const firebaseUid = req.user?.uid;

  if (!module_id) {
    console.warn('⚠️ Missing module_id in request body');
    return res.status(400).json({ error: 'Missing module_id' });
  }

  if (!firebaseUid) {
    console.warn('⚠️ Firebase UID is missing from token');
    return res.status(401).json({ error: 'Unauthorized user' });
  }

  try {
    const { data, error } = await supabase
      .from('save_modules')
      .delete()
      .eq('user_id', firebaseUid)
      .eq('module_id', module_id)
      .select(); // returns deleted rows for verification

    if (error) {
      console.error('❌ Supabase delete error (unsave_modules):', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ No saved module found to delete for user ${firebaseUid} and module ${module_id}`);
      return res.status(404).json({ error: 'Saved module not found' });
    }

    console.log(`🗑️ Unsave successful for user ${firebaseUid}, module ${module_id}`);
    res.status(200).json({ message: 'Module unsaved successfully', unsaved: data[0] });
  } catch (err) {
    console.error('❌ Exception during unsave:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// =========================
// 📥 GET SAVED MODULES
// =========================
app.get('/get-saved-modules', verifyFirebaseToken, async (req, res) => {
  const firebaseUid = req.user.uid;

  try {
    const { data: savedRows, error: fetchError } = await supabase
      .from('save_modules')
      .select('module_id')
      .eq('user_id', firebaseUid);

    if (fetchError) {
      console.error('❌ Supabase fetch error (save_modules):', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    const moduleIds = savedRows.map(row => row.module_id);

    if (moduleIds.length === 0) {
      return res.status(200).json({ modules: [] });
    }

    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .in('id', moduleIds)
      .eq('user_id', firebaseUid)
      .order('uploadedAt', { ascending: false });

    if (modulesError) {
      console.error('❌ Supabase module fetch error (modules):', modulesError);
      return res.status(500).json({ error: modulesError.message });
    }

    res.status(200).json({ modules });
  } catch (err) {
    console.error('❌ Exception in /get-saved-modules:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ DELETE MODULE + file + saved entries
app.delete('/delete-module/:id', verifyFirebaseToken, async (req, res) => {
  const moduleId = req.params.id;
  const firebaseUid = req.user?.uid;

  if (!firebaseUid || !moduleId) {
    return res.status(400).json({ error: 'Missing user or module ID' });
  }

  try {
    // Step 1: Get file_path (if any)
    const { data: moduleData, error: fetchError } = await supabase
      .from('modules')
      .select('file_path')
      .eq('id', moduleId)
      .eq('user_id', firebaseUid)
      .single();

    if (fetchError) {
      console.error('❌ Module fetch failed:', fetchError.message);
      return res.status(404).json({ error: 'Module not found or unauthorized' });
    }

    const filePath = moduleData?.file_path;

    // Step 2: Delete from save_modules
    const { error: saveDeleteError } = await supabase
      .from('save_modules')
      .delete()
      .eq('module_id', moduleId)
      .eq('user_id', firebaseUid);

    if (saveDeleteError) {
      console.warn('⚠️ Failed to delete related save_modules:', saveDeleteError.message);
    }

    // Step 3: Delete from modules table
    const { error: moduleDeleteError } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId)
      .eq('user_id', firebaseUid);

    if (moduleDeleteError) {
      throw new Error(`Failed to delete module: ${moduleDeleteError.message}`);
    }

    // Step 4: Delete from Supabase Storage
    if (filePath) {
      const { error: storageError } = await supabase
        .storage
        .from('module_files') // ✅ make sure this is your actual bucket name
        .remove([filePath]);

      if (storageError) {
        console.warn('⚠️ Failed to delete file from storage:', storageError.message);
      }
    }

    res.status(200).json({ message: '✅ Module, saves, and file deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user profile
app.post('/sync-user-profile', verifyFirebaseToken, async (req, res) => {
  const firebaseUser = req.user;
  const { username, fullName, pfpUrl } = req.body;

  try {
    // First check if user exists
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', firebaseUser.uid);

    if (fetchError) {
      console.error('❌ Fetch error (users):', fetchError.message);
      return res.status(500).json({ error: fetchError.message });
    }

    if (existing.length === 0) {
      // 🔹 Insert new user
      const { error: insertError } = await supabase.from('users').insert([{
        user_id: firebaseUser.uid,
        email: firebaseUser.email,
        username: username || '',
        fullName: fullName || '',
        pfpUrl: pfpUrl || ''
      }]);

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
        return res.status(500).json({ error: insertError.message });
      }

      return res.status(200).json({ message: 'Profile successfully created' });
    } else {
      // 🔄 Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username,
          fullName,
          pfpUrl
        })
        .eq('user_id', firebaseUser.uid);

      if (updateError) {
        console.error('❌ Update error:', updateError.message);
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json({ message: 'Your profile has been updated successfully!' });
    }
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get-user-profile', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', firebaseUid)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ profile: data });
  } catch (err) {
    console.error('❌ Get profile error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================
// 📊 USER ANALYTICS ROUTE
// =========================
app.get('/api/analytics/:uid', async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    const { count: uploadedCount, error: uploadError } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid);

    if (uploadError) {
      throw uploadError;
    }

    const { count: savedCount, error: savedError } = await supabase
      .from('save_modules')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid);

    if (savedError) {
      throw savedError;
    }

    res.status(200).json({
      modulesUploaded: uploadedCount || 0,
      modulesSaved: savedCount || 0,
      discussionsParticipated: 0, // 🔹 Placeholder
    });
  } catch (err) {
    console.error('❌ Analytics fetch error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve analytics data.' });
  }
});

app.get('/api/chat/history', verifyFirebaseToken, async (req, res) => {
  const uid = req.user?.uid;

  try {
    const { data, error } = await supabase
      .from('chats') // ✅ Make sure this is your actual Supabase table
      .select('*')
      .eq('user_id', uid);

    if (error) {
      console.error('❌ Supabase fetch error (chat history):', error.message);
      return res.status(500).json({ error: 'Failed to retrieve chat history.' });
    }

    res.status(200).json({ chatHistory: data });
  } catch (err) {
    console.error('❌ Server crash in /api/chat/history:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// =========================
// 🏁 ROOT ROUTE
// =========================
app.get('/', (req, res) => {
  res.send('✅ EduRetrieve backend is running!');
});

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

