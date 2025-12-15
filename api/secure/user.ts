import { Router, type Request, type Response } from 'express';
import { User } from '../../database/models/User.ts';

const router = Router();

// Update User Profile
router.post('/update', function (request: Request, response: Response) {
    const user = request.body.user;
    const updateData = request.body.data;

    delete updateData.password; // Prevent password update here
    delete updateData.email;    // Prevent email update here
    delete updateData.findCode; // Prevent findCode update here
    delete updateData.isVerified; // Prevent isVerified update here
    delete updateData._id;      // Prevent _id update here
    delete updateData.__v;     // Prevent __v update here
    delete updateData.createdAt; // Prevent createdAt update here
    delete updateData.updatedAt; // Prevent updatedAt update here
    delete updateData.isOnboarded; // Prevent isOnboarded update here

    User.findByIdAndUpdate(user.userId, updateData, { new: true }).then(function (updatedUser) {
        if (!updatedUser) {
            response.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        response.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
    }).catch(function (error) {
        response.status(500).json({ success: false, message: 'User update failed', error: error });
    });
});

export default router;
