import React, { useEffect, useState, useContext } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Spin, Button } from 'antd';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { CloseOutlined } from '@ant-design/icons';

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

    const handleParticipantLeft = (participant) => {
      console.log('Participant left:', participant);
      if (jitsiApi) {
        const participants = jitsiApi.getParticipantsInfo();
        if (participants.length <= 1) {
          endCall();
        }
      }
    };

    const handleReadyToClose = () => {
      console.log('Jitsi readyToClose event');
      endCall();
    };

    const handleConferenceLeft = () => {
      console.log('Conference left event');
      endCall();
    };

    if (jitsiApi) {
      jitsiApi.on('participantLeft', handleParticipantLeft);
      jitsiApi.on('readyToClose', handleReadyToClose);
      jitsiApi.on('conferenceLeft', handleConferenceLeft);
    }

    return () => {
      if (jitsiApi) {
        jitsiApi.off('participantLeft', handleParticipantLeft);
        jitsiApi.off('readyToClose', handleReadyToClose);
        jitsiApi.off('conferenceLeft', handleConferenceLeft);
      }
    };
  }, [jitsiApi, socket, roomName]);

  const endCall = () => {
    if (socket && roomName) {
      socket.emit('end_video_call', { roomName });
    }
    if (jitsiApi) {
      jitsiApi.dispose();
      setJitsiApi(null);
    }
    onEndCall();
  };

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
  };

  if (!roomName || !user) {
    return null;
  }

  const endCallButtonStyle = {
    position: 'absolute',
      top: '20px',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1001,
    backgroundColor: '#ff4d4f',
    borderColor: '#ff4d4f',
    color: 'white',
    fontWeight: 'bold',
  };

  return (
    <div style={overlayStyle}>
      <JitsiMeeting
        key={roomName}
        domain="meet.jit.si"
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
            'desktop',
           
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
          enableNoisyMicDetection: false,
          disableDeepLinking: true,
          disableInviteFunctions: true,
          requireDisplayName: false,
          enableEmailInStats: false,
          disableRemoteMute: true,
          enableFeaturesBasedOnToken: false,
          enableForcedReload: false,
          enableLayerSuspension: false,
          enableNoAudioDetection: false,
          enableTalkWhileMuted: false,
          hideLobbyButton: true,
          hideConferenceSubject: true,
          hideParticipantsStats: true,
          hideRecordingLabel: true,
          hideShareAudioHelper: true,
          mobileAppPromo: false,
          remoteVideoMenu: {
            disableKick: true
          },
          startAudioOnly: false,
          startAudioMuted: 0,
          startVideoMuted: 0,
          subject: 'Video Call',
          testing: {
            disableE2EE: false,
            p2pTestMode: false
          },
          videoQuality: {
            preferredCodec: 'VP8',
            maxBitratesVideo: {
              low: 200000,
              standard: 500000,
              high: 1500000
            }
          }
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
          DEFAULT_LOCAL_DISPLAY_NAME: user.username,
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          DISABLE_PRESENCE_STATUS: true,
          DISABLE_TRANSCRIPTION_SUBTITLES: true,
          DISABLE_VIDEO_BACKGROUND: true,
          DISABLE_FOCUS_INDICATOR: true,
          DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
          DISABLE_RINGING: true,
          ENABLE_DIAL_OUT: false,
          ENABLE_FEEDBACK_ANIMATION: false,
          FILM_STRIP_MAX_HEIGHT: 120,
          GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
          INITIAL_TOOLBAR_TIMEOUT: 20000,
          JITSI_WATERMARK_LINK: '',
          LANG_DETECTION: false,
          LOCAL_THUMBNAIL_RATIO: 16/9,
          MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
          NATIVE_APP_NAME: 'Your App',
          OPTIMAL_BROWSERS: ['chrome', 'firefox', 'safari'],
          RECENT_LIST_ENABLED: false,
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator'],
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SUPPORT_URL: '',
          TOOLBAR_ALWAYS_VISIBLE: true,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
          TOOLBAR_TIMEOUT: 4000,
          VERTICAL_FILMSTRIP: true,
          VIDEO_LAYOUT_FIT: 'both',
          TILE_VIEW_MAX_COLUMNS: 5
        }}
        userInfo={{
          displayName: user.username,
          email: user.email || '',
          avatarUrl: user.photo || '',
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
      <Button 
        style={endCallButtonStyle}
        onClick={() => endCall()}
        icon={<CloseOutlined />}
      >
        End Call
      </Button>
    </div>
  );
};

export default VideoCallOverlay;