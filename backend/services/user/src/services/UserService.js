const bcrypt = require('bcryptjs');
const db = require('../config/database');
const axios = require('axios');

// Event bus (RabbitMQ) - TODO: Implement actual RabbitMQ
const eventBus = {
  emit: (event, data) => {
    console.log(`📤 Event: ${event}`, data);
  }
};

class UserService {
  /**
   * Create user profile
   */
  static async createUserProfile(userId, profileData) {
    const UserProfile = db.models?.UserProfile;

    if (!UserProfile) {
      throw new Error('UserProfile model not available');
    }

    // Check if profile already exists
    const existing = await UserProfile.findOne({
      where: { user_id: userId }
    });

    if (existing) {
      throw new Error('User profile already exists');
    }

    const profile = await UserProfile.create({
      user_id: userId,
      ...profileData
    });

    return profile;
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId, email) {
    console.log('[UserService.getUserProfile] Called with:', { userId, email });
    
    const UserProfile = db.models?.UserProfile;

    if (!UserProfile) {
      console.log('[UserService.getUserProfile] ❌ UserProfile model not available');
      throw new Error('UserProfile model not available');
    }

    let profile = await UserProfile.findOne({
      where: { user_id: userId }
    });

    console.log('[UserService.getUserProfile] Found profile:', profile ? 'Yes' : 'No');

    // Create default profile if not exists
    if (!profile) {
      console.log('[UserService.getUserProfile] Creating default profile...');
      profile = await UserProfile.create({
        user_id: userId,
        first_name: '',
        last_name: '',
        email: email || '',
        phone: ''
      });
      console.log('[UserService.getUserProfile] ✅ Profile created:', profile);
    }

    return profile;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updateData) {
    const UserProfile = db.models?.UserProfile;

    if (!UserProfile) {
      throw new Error('UserProfile model not available');
    }

    const profile = await UserProfile.findOne({
      where: { user_id: userId }
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    const updated = await profile.update(updateData);

    return updated;
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId) {
    // Lazy access - get models only when needed, not at module load time
    if (!db || !db.models) {
      console.error('❌ Database not ready. db:', typeof db, 'db.models:', db?.models);
      throw new Error('Database not initialized');
    }

    const UserPreference = db.models.UserPreference || db.models.UserPreferences;

    if (!UserPreference) {
      console.error('❌ UserPreference model not found. Available models:', Object.keys(db.models || {}));
      throw new Error('UserPreference model not available');
    }

    let preferences = await UserPreference.findOne({
      where: { user_id: userId }
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await UserPreference.create({
        user_id: userId
      });
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId, updateData) {
    const UserPreference = db.models?.UserPreference || db.models?.UserPreferences;

    if (!UserPreference) {
      throw new Error('UserPreference model not available');
    }

    let preferences = await UserPreference.findOne({
      where: { user_id: userId }
    });

    if (!preferences) {
      preferences = await UserPreference.create({
        user_id: userId,
        ...updateData
      });
    } else {
      preferences = await preferences.update(updateData);
    }

    return preferences;
  }

  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    // Call Auth Service to verify and change password
    try {
      const response = await axios.post(
        `${process.env.AUTH_SERVICE_URL}/change-password`,
        {
          user_id: userId,
          old_password: oldPassword,
          new_password: newPassword
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  /**
   * Request account deletion (GDPR)
   */
  static async requestAccountDeletion(userId, email) {
    const DeletedUser = db.models.DeletedUser;

    // Create grace period (7 days)
    const graceEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const deletion = await DeletedUser.create({
      user_id: userId,
      email,
      reason: 'User requested deletion',
      grace_period_ends_at: graceEnds
    });

    // Emit event for other services to prepare
    eventBus.emit('user_deletion_requested', {
      user_id: userId,
      grace_period_ends_at: graceEnds
    });

    return {
      message: 'Account deletion requested. Your account will be permanently deleted in 7 days.',
      grace_period_ends_at: graceEnds
    };
  }

  /**
   * Cancel account deletion
   */
  static async cancelAccountDeletion(userId) {
    const DeletedUser = db.models.DeletedUser;

    const deletion = await DeletedUser.findOne({
      where: { user_id: userId, permanently_deleted_at: null }
    });

    if (!deletion) {
      throw new Error('No active deletion request found');
    }

    await deletion.destroy();

    eventBus.emit('user_deletion_cancelled', { user_id: userId });

    return { message: 'Account deletion cancelled' };
  }

  /**
   * Permanent account deletion (admin action)
   */
  static async permanentlyDeleteUser(userId) {
    const DeletedUser = db.models.DeletedUser;

    const deletion = await DeletedUser.findOne({
      where: { user_id: userId }
    });

    if (deletion) {
      await deletion.update({
        permanently_deleted_at: new Date()
      });
    }

    // Emit event for services to delete user data
    eventBus.emit('user_permanently_deleted', { user_id: userId });

    return { message: 'User permanently deleted' };
  }

  /**
   * Admin: List all users
   */
  static async listUsers(page = 1, limit = 20, search = '') {
    // Call Auth Service to get users
    try {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/admin/users`,
        {
          params: { page, limit, search }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Admin: Get user details
   */
  static async adminGetUserDetails(userId) {
    // Call Auth Service to get user
    try {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/admin/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error('User not found');
    }
  }

  /**
   * Admin: Update user
   */
  static async adminUpdateUser(userId, updateData) {
    // Call Auth Service to update user
    try {
      const response = await axios.put(
        `${process.env.AUTH_SERVICE_URL}/admin/users/${userId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to update user');
    }
  }

  /**
   * Admin: Activate user
   */
  static async adminActivateUser(userId) {
    try {
      const response = await axios.patch(
        `${process.env.AUTH_SERVICE_URL}/admin/users/${userId}/status`,
        { status: 'active' }
      );

      eventBus.emit('user_activated', { user_id: userId });

      return response.data;
    } catch (error) {
      throw new Error('Failed to activate user');
    }
  }

  /**
   * Admin: Deactivate user
   */
  static async adminDeactivateUser(userId) {
    try {
      const response = await axios.patch(
        `${process.env.AUTH_SERVICE_URL}/admin/users/${userId}/status`,
        { status: 'inactive' }
      );

      eventBus.emit('user_deactivated', { user_id: userId });

      return response.data;
    } catch (error) {
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Admin: Assign role
   */
  static async adminAssignRole(userId, roleId) {
    try {
      const response = await axios.post(
        `${process.env.AUTH_SERVICE_URL}/admin/users/${userId}/roles`,
        { role_id: roleId }
      );

      eventBus.emit('user_role_assigned', { user_id: userId, role_id: roleId });

      return response.data;
    } catch (error) {
      throw new Error('Failed to assign role');
    }
  }

  /**
   * Admin: Delete user
   */
  static async adminDeleteUser(userId) {
    try {
      const response = await axios.delete(
        `${process.env.AUTH_SERVICE_URL}/admin/users/${userId}`
      );

      eventBus.emit('user_permanently_deleted', { user_id: userId });

      return response.data;
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }
}

module.exports = UserService;
