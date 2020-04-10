export const LOADING_USERS = 'LOADING_USERS';
export const UPDATE_USERS_POINTS = 'UPDATE_USERS_POINTS';
export const SETTING_POINTS_DISPLAYED = 'SETTING_POINTS_DISPLAYED';
export const SETTING_SIGNATURES_DISPLAYED = 'SETTING_SIGNATURES_DISPLAYED';
export const UPDATE_USERS_SIGNATURES = 'UPDATE_USERS_SIGNATURES';

export const loadingUsers = (users) => ({
    type: LOADING_USERS,
    users
});

export const settingPointsDisplayed = (target) => ({
    type: SETTING_POINTS_DISPLAYED,
    target
});

export const updateUsersPoints = () => ({
    type: UPDATE_USERS_POINTS
});

export const settingSignaturesDisplayed = (target) => ({
    type: SETTING_SIGNATURES_DISPLAYED,
    target
});

export const updateUsersSignatures = () => ({
    type: UPDATE_USERS_SIGNATURES
});