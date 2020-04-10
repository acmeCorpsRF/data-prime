import update from 'react-addons-update';
import {
    LOADING_USERS,
    SETTING_POINTS_DISPLAYED,
    UPDATE_USERS_POINTS,
    SETTING_SIGNATURES_DISPLAYED,
    UPDATE_USERS_SIGNATURES
} from '../actions/sphereActions';

const initialStore = {
    numberPointsDisplayed: 0,
    numberSignaturesDisplayed: 0,
    rotation: true,
    users: {},
    entries: []
};

function getRandomUniqueNumber(min, max, counter) {
    let arrUniqueNumbers = [];
    let i = 0;
    let numbersNeeded = counter;
    let maxNumber = max;
    let minNumber = min;

    function findMatch(array, value) {
        for (let j = 0; j < array.length; j++) {
            if (array[j] == value) return 1;
        }
        return 0;
    }

    while (i < numbersNeeded) {
        let randomNumber = Math.floor((Math.random() * maxNumber) + minNumber);
        if (findMatch(arrUniqueNumbers, randomNumber) == 0) {
            arrUniqueNumbers[i] = randomNumber;
            i++;
        }
    }
    return arrUniqueNumbers;
}

export default function sphereReducer(store = initialStore, action) {
    switch (action.type) {
        case LOADING_USERS: {
            let counter = 0;
            const downloadableUsers = {};
            const initEntries = [];
            Object.entries(action.users).map(user => {
                user[1].showSignatures = false;
                if (user[1].isActive == true) {
                    user[1].showSignatures = true;
                    counter++;
                    initEntries.push({
                        label: user[1].name,
                        url: user[1].picture,
                        target: '_top'
                    });
                }
                downloadableUsers[Number(user[0])] = user[1];
            });
            return update(store, {
                users: {$set: downloadableUsers},
                numberPointsDisplayed: {$set: counter},
                numberSignaturesDisplayed: {$set: counter},
                entries: {$set: initEntries}
            });
        }
        case SETTING_POINTS_DISPLAYED: {
            const value = Number(action.target.previousElementSibling.children[0].value);
            return update(store, {
                numberPointsDisplayed: {$set: value}
            });
        }
        case UPDATE_USERS_POINTS: {
            const newUsers = {};
            Object.entries(store.users).map(user => {
                const newObj = {};
                Object.keys(user[1]).map(key => {
                    (key == 'isActive') ? newObj[key] = false : newObj[key] = user[1][key];
                });
                newUsers[user[0]] = newObj;
            });
            const randomNumbers = getRandomUniqueNumber(0, Object.keys(store.users).length, store.numberPointsDisplayed);
            const initEntries = [];
            randomNumbers.map(number => {
                Object.entries(newUsers).map(user => {
                    const newObj = {};
                    if (Number(user[0]) == number) {
                        Object.keys(user[1]).map(key => {
                            if (key == 'isActive') {
                                newObj[key] = true;
                                initEntries.push({
                                    label: user[1].name,
                                    url: user[1].picture,
                                    target: '_top'
                                });
                            } else {
                                newObj[key] = user[1][key];
                            }
                        });
                        newUsers[user[0]] = newObj;
                    }
                });
            });
            return update(store, {
                users: {$set: newUsers},
                entries: {$set: initEntries}
            });
        }
        case SETTING_SIGNATURES_DISPLAYED: {
            const value = Number(action.target.previousElementSibling.children[0].value);
            return update(store, {
                numberSignaturesDisplayed: {$set: value}
            });
        }
        case UPDATE_USERS_SIGNATURES: {
            const newUsers = {};
            Object.entries(store.users).map(user => {
                const newObj = {};
                Object.keys(user[1]).map(key => {
                    (key == 'showSignatures') ? newObj[key] = false : newObj[key] = user[1][key];
                });
                newUsers[user[0]] = newObj;
            });
            let arrUsersIsActive = [];
            Object.entries(newUsers).map(user => {
                if (user[1].isActive == true) {
                    arrUsersIsActive.push(Number(user[0]));
                }
            });
            const randomNumbers = getRandomUniqueNumber(0, arrUsersIsActive.length, store.numberSignaturesDisplayed);
            const newArrUsersIsActive = [];
            randomNumbers.map(number => {
                arrUsersIsActive.map((value, index) => {
                    if (number == index) newArrUsersIsActive.push(value);
                })
            });
            newArrUsersIsActive.map(number => {
                Object.entries(newUsers).map(user => {
                    const newObj = {};
                    if (Number(user[0]) == number && user[1].isActive == true) {
                        Object.keys(user[1]).map(key => {
                            (key == 'showSignatures') ? newObj[key] = true : newObj[key] = user[1][key];
                        });
                        newUsers[user[0]] = newObj;
                    }
                });
            });
            const initEntries = [];
            Object.entries(newUsers).map(user => {
                if (user[1].isActive == true) {
                    if (user[1].showSignatures == true) {
                        initEntries.push({
                            label: user[1].name,
                            url: user[1].picture,
                            target: '_top'
                        });
                    } else {
                        initEntries.push({
                            label: '',
                            url: user[1].picture,
                            target: '_top'
                        });
                    }
                }
            });
            return update(store, {
                users: {$set: newUsers},
                entries: {$set: initEntries}
            });
        }
        default:
            return store;
    }
}