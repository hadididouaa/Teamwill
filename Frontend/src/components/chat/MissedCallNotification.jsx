// frontend/src/components/MissedCallNotification.jsx
import React from 'react';
import { notification, Button, Avatar } from 'antd';
import { PhoneOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';

export const showMissedCallNotification = (caller, onCallBack) => {
  const key = `missed_call_${caller.id}_${Date.now()}`;
  
  notification.open({
    key,
    message: 'Missed Call',
    description: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Avatar src={caller.photo} icon={<UserOutlined />} />
        <div>
          <div>{caller.name}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            Missed video call
          </div>
        </div>
      </div>
    ),
    btn: (
      <Button 
        type="primary" 
        icon={<PhoneOutlined />}
        onClick={() => {
          onCallBack();
          notification.close(key);
        }}
        size="small"
      >
        Call Back
      </Button>
    ),
    duration: 0,
    icon: <CloseOutlined style={{ color: '#ff4d4f' }} />,
    style: {
      width: 300,
    },
  });
};