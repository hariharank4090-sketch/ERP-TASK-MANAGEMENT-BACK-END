"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSplChar = exports.clearSessionStorage = exports.getSessionFiltersByPageId = exports.getSessionDateFilter = exports.setSessionFilter = exports.getSessionFilters = exports.setSessionFilters = exports.getUniqueData = exports.calcAvg = exports.calcTotal = exports.groupData = exports.getRandomColor = exports.parseJSON = exports.stringCompare = exports.filterableText = exports.trimText = exports.Division = exports.Multiplication = exports.Subraction = exports.Addition = exports.indianCurrency = exports.RoundNumber = exports.limitFractionDigits = exports.NumberFormat = exports.isEqualObject = exports.toNumber = exports.isEqualNumber = exports.randomNumber = exports.isValidJSON = exports.isObject = exports.isNumber = exports.onlynumAndNegative = exports.onlynum = exports.rid = exports.toArray = exports.isArray = exports.isValidObject = exports.yyyymmdd = exports.hhmm = exports.ddmmyyyyhhmm = exports.ddmmyyyy = void 0;
exports.isValidDate = isValidDate;
const ddmmyyyy = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
exports.ddmmyyyy = ddmmyyyy;
const ddmmyyyyhhmm = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
exports.ddmmyyyyhhmm = ddmmyyyyhhmm;
const hhmm = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};
exports.hhmm = hhmm;
const yyyymmdd = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toISOString().split('T')[0];
};
exports.yyyymmdd = yyyymmdd;
function isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
const isValidObject = (obj) => {
    return (0, exports.isObject)(obj) && Object.keys(obj).length !== 0;
};
exports.isValidObject = isValidObject;
const isArray = (array) => Array.isArray(array);
exports.isArray = isArray;
const toArray = (array) => (0, exports.isArray)(array) ? array : [];
exports.toArray = toArray;
const rid = () => {
    return (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `r${Math.random().toString(36).slice(2)}${Date.now()}`;
};
exports.rid = rid;
const onlynum = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    if ((value.match(/\./g) || []).length > 1) {
        value = value.slice(0, -1);
    }
    e.target.value = value;
};
exports.onlynum = onlynum;
const onlynumAndNegative = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.-]/g, '');
    const minusCount = (value.match(/-/g) || []).length;
    if (minusCount > 1) {
        value = value.replace(/-/g, '');
        value = '-' + value;
    }
    if (value.includes('-') && !value.startsWith('-')) {
        value = value.replace(/-/g, '');
        value = '-' + value;
    }
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts.shift() + '.' + parts.join('');
    }
    e.target.value = value;
};
exports.onlynumAndNegative = onlynumAndNegative;
const isNumber = (value) => {
    if (value === null || value === undefined)
        return false;
    if (value === '')
        return false;
    return !isNaN(Number(value));
};
exports.isNumber = isNumber;
const isObject = (val) => {
    return Object.prototype.toString.call(val) === '[object Object]';
};
exports.isObject = isObject;
const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.isValidJSON = isValidJSON;
const randomNumber = (range = 10000000) => Math.floor(Math.random() * range) + 1;
exports.randomNumber = randomNumber;
const isEqualNumber = (a, b) => {
    return Number(a) === Number(b);
};
exports.isEqualNumber = isEqualNumber;
const toNumber = (value) => {
    if (!value)
        return 0;
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/,/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    }
    return typeof value === 'number' ? value : 0;
};
exports.toNumber = toNumber;
const isEqualObject = (obj1, obj2) => {
    if (obj1 === obj2) {
        return true;
    }
    if (!obj1 || typeof obj1 !== 'object' ||
        !obj2 || typeof obj2 !== 'object') {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (!keys2.includes(key) || !(0, exports.isEqualObject)(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
};
exports.isEqualObject = isEqualObject;
const NumberFormat = (num) => {
    return (0, exports.toNumber)(num).toLocaleString('en-IN', { maximumFractionDigits: 2 });
};
exports.NumberFormat = NumberFormat;
const limitFractionDigits = (num = 0, maxFractionDigits = 2) => {
    const factor = Math.pow(10, maxFractionDigits);
    return Math.round(num * factor) / factor;
};
exports.limitFractionDigits = limitFractionDigits;
const RoundNumber = (num) => {
    return (0, exports.isNumber)(num) ? (0, exports.limitFractionDigits)(num, 2) : 0;
};
exports.RoundNumber = RoundNumber;
const indianCurrency = (number) => {
    let num = (0, exports.toNumber)(number);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(num);
};
exports.indianCurrency = indianCurrency;
const Addition = (a, b) => (0, exports.toNumber)(a) + (0, exports.toNumber)(b);
exports.Addition = Addition;
const Subraction = (a, b) => (0, exports.toNumber)(a) - (0, exports.toNumber)(b);
exports.Subraction = Subraction;
const Multiplication = (a, b) => (0, exports.toNumber)(a) * (0, exports.toNumber)(b);
exports.Multiplication = Multiplication;
const Division = (a, b) => b != 0 ? (0, exports.toNumber)(a) / ((0, exports.toNumber)(b) || 1) : 0;
exports.Division = Division;
const trimText = (text = '', replaceWith = '_') => String(text).trim().replace(/\s+/g, replaceWith ?? '_');
exports.trimText = trimText;
const filterableText = (text) => {
    try {
        const txt = (0, exports.trimText)(String(text), ' ').toLowerCase();
        return txt;
    }
    catch (e) {
        console.log('Error while convert to filterable text:', e);
        return '';
    }
};
exports.filterableText = filterableText;
const stringCompare = (str1, str2) => (0, exports.filterableText)(str1) === (0, exports.filterableText)(str2);
exports.stringCompare = stringCompare;
const parseJSON = (str) => {
    try {
        const value = JSON.parse(str);
        return { isJSON: true, data: value };
    }
    catch (e) {
        return { isJSON: false, };
    }
};
exports.parseJSON = parseJSON;
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
exports.getRandomColor = getRandomColor;
// export const getPermutations = (arr: any[]): any[][] => {
//     if (arr.length === 1) {
//         return [arr];
//     }
//     let permutations = [];
//     for (let i = 0; i < arr.length; i++) {
//         let currentElement = arr[i];
//         let remainingElements = arr.slice(0, i).concat(arr.slice(i + 1));
//         let remainingPermutations = getPermutations(remainingElements);
//         for (let perm of remainingPermutations) {
//             permutations.push([currentElement, ...perm]);
//         }
//     }
//     return permutations;
// }
const groupData = (arr, key) => {
    if ((0, exports.isArray)(arr) && key) {
        return arr.reduce((acc, item) => {
            const groupKey = item[key];
            if (groupKey === undefined || groupKey === null) {
                return acc;
            }
            const groupIndex = acc.findIndex((group) => group[key] === groupKey);
            if (groupIndex === -1) {
                acc.push({
                    [key]: groupKey,
                    groupedData: [{ ...item }]
                });
            }
            else {
                acc[groupIndex].groupedData.push(item);
            }
            return acc;
        }, []);
    }
    else {
        return [];
    }
};
exports.groupData = groupData;
const calcTotal = (arr, column) => arr.reduce((total, item) => (0, exports.Addition)(total, item[column]), 0);
exports.calcTotal = calcTotal;
const calcAvg = (arr, column) => {
    const total = arr.reduce((total, item) => (0, exports.Addition)(total, item[column]), 0);
    const count = arr.length;
    return count > 0 ? total / count : 0;
};
exports.calcAvg = calcAvg;
const getUniqueData = (arr = [], key = '', returnObjectKeys = []) => {
    const uniqueArray = [];
    const uniqueSet = new Set();
    arr.forEach(o => {
        if (!uniqueSet.has(o[key])) {
            const uniqueObject = { [key]: o[key] };
            returnObjectKeys.forEach(returnKey => {
                uniqueObject[returnKey] = o[returnKey];
            });
            uniqueArray.push(uniqueObject);
            uniqueSet.add(o[key]);
        }
    });
    return uniqueArray.sort((a, b) => String(a[key]).localeCompare(b[key]));
};
exports.getUniqueData = getUniqueData;
const setSessionFilters = (obj = {}) => {
    if (!(0, exports.isObject)(obj))
        return;
    const newSessionValue = JSON.stringify(obj);
    sessionStorage.setItem('filterValues', newSessionValue);
};
exports.setSessionFilters = setSessionFilters;
const getSessionFilters = (reqKey = '') => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const parsedValue = (0, exports.parseJSON)(sessionValue).data;
    const isValidObject = (0, exports.isObject)(parsedValue);
    if (isValidObject && Object.hasOwn(parsedValue, reqKey)) {
        return parsedValue.reqKey;
    }
    else if (isValidObject) {
        return parsedValue;
    }
    else {
        return {};
    }
};
exports.getSessionFilters = getSessionFilters;
const setSessionFilter = (key = '', value) => {
    if (key) {
        const sessinonValue = (0, exports.getSessionFilters)();
        sessionStorage.setItem('filterValues', JSON.stringify({ ...sessinonValue, [key]: value }));
        return;
    }
};
exports.setSessionFilter = setSessionFilter;
const getSessionDateFilter = (pageid) => {
    const sessionFilter = (0, exports.getSessionFilters)();
    const { Fromdate, Todate, pageID } = sessionFilter;
    const sessionDate = {
        Fromdate: (Fromdate && isValidDate(Fromdate)) ? Fromdate : (0, exports.yyyymmdd)(),
        Todate: (Todate && isValidDate(Todate)) ? Todate : (0, exports.yyyymmdd)(),
    };
    return ((0, exports.isNumber)(pageid) && (0, exports.isEqualNumber)(pageid, pageID)) ? sessionDate : {
        Fromdate: (0, exports.yyyymmdd)(),
        Todate: (0, exports.yyyymmdd)()
    };
};
exports.getSessionDateFilter = getSessionDateFilter;
const getSessionFiltersByPageId = (pageID) => {
    const Fromdate = (0, exports.yyyymmdd)(), Todate = (0, exports.yyyymmdd)(), defaultValue = {
        Fromdate, Todate, pageID
    };
    if (!(0, exports.isNumber)(pageID)) {
        return defaultValue;
    }
    ;
    const sessionValue = sessionStorage.getItem('filterValues');
    const parsedValue = (0, exports.isValidJSON)(sessionValue) ? JSON.parse(sessionValue) : {};
    const isValidObj = (0, exports.isValidObject)(parsedValue);
    if (!isValidObj) {
        return defaultValue;
    }
    ;
    const isEqualPage = (0, exports.isEqualNumber)(parsedValue?.pageID, pageID);
    if (isEqualPage) {
        const getDefaultDateValue = (0, exports.getSessionDateFilter)(pageID);
        return {
            ...parsedValue, ...getDefaultDateValue
        };
    }
    else {
        return defaultValue;
    }
    ;
};
exports.getSessionFiltersByPageId = getSessionFiltersByPageId;
const clearSessionStorage = () => sessionStorage.removeItem('filterValues');
exports.clearSessionStorage = clearSessionStorage;
const removeSplChar = (str) => String(str).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
exports.removeSplChar = removeSplChar;
// export const reactSelectFilterLogic = (option, inputValue) => {
//     const normalizedLabel = removeSplChar(option.label);
//     const normalizedInput = removeSplChar(inputValue);
//     return normalizedLabel.includes(normalizedInput);
// };
