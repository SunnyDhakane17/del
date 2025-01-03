'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FiPaperclip, FiSend } from 'react-icons/fi';
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';

// Import the Modal component
import Modal from './Modal';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  fromSelf: boolean;
  forwarded?: boolean;
}

interface ChatProps {
  messages: Message[];
  userName: string | null;
  waId: string;
  businessPhoneNumber: string;
  onToggleRealTime?: (isRealTime: boolean) => Promise<void>;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  userName,
  waId,
  businessPhoneNumber,
  onToggleRealTime,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Hardcoded values (replace with actual data)
  const [waIdState] = useState<string>('919356909868');
  const [phoneNumberId] = useState<string>('415502118314042');
  const [businessPhoneNumberState] = useState<string>('15551008641');

  useEffect(() => {
    setIsClient(true);
    // Initial logs
    console.log('Initial waId:', waIdState);
    console.log('Initial phoneNumberId:', phoneNumberId);
    console.log('Initial businessPhoneNumberState:', businessPhoneNumberState);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  

  // Fetch signed URLs for messages containing S3 references
  useEffect(() => {
    const s3Messages = messages.filter((msg) => isS3Reference(msg.text));
  
    // For each S3 reference message, check if we already have a signed URL
    // If not, fetch it.
    s3Messages.forEach((msg) => {
      const compositeKey = `${waId}_${msg.id}`;
      if (signedUrls[compositeKey]) return; // If we already have it, do nothing
  
      const { bucketName, region, key } = parseS3Reference(msg.text);
  
      fetch('/api/get-signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName, region, key }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.url) {
            setSignedUrls((prev) => ({ ...prev, [compositeKey]: data.url }));
          } else {
            console.error('Failed to get signed URL:', data.error);
          }
        })
        .catch((error) => {
          console.error('Error fetching signed URL:', error);
        });
    });
  }, [messages, waId, signedUrls]);
  

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false); // Close the emoji picker after selection
  };

  const updateResponseMode = async (mode: "manual" | "auto" ) => {
    try {
      const response = await fetch('/api/update-response-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waId: waIdState,
          responseMode: mode,
          businessPhoneNumber: businessPhoneNumberState,
        }),
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error updating response mode:', errorDetails);
        return;
      }
  
      // Define the agent message based on the mode
      const agentMessage =
        mode === 'manual' ? 'Agent at your service....' : 'Continue with our AI';
  
      const msg = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waId: waIdState,
          phoneNumberId,
          businessPhoneNumber: businessPhoneNumberState,
          message: agentMessage,
        }),
      });
  
      if (!msg.ok) {
        const errorDetails = await msg.json();
        console.error('Error sending message:', errorDetails);
        return;
      }
  
      console.log(`Response mode updated to ${mode} for user ${waIdState}`);
    } catch (error) {
      console.error('Error updating response mode:', error);
    }
  };

  const handleToggle = async () => {
    const newMode = isRealTime ? 'auto' : 'manual';
    setIsRealTime(!isRealTime);
    await updateResponseMode(newMode);

    // Notify parent component if onToggleRealTime is provided
    if (onToggleRealTime) {
      await onToggleRealTime(!isRealTime);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waId: waIdState,
          phoneNumberId,
          businessPhoneNumber: businessPhoneNumberState,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send message');
        return;
      }

      const data = await response.json();
      console.log('Message sent successfully:', data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Helper functions to detect and parse S3 references
  const isS3Reference = (text: string): boolean => {
    const parts = text.trim().split(',');
    if (parts.length !== 3) {
      return false;
    }

    const [bucketName, region, key] = parts;

    // Basic validation to ensure none of the parts are empty
    if (!bucketName || !region || !key) {
      return false;
    }

    // Optionally validate the AWS region
    const awsRegions = [
      'us-east-1',
      'us-east-2',
      'us-west-1',
      'us-west-2',
      'ap-south-1',
      // Add other regions as needed
    ];
    if (!awsRegions.includes(region)) {
      return false;
    }

    // Validate the key (ensure it has at least one '/' and a valid file extension)
    const keyParts = key.split('/');
    if (keyParts.length < 1) {
      return false;
    }
    const fileName = keyParts[keyParts.length - 1];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const validExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'mp4',
      'avi',
      'mkv',
      'mov',
      'webm',
      'mp3',
      'wav',
      'ogg',
      'pdf',
      'doc',
      'docx',
      'txt',
      'xlsx',
      'pptx',
      'webp'
    ];
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      return false;
    }

    return true;
  };

  const parseS3Reference = (
    text: string
  ): { bucketName: string; region: string; key: string } => {
    const [bucketName, region, key] = text.trim().split(',');
    console.log(bucketName, key);
    return { bucketName, region, key };
  };

  // Function to open media in full screen
  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalContent(null);
  };

  // Helper function to render media based on file extension
  const renderMedia = (signedUrl: string, originalText: string) => {
    const { key } = parseS3Reference(originalText);
    const fileExtension = key.split('.').pop()?.toLowerCase();
  
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx'];

    if (fileExtension && imageExtensions.includes(fileExtension)) {
      return (
        <div
          className="cursor-pointer"
          onClick={() =>
            openModal(
              <img src={signedUrl} alt="Image" className="max-w-full max-h-full" />
            )
          }
        >
          <img
            src={signedUrl}
            alt="Image"
            className="max-w-xs max-h-48 object-cover rounded"
          />
        </div>
      );
    } else if (fileExtension && videoExtensions.includes(fileExtension)) {
      return (
        <div
          className="cursor-pointer"
          onClick={() =>
            openModal(
              <video controls autoPlay className="max-w-full max-h-full">
                <source src={signedUrl} type={`video/${fileExtension}`} />
                Your browser does not support the video tag.
              </video>
            )
          }
        >
          <video
            className="max-w-xs max-h-48 object-cover rounded"
            muted
            loop
            preload="metadata"
          >
            <source src={signedUrl + '#t=0.1'} type={`video/${fileExtension}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (fileExtension && audioExtensions.includes(fileExtension)) {
      return (
        <div
          className="cursor-pointer"
          onClick={() =>
            openModal(
              <audio controls autoPlay className="w-full">
                <source src={signedUrl} type={`audio/${fileExtension}`} />
                Your browser does not support the audio element.
              </audio>
            )
          }
        >
          <audio controls className="w-48">
            <source src={signedUrl} type={`audio/${fileExtension}`} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (fileExtension && documentExtensions.includes(fileExtension)) {
      return (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          View Document
        </a>
      );
    } else {
      // For unknown file types, just render a link
      return (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Download File
        </a>
      );
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col relative">
      {userName ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-white shadow-lg">
            <div className="flex items-center space-x-3 animate-fadeIn">
              <div className="relative w-10 h-10">
                <Image
                  src="https://via.placeholder.com/32"
                  alt="User Avatar"
                  fill
                  className="rounded-full border-2 border-white shadow-lg"
                />
              </div>
              <span className="text-lg font-bold text-black drop-shadow-sm">
                {userName}
              </span>
            </div>
            <div className="flex items-center space-x-2 animate-fadeIn">
              <label className="flex items-center cursor-pointer space-x-2">
                <span className="text-white font-medium">Go RealTime</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isRealTime}
                    onChange={handleToggle}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full shadow-inner transition-colors ${
                      isRealTime ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0 left-0 w-5 h-5 rounded-full shadow transform transition-transform ${
                      isRealTime ? 'translate-x-5 bg-white' : 'bg-gray-500'
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* Message Container */}
          <div
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto p-4 custom-scrollbar relative"
            style={{
              backgroundImage: `linear-gradient(to bottom right, #ece9e6, #ffffff)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {messages.map((msg) =>
              msg.text.trim() ? (
                <div
                  key={msg.id}
                  className={`my-4 flex ${msg.fromSelf ? 'justify-start' : 'justify-end'} transition-all duration-200 animate-slideUp`}
                >
                  <div className="flex flex-col max-w-[80%]">
                    {msg.forwarded && (
                      <p className="text-xs text-gray-500 mb-1 italic">Forwarded</p>
                    )}
                    <div
                      className={`inline-block px-4 py-2 rounded-3xl shadow-xl relative overflow-hidden ${
                        msg.fromSelf
                          ? 'bg-white text-gray-900'
                          : 'bg-green-100 text-gray-900'
                      }`}
                      style={{
                        borderTopRightRadius: msg.fromSelf ? '1.5rem' : '0.5rem',
                        borderTopLeftRadius: msg.fromSelf ? '0.5rem' : '1.5rem',
                      }}
                    >
                      <div className="flex items-start">
                        {signedUrls[`${waId}_${msg.id}`] ? (
                          renderMedia(signedUrls[`${waId}_${msg.id}`], msg.text)
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className="text-xs text-gray-600 opacity-80">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors rounded-3xl pointer-events-none"></div>

                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>

          {/* Input Field */}
          <div
            className={`flex items-center p-3 border-t border-gray-300 bg-white ${isRealTime ? '' : 'opacity-60 pointer-events-none'}`}
          >
            <button
              className="w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              disabled={!isRealTime}
            >
              😀
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-3 z-50 animate-fadeIn">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow mx-2 p-2 rounded-full outline-none border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 transition-shadow"
              disabled={!isRealTime}
            />
            <button
              className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={handleSendMessage}
              disabled={!isRealTime}
            >
              <FiSend size={20} />
            </button>
          </div>

 {/* Modal for full-screen media */}
 {modalContent && <Modal onClose={closeModal}>{modalContent}</Modal>}
        </>
      ) : (
        <div
          className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-100 via-white to-pink-100 text-black relative animate-fadeIn"
        >
          <h2 className="text-4xl font-extrabold text-gray-800 drop-shadow-md">DuneFox</h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Send and receive messages without keeping your phone online.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
          <div className="absolute bottom-4 text-xs text-gray-500 flex items-center space-x-1 animate-pulse">
            <span>🔒</span>
            <span>End-to-end encrypted</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;