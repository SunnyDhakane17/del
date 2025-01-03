'use client';
import React, { useState } from 'react';
import { FiSearch, FiEdit3 } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  message: string;
  time: string;
  avatarUrl?: string;
  alert?: boolean;
}

interface SidebarProps {
  users: User[];
  onSelectUser: (userId: string) => void;
  businessPhoneNumber: string;
}

const Sidebar: React.FC<SidebarProps> = ({ users, onSelectUser, businessPhoneNumber }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAlertAction = (user: User) => {
    setSelectedUser(user);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedUser(null);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/update-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waId: selectedUser.id,
          businessPhoneNumber: businessPhoneNumber,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`Alert turned off for user: ${selectedUser.id}`);
        closePopup();
      } else {
        console.error(`Failed to update alert: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error while updating alert status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours}:${minutes}`;
  };

  const sortUsersByTime = (users: User[]) => {
    return users.sort((a, b) => {
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);

      const dateA = new Date();
      const dateB = new Date();

      dateA.setHours(hoursA, minutesA, 0, 0);
      dateB.setHours(hoursB, minutesB, 0, 0);

      return dateB.getTime() - dateA.getTime();
    });
  };

  const sortedUsers = sortUsersByTime(users);

  return (
    <div className="w-1/4 h-screen bg-[#f8f9fa] p-4 text-gray-800 border-r border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 text-xl font-semibold text-gray-800">
        <span>Chats</span>
        <div className="flex space-x-2 text-gray-500">
          <button className="p-1 hover:text-gray-700">
            <FiEdit3 size={20} />
          </button>
          <button className="p-1 hover:text-gray-700">
            <FiSearch size={20} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-2.5 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search or start a new chat"
          className="w-full p-2 pl-10 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300"
        />
      </div>

      {/* Chat list */}
      <div className="space-y-2">
        {sortedUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
              user.alert ? 'bg-red-200' : 'hover:bg-gray-200'
            }`}
          >
            <div
              className="w-10 h-10 rounded-full bg-gray-500 flex-shrink-0 overflow-hidden"
              onClick={() => onSelectUser(user.id)}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-400"></div>
              )}
            </div>
            <div className="flex-1 min-w-0" onClick={() => onSelectUser(user.id)}>
              <div className="flex justify-between">
                <h3 className="font-semibold text-sm truncate text-gray-800 max-w-[70%]">
                  {user.name}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTime(user.time)}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-full overflow-ellipsis whitespace-nowrap">
                {user.message}
              </p>
            </div>
            {user.alert && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAlertAction(user);
                }}
                className="ml-2 px-3 py-1 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Action
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Popup */}
      {popupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Close the case?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to close the case for{' '}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Closing...' : 'Close Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
