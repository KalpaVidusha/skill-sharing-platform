import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const FollowList = ({ type, userId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      setCurrentUserId(loggedInUserId);
      fetchFollowingIds(loggedInUserId);
    }
    
    if (userId) {
      fetchUsers();
    }
  }, [userId, type]);

  const fetchFollowingIds = async (loggedInUserId) => {
    try {
      const response = await apiService.getFollowing(loggedInUserId);
      if (response && response.following) {
        const ids = response.following.map(user => user.id);
        setFollowingIds(ids);
      }
    } catch (err) {
      console.error('Error fetching following IDs:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (type === 'followers') {
        response = await apiService.getFollowers(userId);
      } else {
        response = await apiService.getFollowing(userId);
      }
      
      if (response) {
        setUsers(response[type] || []);
        setCount(response.count || 0);
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(`Failed to load ${type}. Please try again later.`);
      toast.error(`Failed to load ${type}. Please try again later.`);
      setUsers([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userToFollowId, userName) => {
    try {
      await apiService.followUser(currentUserId, userToFollowId);
      setFollowingIds([...followingIds, userToFollowId]);
      toast.success(`You started following ${userName} successfully`);
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('followStatusChanged', {
        detail: { action: 'follow', targetUserId: userToFollowId }
      }));
    } catch (err) {
      console.error('Error following user:', err);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userToUnfollowId, userName) => {
    Swal.fire({
      title: 'Confirm Unfollow',
      text: `Are you sure you want to unfollow ${userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, unfollow!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiService.unfollowUser(currentUserId, userToUnfollowId);
          setFollowingIds(followingIds.filter(id => id !== userToUnfollowId));

          Swal.fire(
            'Unfollowed!',
            `You are no longer following ${userName}.`,
            'success'
          );
          
          // Dispatch a custom event to notify other components
          window.dispatchEvent(new CustomEvent('followStatusChanged', {
            detail: { action: 'unfollow', targetUserId: userToUnfollowId }
          }));
        } catch (error) {
          console.error('Error unfollowing user:', error);
          toast.error('Failed to unfollow user');
        }
      }
    });
  };

  if (loading) {
    return <div className="p-5 text-center text-gray-600">Loading {type}...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-800 rounded text-center mb-4">{error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        {type === 'followers' ? 'Followers' : 'Following'} 
        <span className="ml-2 text-base text-gray-600">({count})</span>
      </h2>
      
      {users.length === 0 ? (
        <div className="p-4 text-center text-gray-600 bg-gray-100 rounded">
          {type === 'followers' 
            ? 'No followers yet.' 
            : 'Not following anyone yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex justify-between items-center p-3 rounded bg-gray-50">
              <div className="flex items-center gap-3">
                <img 
                  src={user.profilePicture || 'https://via.placeholder.com/40'} 
                  alt={`${user.firstName} ${user.lastName}`} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>
              
              {currentUserId !== user.id && (
                <button
                  className={followingIds.includes(user.id) 
                    ? "px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    : "px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  }
                  onClick={() => followingIds.includes(user.id) 
                    ? handleUnfollow(user.id, `${user.firstName} ${user.lastName}`) 
                    : handleFollow(user.id, `${user.firstName} ${user.lastName}`)
                  }
                >
                  {followingIds.includes(user.id) ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowList; 