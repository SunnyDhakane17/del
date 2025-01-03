'use client';
import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  lastMessage: string;
  online?: boolean;
  alert?: boolean;
}

interface UserCardProps {
  user: User;
  onSelect: () => void;
  onAlertAction?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelect, onAlertAction }) => {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center p-2 mb-2 cursor-pointer rounded-lg ${
        user.alert ? 'bg-red-200' : 'hover:bg-gray-200'
      }`}
    >
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-gray-800">{user.name}</h2>
        <p className="text-xs text-gray-500 truncate overflow-ellipsis whitespace-nowrap">
          {user.lastMessage}
        </p>
      </div>
      {user.online && (
        <span className="w-3 h-3 bg-green-500 rounded-full ml-2"></span>
      )}
      {user.alert && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering `onSelect`
            onAlertAction?.();
          }}
          className="ml-2 px-3 py-1 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600"
        >
          Action
        </button>
      )}
    </div>
  );
};

export default UserCard;
