const express = require('express');
const router = express.Router();
const User = require('../models/User');
const roleAuth = require('../middleware/roleAuth');

// Get all users - admin only
router.get('/', roleAuth('admin'), async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        // Nếu có từ khóa tìm kiếm
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // Tìm theo tên (không phân biệt hoa thường)
                    { email: { $regex: search, $options: 'i' } }  // Tìm theo email (không phân biệt hoa thường)
                ]
            };
        }
        
        // Lấy danh sách user và loại bỏ trường password
        const users = await User.find(query).select('-password');
        
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Delete user - admin only
router.delete('/:id', roleAuth('admin'), async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Kiểm tra nếu người dùng tự xóa tài khoản của mình
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }
        
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

module.exports = router;