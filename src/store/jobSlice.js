import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchJobs = createAsyncThunk(
    'jobs/fetchJobs',
    async (accessToken, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/jobs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data);
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const jobSlice = createSlice({
    name: 'jobs',
    initialState: {
        jobs: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        setJob(state, action) {
            state.jobs.push(action.payload);
        },
        updateJob(state, action) {
            const index = state.jobs.findIndex(job => job._id === action.payload._id);
            if (index !== -1) {
                state.jobs[index] = { ...state.jobs[index], ...action.payload };
            }
        },
        removeJob(state, action) {
            state.jobs = state.jobs.filter(job => job._id !== action.payload);
        },
    
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.jobs = action.payload;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});


export const { setJob, updateJob, removeJob } = jobSlice.actions;

export default jobSlice.reducer;
