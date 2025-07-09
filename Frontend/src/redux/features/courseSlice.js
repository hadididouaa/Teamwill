import { createSlice } from '@reduxjs/toolkit';
import courses from '../../data/inner-data/InnerCourseData';

const initialState = {
  courses: courses,
  course: null,
};

export const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    single_course: (state, action) => {
      state.course = state.courses.find((p) => p.id === action.payload) || null;
    },
  },
});

export const { single_course } = courseSlice.actions;

// Selectors
export const selectCourses = (state) => state?.courses?.courses;
export const selectCourse = (state) => state?.courses?.course;

export default courseSlice.reducer;
