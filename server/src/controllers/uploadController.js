const moduleModel = require('../model/moduleModel');

exports.uploadModule = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title || !description) {
      return res.status(400).json({ message: 'Module title and outline are required.' });
    }

    // Validate authentication
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Prepare new module data
    const newModuleData = {
      title,
      description,
      uploadedBy: req.user.uid, // Or req.user.id if using Supabase
    };

    // Save to DB
    const createdModule = await moduleModel.createModule(newModuleData);

    res.status(201).json({
      message: 'Module outline submitted successfully.',
      moduleId: createdModule.id,
    });

  } catch (error) {
    console.error('Error submitting module outline:', error);
    res.status(500).json({ message: `Error submitting module outline: ${error.message}` });
  }
};
