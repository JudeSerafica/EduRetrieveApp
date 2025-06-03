const admin = require('firebase-admin');
const adminDb = admin.firestore();
const { FieldValue } = admin.firestore;

/**
 * Creates a new module document in Firestore.
 * @param {Object} moduleData The data for the new module (title, description, uploadedBy).
 * @returns {Promise<Object>} The created module data including its ID.
 */
async function createModule(moduleData) {
  try {
    const dataToSave = {
      ...moduleData,
      uploadedAt: FieldValue.serverTimestamp(),
    };

    const moduleRef = await adminDb.collection('modules').add(dataToSave);
    return { id: moduleRef.id, ...dataToSave };
  } catch (error) {
    console.error('Error creating module:', error);
    throw new Error('Could not create module.');
  }
}

/**
 * Fetches all modules from Firestore, ordered by upload date.
 * @returns {Promise<Array<Object>>} An array of module documents.
 */
async function getAllModules() {
  try {
    const modulesSnapshot = await adminDb.collection('modules').orderBy('uploadedAt', 'desc').get();
    const modules = [];
    modulesSnapshot.forEach(doc => {
      modules.push({ id: doc.id, ...doc.data() });
    });
    return modules;
  } catch (error) {
    console.error('Error fetching all modules:', error);
    throw new Error('Could not fetch modules.');
  }
}

/**
 * Fetches a single module by its ID.
 * @param {string} moduleId The ID of the module.
 * @returns {Promise<Object|null>} The module data or null if not found.
 */
async function getModuleById(moduleId) {
  try {
    const moduleDocRef = adminDb.collection('modules').doc(moduleId);
    const moduleDocSnap = await moduleDocRef.get();
    if (moduleDocSnap.exists) {
      return { id: moduleDocSnap.id, ...moduleDocSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching module by ID:', error);
    throw new Error('Could not fetch module.');
  }
}

/**
 * Updates an existing module.
 * @param {string} moduleId The ID of the module to update.
 * @param {Object} updateData The data to update.
 * @returns {Promise<void>}
 */
async function updateModule(moduleId, updateData) {
    try {
        const moduleDocRef = adminDb.collection('modules').doc(moduleId);
        await moduleDocRef.update(updateData);
    } catch (error) {
        console.error('Error updating module:', error);
        throw new Error('Could not update module.');
    }
}

/**
 * Deletes a module.
 * @param {string} moduleId The ID of the module to delete.
 * @returns {Promise<void>}
 */
async function deleteModule(moduleId) {
    try {
        const moduleDocRef = adminDb.collection('modules').doc(moduleId);
        await moduleDocRef.delete();
    } catch (error) {
        console.error('Error deleting module:', error);
        throw new Error('Could not delete module.');
    }
}


module.exports = {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
};