import React, { useEffect, useState, useContext } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Spin } from 'antd';
import { JitsiMeeting } from '@jitsi/react-sdk';
import axios from 'axios';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
};

const VideoCallOverlay = ({ roomName, onEndCall, user }) => {
  const { socket } = useContext(ChatContext);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [jitsiToken, setJitsiToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
useEffect(() => {
  const fetchJitsiToken = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/generate-jitsi-token`,
        {
          roomName,
          userId: user.id,
          username: user.username,
          avatarUrl: user.photo || ''
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Token response:', response.data); // Debug log
      if (response.data.token) {
        setJitsiToken(response.data.token);
        setLoading(false);
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error('Token fetch error:', error);
      setError(error.response?.data?.message || 'Failed to initialize call. Please try again.');
      setLoading(false);
    }
  };

  fetchJitsiToken();
}, [roomName, user]);
// In your VideoCallOverlay component
useEffect(() => {
  const handleJitsiError = (error) => {
    console.error('Jitsi error:', error);
    if (error === 'conference.setup_failed') {
      setError('Failed to join the call. Please try again.');
    }
  };

  if (jitsiApi) {
    jitsiApi.on('conferenceError', handleJitsiError);
  }

  return () => {
    if (jitsiApi) {
      jitsiApi.off('conferenceError', handleJitsiError);
    }
  };
}, [jitsiApi]);
  // Gestion des événements Socket.IO
  useEffect(() => {
    if (!socket || !roomName) return;

    const handleCallEnded = () => {
      if (jitsiApi) {
        jitsiApi.dispose();
        setJitsiApi(null);
      }
      onEndCall();
    };

    socket.on('video_call_ended', handleCallEnded);
    socket.on('call_terminated', handleCallEnded);

    return () => {
      socket.off('video_call_ended', handleCallEnded);
      socket.off('call_terminated', handleCallEnded);
    };
  }, [socket, roomName, onEndCall, jitsiApi]);

  // Nettoyage de l'API Jitsi
  useEffect(() => {
    return () => {
      if (jitsiApi) {
        console.log('Disposing Jitsi API');
        jitsiApi.dispose();
        setJitsiApi(null);
      }
    };
  }, [jitsiApi]);
  
useEffect(() => {
  console.log('Jitsi Token:', jitsiToken); // Ajoutez ce log
}, [jitsiToken]);
  const handleApiReady = (externalApi) => {
    console.log('Jitsi API ready for room:', roomName);
    setJitsiApi(externalApi);

    externalApi.on('readyToClose', () => {
      console.log('Jitsi readyToClose event');
      onEndCall();
    });

    externalApi.on('participantJoined', (participant) => {
      console.log('Participant joined:', participant);
    });

    externalApi.on('participantLeft', (participant) => {
      console.log('Participant left:', participant);
      if (externalApi.getParticipantsInfo().length <= 1) {
        onEndCall();
      }
    });
  };

  if (error) {
    return <div style={overlayStyle}>Error: {error}</div>;
  }

  if (loading || !jitsiToken) {
    return <div style={overlayStyle}><Spin size="large" /></div>;
  }

  return (
     <div style={overlayStyle}>
      <JitsiMeeting
        domain="8x8.vc"
        roomName={roomName}
        jwt={jitsiToken}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          enableNoisyMicDetection: false,
          prejoinPageEnabled: false,
          enableClosePage: false,
          disableInviteFunctions: true,
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'select-background', 'download', 'help', 'mute-everyone'
          ],
        }}
      interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
          DEFAULT_LOCAL_DISPLAY_NAME: user.username,
        }}
        userInfo={{
          displayName: user.username,
          email: user.email || '',
        }}
       onApiReady={(externalApi) => {
          setJitsiApi(externalApi);
          externalApi.executeCommand('displayName', user.username);
          externalApi.executeCommand('toggleTileView');
        }}
           getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
};


export default VideoCallOverlay;