import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PostInteractionSection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const postId = location.state?.postId;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const currentUserId = localStorage.getItem('userId'); // 👈 Assuming this was set during login

  useEffect(() => {
    if (!postId) return;
    fetch(`http://localhost:8080/api/comments/post/${postId}`)
      .then(res => res.json())
      .then(setComments)
      .catch((err) => console.error('Failed to fetch comments:', err));
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    try {
      await fetch('http://localhost:8080/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUserId, content: newComment })
      });

      setNewComment('');

      const res = await fetch(`http://localhost:8080/api/comments/post/${postId}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!postId) {
    return (
      <div style={{ color: 'red', textAlign: 'center', paddingTop: '20px' }}>
        No post selected. <br />
        <button
          onClick={() => navigate('/posts')}
          style={{
            marginTop: '10px',
            backgroundColor: '#2684ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded mt-10">
      <h2 className="text-xl font-bold mb-4">Comments</h2>

      <textarea
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full border p-2 rounded mb-2"
        rows={3}
      />
      <button
        onClick={handleAddComment}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Comment
      </button>

      <div className="mt-6">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-t pt-3 mt-3">
              <p>{comment.content}</p>
              <small className="text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostInteractionSection;
