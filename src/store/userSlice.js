import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    accessToken: null,
    userData: {
        userId: null,
        email: '',
        firstname: '',
        lastname: '',
        address: '',
        phonenumber: '',
        resume: '',
    },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login(state, action) {
            const { accessToken, user } = action.payload;
            state.accessToken = accessToken;
            state.userData = {
                userId: user._id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                address: user.address,
                phonenumber: user.phonenumber,
                resume: user.resume,
            };
        },
        logout(state) {
            return initialState;
        },
        updateUser(state, action) {
            state.userData = { ...state.userData, ...action.payload };
        },
    },
});

export const { login, logout, updateUser } = userSlice.actions;

export default userSlice.reducer;
