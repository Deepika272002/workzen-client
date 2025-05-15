import React, { createContext, useContext, useState, useEffect } from 'react';

const VideoSDKContext = createContext();

export const useVideoSDK = () => useContext(VideoSDKContext);

export const VideoSDKProvider = ({ children }) => {
  // Media devices state
  const [selectedMic, setSelectedMic] = useState({ id: null, label: null });
  const [selectedWebcam, setSelectedWebcam] = useState({ id: null, label: null });
  const [selectedSpeaker, setSelectedSpeaker] = useState({ id: null, label: null });
  
  // Permission states
  const [isCameraPermissionAllowed, setIsCameraPermissionAllowed] = useState(false);
  const [isMicrophonePermissionAllowed, setIsMicrophonePermissionAllowed] = useState(false);
  
  // Meeting states
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState([]);

  // Handle raised hand participants
  const useRaisedHandParticipants = () => {
    const participantRaisedHand = (participantId) => {
      setRaisedHandsParticipants((prev) => {
        if (!prev.includes(participantId)) {
          return [...prev, participantId];
        }
        return prev;
      });

      // Remove participant from raised hand after 15 seconds
      setTimeout(() => {
        setRaisedHandsParticipants((prev) =>
          prev.filter((id) => id !== participantId)
        );
      }, 15000);
    };

    return { participantRaisedHand };
  };

  const value = {
    selectedMic,
    setSelectedMic,
    selectedWebcam,
    setSelectedWebcam,
    selectedSpeaker,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    setIsCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsMicrophonePermissionAllowed,
    raisedHandsParticipants,
    useRaisedHandParticipants,
  };

  return (
    <VideoSDKContext.Provider value={value}>
      {children}
    </VideoSDKContext.Provider>
  );
}; 