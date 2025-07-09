import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

import './AddRewards.css';

// Yup validation schema
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  type: yup.string().oneOf(['medal', 'badge', 'trophy']).required('Type is required'),
  pointsRequired: yup
    .number()
    .typeError('Points Required must be a number')
    .min(0, 'Points Required must be at least 0')
    .required('Points Required is required'),
  minScore: yup
    .number()
    .typeError('Minimum Score must be a number')
    .min(0, 'Minimum Score must be at least 0')
    .max(100, 'Minimum Score can be at most 100')
    .required('Minimum Score is required'),
  minTentative: yup
    .number()
    .typeError('Minimum Attempts must be a number')
    .min(0, 'Minimum Attempts must be at least 0')
    .required('Minimum Attempts is required'),
  difficultyLevel: yup
    .string()
    .oneOf(['easy', 'medium', 'hard'])
    .required('Difficulty Level is required'),
  iconFile: yup
    .mixed()
    .test('fileSize', 'File size too large', (value) => {
      if (!value.length) return true; // attachment optional
      return value[0].size <= 2000000; // 2MB limit example
    })
    .test('fileType', 'Unsupported File Format', (value) => {
      if (!value.length) return true;
      return ['image/jpeg', 'image/png', 'image/gif'].includes(value[0].type);
    }),
});

const AddRewards = () => {
  const [showModal, setShowModal] = useState(false);

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('pointsRequired', data.pointsRequired);
      formData.append('minScore', data.minScore);
      formData.append('minTentative', data.minTentative);
      formData.append('difficultyLevel', data.difficultyLevel);
      if (data.iconFile && data.iconFile.length > 0) {
        formData.append('icon', data.iconFile[0]); // 'icon' matches multer field name
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/reward/addRewards`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast.success('Reward added successfully!');
      setShowModal(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add reward: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <>
      {/* Card */}
      <div className="add-rewards-card" onClick={() => setShowModal(true)}>
        <div className="add-rewards-plus">+</div>
        <p className="add-rewards-text">Add rewards</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="add-rewards-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="add-rewards-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Reward</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <label>
                Name:
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Gold Medal"
                  autoFocus
                />
                <p className="error-msg">{errors.name?.message}</p>
              </label>

              <label>
                Type:
                <select {...register('type')}>
                  <option value="">Select type</option>
                  <option value="medal">Medal</option>
                  <option value="badge">Badge</option>
                  <option value="trophy">Trophy</option>
                </select>
                <p className="error-msg">{errors.type?.message}</p>
              </label>

              <label>
                Points Required:
                <input
                  type="number"
                  {...register('pointsRequired')}
                  placeholder="100"
                  min="0"
                />
                <p className="error-msg">{errors.pointsRequired?.message}</p>
              </label>

              <label>
                Minimum Score:
                <input
                  type="number"
                  {...register('minScore')}
                  placeholder="80"
                  min="0"
                  max="100"
                />
                <p className="error-msg">{errors.minScore?.message}</p>
              </label>

              <label>
                Minimum Attempts:
                <input
                  type="number"
                  {...register('minTentative')}
                  placeholder="1"
                  min="0"
                />
                <p className="error-msg">{errors.minTentative?.message}</p>
              </label>

              <label>
                Difficulty Level:
                <select {...register('difficultyLevel')}>
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <p className="error-msg">{errors.difficultyLevel?.message}</p>
              </label>

              <label>
                Icon File:
                <input
                  type="file"
                  {...register('iconFile')}
                  accept="image/*"
                />
                <p className="error-msg">{errors.iconFile?.message}</p>
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowModal(false);
                }}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddRewards;
