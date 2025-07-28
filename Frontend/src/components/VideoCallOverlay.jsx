import React, { useEffect, useState, useContext } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Spin } from 'antd';
import { JitsiMeeting } from '@jitsi/react-sdk';

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

  useEffect(() => {
    return () => {
      if (jitsiApi) {
        console.log('Disposing Jitsi API');
        jitsiApi.dispose();
        setJitsiApi(null);
      }
    };
  }, [jitsiApi]);

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

    // Activer le partage d'écran par défaut
    externalApi.executeCommand('toggleShareScreen');
  };

  if (!roomName || !user) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <JitsiMeeting
        key={roomName}
        domain="jitsi.riot.im"
        roomName={roomName}
        onApiReady={handleApiReady}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableSimulcast: false,
          toolbarButtons: [
            'microphone', 
            'camera', 
            'desktop', // Bouton pour le partage d'écran
            'hangup', 
            'settings'
          ],
          constraints: {
            video: {
              height: {
                ideal: 720,
                max: 720,
                min: 240,
              },
            },
          },
          disableProfile: true,
          enableWelcomePage: false,
          hideConferenceTimer: false,
          enableClosePage: false,
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
          avatarUrl: user.photo || '', // Utilisation de la photo de l'utilisateur
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