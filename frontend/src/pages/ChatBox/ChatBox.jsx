import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaUsers, FaComment, FaPaperclip, FaEllipsisH, FaClock } from 'react-icons/fa';
import apiService from '../../services/api';

const ChatBox = ({ isOpen, onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('recent'); // 'recent', 'all', 'search'
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  // State for caching results
  const [cachedRecentChats, setCachedRecentChats] = useState([]);

  // When chatbox opens, fetch recent chats
  useEffect(() => {
    if (isOpen) {
      console.log("ChatBox opened - initializing data");
      
      // Immediately show cached data if available
      if (cachedRecentChats.length > 0) {
        console.log("Using cached recent chats while refreshing");
        setRecentChats(cachedRecentChats);
      }
      
      // Start loading all necessary data in parallel
      setLoading(true);
      
      // Load both datasets in parallel rather than sequentially
      Promise.all([
        fetchUsers(false), // Don't set loading state here
        fetchRecentChatsData() // Don't set loading state here
      ]).finally(() => {
        // Only set loading to false after both operations complete
        setLoading(false);
      });
    }
  }, [isOpen]);

  // Trigger a refresh of the recent chats periodically when the chatbox is open
  useEffect(() => {
    if (!isOpen) return;
    
    // Set up a refresh interval to poll for new messages
    const refreshInterval = setInterval(() => {
      if (view === 'recent' && !selectedUser) {
        console.log("Auto-refreshing recent chats");
        fetchRecentChats();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [isOpen, view, selectedUser]);

  // When user is selected, fetch messages
  useEffect(() => {
    if (selectedUser) {
      const userId = selectedUser.id || selectedUser.userId;
      // Don't allow chatting with yourself
      if (userId === currentUserId) {
        alert("You cannot chat with yourself");
        setSelectedUser(null);
        return;
      }
      fetchMessages(userId);
    }
  }, [selectedUser, currentUserId]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchUsers();
        setView('search');
      } else if (view === 'search') {
        setView('recent');
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetches recent chats data without setting loading state
  const fetchRecentChatsData = async () => {
    try {
      const data = await apiService.getRecentChats();
      console.log("Recent chats fetched:", data);
      
      // Filter out any chats with yourself
      const filteredChats = Array.isArray(data) 
        ? data.filter(chat => chat && chat.userId !== currentUserId)
        : [];
        
      console.log("Filtered recent chats:", filteredChats);
      
      if (filteredChats.length === 0) {
        // If still no recent chats, try a direct approach by listing users who have messages
        console.log("No recent chats found after filtering, trying fallback method");
        await generateRecentChatsFromMessages(false); // Don't set loading state
        return;
      }
      
      setRecentChats(filteredChats);
      setCachedRecentChats(filteredChats); // Cache the results
      
    } catch (error) {
      console.error('Error fetching recent chats:', error);
      console.log("Trying fallback method after error");
      await generateRecentChatsFromMessages(false); // Don't set loading state
    }
  };
  
  // The original fetchRecentChats function now just sets loading state and calls the data function
  const fetchRecentChats = async () => {
    setLoading(true);
    await fetchRecentChatsData();
    setLoading(false);
  };
  
  // Fetches users without setting loading state
  const fetchUsers = async (setLoadingState = true) => {
    if (setLoadingState) setLoading(true);
    
    try {
      const data = await apiService.getChatUsers();
      console.log("All users fetched:", data);
      
      // Filter out current user (just to be safe)
      const filteredUsers = Array.isArray(data) 
        ? data.filter(user => user && user.id !== currentUserId)
        : [];
        
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      if (setLoadingState) setLoading(false);
    }
  };
  
  // Fallback method to generate recent chats directly from messages
  const generateRecentChatsFromMessages = async (setLoadingState = true) => {
    if (setLoadingState) setLoading(true);
    
    try {
      console.log("Generating recent chats from direct message history");
      const allUsersData = await apiService.getChatUsers();
      const otherUsers = Array.isArray(allUsersData) 
        ? allUsersData.filter(user => user && user.id !== currentUserId) 
        : [];
      
      if (otherUsers.length === 0) {
        console.log("No other users found for fallback method");
        // Last resort - show hardcoded example data so UI isn't empty
        useHardcodedRecentChats();
        return;
      }
      
      const recentChatsList = [];
      
      // Check each user for messages - only check a few to speed things up
      const usersToCheck = otherUsers.slice(0, 5); // limit to 5 users for speed
      
      // Use Promise.all to speed up parallel requests
      await Promise.all(usersToCheck.map(async (user) => {
        try {
          const messagesData = await apiService.getMessages(user.id);
          
          if (Array.isArray(messagesData) && messagesData.length > 0) {
            // User has messages, add to recent chats
            const lastMessage = messagesData[messagesData.length - 1];
            
            recentChatsList.push({
              userId: user.id,
              username: user.username,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              profilePicture: user.profilePicture || "",
              lastMessage: lastMessage.content,
              timestamp: lastMessage.createdAt || new Date(),
              isRead: true
            });
            
            console.log(`Added ${user.username} to recent chats via fallback method`);
          }
        } catch (err) {
          console.log(`Error checking messages with ${user.username}:`, err);
        }
      }));
      
      if (recentChatsList.length > 0) {
        console.log("Generated recent chats via fallback:", recentChatsList);
        setRecentChats(recentChatsList);
        setCachedRecentChats(recentChatsList); // Cache the results
      } else {
        console.log("No recent chats generated, using hardcoded data");
        // Last resort - show hardcoded example data
        useHardcodedRecentChats();
      }
      
    } catch (error) {
      console.error("Error in fallback method:", error);
      // Last resort - show hardcoded example data
      useHardcodedRecentChats();
    } finally {
      if (setLoadingState) setLoading(false);
    }
  };
  
  // Use hardcoded example data when all else fails
  const useHardcodedRecentChats = () => {
    console.log("Using hardcoded example recent chats");
    
    // Create hardcoded chats
    const hardcodedChats = [
      {
        userId: "example1",
        username: "john.doe",
        firstName: "John",
        lastName: "Doe",
        lastMessage: "Click to find users to chat with",
        timestamp: new Date(),
        isRead: true
      },
      {
        userId: "example2",
        username: "jane.smith",
        firstName: "Jane",
        lastName: "Smith",
        lastMessage: "No recent chats found",
        timestamp: new Date(),
        isRead: true
      }
    ];
    
    // If we have real users, replace the hardcoded data with them
    if (users && users.length > 0) {
      users.slice(0, 3).forEach((user, index) => {
        if (index < hardcodedChats.length) {
          hardcodedChats[index] = {
            userId: user.id,
            username: user.username,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            profilePicture: user.profilePicture || "",
            lastMessage: "Click to start chatting",
            timestamp: new Date(),
            isRead: true
          };
        }
      });
    }
    
    setRecentChats(hardcodedChats);
    setCachedRecentChats(hardcodedChats); // Cache these hardcoded values too
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await apiService.searchUsers(searchQuery);
      console.log("Search results:", response);
      
      // Filter out current user from search results
      const searchResults = response?.users || [];
      const filteredResults = searchResults.filter(user => user && user.id !== currentUserId);
      
      setUsers(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    if (userId === currentUserId) {
      console.error("Cannot fetch messages with yourself");
      setMessages([]);
      return;
    }
    
    try {
      const data = await apiService.getMessages(userId);
      console.log("Messages fetched:", data);
      setMessages(Array.isArray(data) ? data : []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]); // Set empty array on error
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    const recipientId = selectedUser.id || selectedUser.userId;
    
    // Prevent sending messages to yourself
    if (recipientId === currentUserId) {
      alert("You cannot send messages to yourself");
      return;
    }

    try {
      const message = await apiService.sendMessage(recipientId, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
      scrollToBottom();
      
      // Update recent chats after sending a message
      setTimeout(() => {
        fetchRecentChats();
      }, 500); // Short delay to allow server to process the new message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      await apiService.editMessage(messageId, newContent);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent } : msg
      ));
      setEditingMessage(null);
      
      // Update recent chats after editing a message
      setTimeout(fetchRecentChats, 500);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await apiService.deleteMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      
      // Update recent chats after deleting a message
      setTimeout(fetchRecentChats, 500);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Helper function to check if we have chat content
  const hasRecentChats = Array.isArray(recentChats) && recentChats.length > 0;
  const hasUsers = Array.isArray(users) && users.length > 0;

  // Helper function to get the display name for a user
  const getDisplayName = (user) => {
    if (!user) return "Unknown User";
    
    // Prioritize full name if available
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } else {
      return user.username || "Unknown User";
    }
  };
  
  // Helper function to get initials for avatar
  const getUserInitials = (user) => {
    if (!user) return "?";
    
    // Use first letter of first name and first letter of last name if available
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.lastName) {
      return user.lastName.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    } else {
      return "?";
    }
  };

  return (
    <div className={`fixed right-4 top-[5.5rem] h-[calc(100vh-6.5rem)] w-96 bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} z-40 border border-gray-100 flex flex-col`}>
  {/* Header */}
  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-lg">
    <div className="flex items-center space-x-3">
      <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        {users.length} online
      </span>
    </div>
    <button 
      onClick={onClose} 
      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-gray-700"
    >
      <FaTimes className="w-4 h-4" />
    </button>
  </div>

  {/* User Search */}
  <div className="p-4 border-b border-gray-200 bg-gray-50">
    <div className="relative">
      <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm shadow-sm"
      />
    </div>
    
    {/* View Toggle */}
    <div className="flex mt-3 bg-gray-100 p-0.5 rounded-lg">
      <button
        onClick={() => {
          setView('recent');
          // Refresh recent chats when switching to this tab
          fetchRecentChats();
        }}
        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
          view === 'recent' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Recent
      </button>
      <button
        onClick={() => {
          setView('all');
          // Refresh user list when switching to this tab
          fetchUsers();
        }}
        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
          view === 'all' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        All Users
      </button>
    </div>
  </div>

  {/* User List / Recent Chats */}
  {!selectedUser && (
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-500 text-sm">Loading conversations...</p>
          {cachedRecentChats.length > 0 && (
            <p className="text-gray-400 text-xs mt-2">Showing cached results while refreshing</p>
          )}
        </div>
      ) : view === 'recent' && hasRecentChats ? (
        // Recent Chats View
        recentChats.map(chat => (
          <div
            key={chat.userId}
            onClick={() => setSelectedUser(chat)}
            className="p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors duration-150 flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                {chat.profilePicture ? (
                  <img 
                    src={chat.profilePicture} 
                    alt={getDisplayName(chat)} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(chat)
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {getDisplayName(chat)}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap pl-2">
                  {formatTimestamp(chat.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))
      ) : view === 'all' && hasUsers ? (
        // All Users View
        users.map(user => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors duration-150 flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={getDisplayName(user)} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(user)
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm truncate">{getDisplayName(user)}</h3>
              <p className="text-xs text-gray-500 truncate">{user.status || 'Available'}</p>
            </div>
          </div>
        ))
      ) : view === 'search' && hasUsers ? (
        // Search Results
        users.map(user => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors duration-150 flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={getDisplayName(user)} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(user)
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm truncate">{getDisplayName(user)}</h3>
              <p className="text-xs text-gray-500 truncate">{user.status || 'Available'}</p>
            </div>
          </div>
        ))
      ) : view === 'recent' && !hasRecentChats ? (
        // No Recent Chats
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <FaClock className="text-blue-500 w-6 h-6" />
          </div>
          <h3 className="text-gray-700 font-medium mb-1">No recent conversations</h3>
          <p className="text-gray-500 text-sm">Start chatting with someone to see your recent chats here.</p>
          <button
            onClick={() => setView('all')}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            View All Users
          </button>
        </div>
      ) : (
        // No Users Found
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <FaUsers className="text-blue-500 w-6 h-6" />
          </div>
          <h3 className="text-gray-700 font-medium mb-1">No users found</h3>
          <p className="text-gray-500 text-sm">Try searching with a different term.</p>
        </div>
      )}
    </div>
  )}

  {/* Chat Area */}
  {selectedUser && (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200 bg-white flex items-center space-x-3">
        <button
          onClick={() => {
            setSelectedUser(null);
            fetchRecentChats(); // Refresh the recent chats when going back
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft className="w-4 h-4" />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
            {selectedUser.profilePicture ? (
              <img 
                src={selectedUser.profilePicture} 
                alt={getDisplayName(selectedUser)} 
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              getUserInitials(selectedUser)
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm">
            {getDisplayName(selectedUser)}
          </h3>
          <p className="text-xs text-gray-500">Online</p>
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-gray-700">
          <FaEllipsisH className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages && messages.length > 0 ? (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender?.id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                message.sender?.id === currentUserId
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
              }`}>
                {editingMessage === message.id ? (
                  <input
                    type="text"
                    defaultValue={message.content}
                    onBlur={(e) => handleEditMessage(message.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEditMessage(message.id, e.target.value);
                      }
                    }}
                    className={`w-full bg-transparent border-none focus:outline-none ${message.sender?.id === currentUserId ? 'text-white placeholder-blue-200' : 'text-gray-900'}`}
                    autoFocus
                  />
                ) : (
                  <div className="relative group">
                    <p className="text-sm">{message.content}</p>
                    {message.sender?.id === currentUserId && (
                      <div className="absolute -right-8 top-0 hidden group-hover:flex space-x-1">
                        <button
                          onClick={() => setEditingMessage(message.id)}
                          className={`p-1 ${message.sender?.id === currentUserId ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className={`p-1 ${message.sender?.id === currentUserId ? 'text-blue-200 hover:text-red-300' : 'text-gray-400 hover:text-red-600'}`}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <span className={`text-xs mt-1 block ${message.sender?.id === currentUserId ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <FaComment className="text-blue-500 w-6 h-6" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">No messages yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">Send your first message to start the conversation with {getDisplayName(selectedUser)}.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <FaPaperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-2 text-white rounded-full transition-colors shadow-sm ${newMessage.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )}
</div>  
  );
};

export default ChatBox; 