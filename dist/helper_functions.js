"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToWords = exports.validValue = exports.stringCompare = exports.filterableText = exports.trimText = exports.Division = exports.Multiplication = exports.Subraction = exports.Addition = exports.RoundNumber = exports.toNumber = exports.limitFractionDigits = exports.createPadString = exports.NumberFormat = exports.isLesserOrEqual = exports.isLesserNumber = exports.isGraterOrEqual = exports.isGraterNumber = exports.isEqualObject = exports.isEqualNumber = exports.onlynum = exports.convertUTCToLocal = exports.formatDateForDatetimeLocal = exports.timeDifferenceHHMM = exports.customTimeDifference = exports.timeDuration = exports.ISOString = exports.firstDayOfMonth = exports.getPreviousDate = exports.convertToTimeObject = exports.timeToDate = exports.UTCTime = exports.getCurrentTime = exports.formatTime24 = exports.extractHHMM = exports.TimeDisplay = exports.getMonth = exports.UTCDateWithTime = exports.LocalTime = exports.LocalDateWithTime = exports.LocalDateTime = exports.addFiveThirty = exports.getIndianTime = exports.getDaysBetween = exports.LocalDate = exports.isValidDate = exports.isArray = exports.toArray = exports.decryptPasswordFun = exports.encryptPasswordFun = void 0;
exports.randomNumber = exports.groupData = exports.randomString = exports.getPermutations = exports.getRandomColor = exports.numbersRange = exports.isValidObject = exports.isObject = exports.isNumber = exports.parseJSON = exports.isValidJSON = exports.isNegativeNumber = exports.isPositiveNumber = exports.isValidNumber = exports.checkIsNumber = exports.createAbbreviation = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Encryption functions
const encryptPasswordFun = (str) => {
    if (!str)
        throw new Error('No string provided for encryption');
    if (!process.env.passwordKey)
        throw new Error('No encryption key provided');
    return crypto_js_1.default.AES.encrypt(str, process.env.passwordKey).toString();
};
exports.encryptPasswordFun = encryptPasswordFun;
const decryptPasswordFun = (cipherText) => {
    if (!cipherText)
        throw new Error('No cipher text provided for decryption');
    if (!process.env.passwordKey)
        throw new Error('No decryption key provided');
    const bytes = crypto_js_1.default.AES.decrypt(cipherText, process.env.passwordKey);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
};
exports.decryptPasswordFun = decryptPasswordFun;
// Array helper functions
const toArray = (array) => Array.isArray(array) ? array : [];
exports.toArray = toArray;
const isArray = (array) => Array.isArray(array);
exports.isArray = isArray;
// Date helper functions
const isValidDate = (dateString) => {
    const timestamp = Date.parse(dateString);
    return !isNaN(timestamp);
};
exports.isValidDate = isValidDate;
const LocalDate = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
exports.LocalDate = LocalDate;
const getDaysBetween = (invoiceDateStr, currentDateStr = new Date().toISOString()) => {
    const invoiceDate = new Date(invoiceDateStr);
    const currentDate = new Date(currentDateStr);
    // Get UTC midnight for both dates to avoid timezone discrepancies
    invoiceDate.setUTCHours(0, 0, 0, 0);
    currentDate.setUTCHours(0, 0, 0, 0);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInMs = currentDate.getTime() - invoiceDate.getTime();
    const diffInDays = Math.floor(diffInMs / msPerDay);
    return diffInDays;
};
exports.getDaysBetween = getDaysBetween;
const getIndianTime = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    const options = {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
        hour12: false
    };
    const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);
    const get = (type) => parts.find(p => p.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}.${get("fractionalSecond")}`;
};
exports.getIndianTime = getIndianTime;
const addFiveThirty = (dateStr) => {
    const iso = dateStr.replace(" ", "T");
    const baseDate = new Date(iso);
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(baseDate.getTime() + IST_OFFSET_MS);
    const pad = (n, size = 2) => String(n).padStart(size, "0");
    return `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(istDate.getDate())} ${pad(istDate.getHours())}:${pad(istDate.getMinutes())}:${pad(istDate.getSeconds())}.${pad(istDate.getMilliseconds(), 3)}`;
};
exports.addFiveThirty = addFiveThirty;
const LocalDateTime = () => {
    const now = new Date();
    const utcTime = now.getTime();
    const istOffsetInMilliseconds = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(utcTime + istOffsetInMilliseconds);
    return istTime.toISOString();
};
exports.LocalDateTime = LocalDateTime;
const LocalDateWithTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.LocalDateWithTime = LocalDateWithTime;
const LocalTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.LocalTime = LocalTime;
const UTCDateWithTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleString('en-US', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};
exports.UTCDateWithTime = UTCDateWithTime;
const getMonth = (date) => {
    const dateObj = date ? date : new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};
exports.getMonth = getMonth;
const TimeDisplay = (dateObj) => {
    const reqTime = new Date(dateObj);
    let hours = reqTime.getHours();
    const minutes = reqTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutesStr + ' ' + ampm;
};
exports.TimeDisplay = TimeDisplay;
const extractHHMM = (dateObj) => {
    const reqTime = new Date(dateObj);
    const hours = reqTime.getUTCHours();
    const minutes = reqTime.getUTCMinutes();
    const hourStr = hours < 10 ? '0' + hours : hours;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return hourStr + ':' + minutesStr;
};
exports.extractHHMM = extractHHMM;
const formatTime24 = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    let hours12 = hours % 12;
    hours12 = hours12 || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${period}`;
};
exports.formatTime24 = formatTime24;
const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};
exports.getCurrentTime = getCurrentTime;
const UTCTime = (isoString) => {
    const date = new Date(isoString);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutesStr + ' ' + ampm;
};
exports.UTCTime = UTCTime;
const timeToDate = (time) => {
    if (!time) {
        console.error("No time input provided.");
        return new Date(Date.UTC(1970, 0, 1, 12, 0, 0));
    }
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
};
exports.timeToDate = timeToDate;
const convertToTimeObject = (timeString) => {
    const [hours = 0, minutes = 0, seconds = 0] = timeString
        ? timeString.split(':').map(Number)
        : [0, 0, 0];
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    date.setMilliseconds(0);
    return (0, exports.LocalTime)(date);
};
exports.convertToTimeObject = convertToTimeObject;
const getPreviousDate = (days) => {
    const num = days ? Number(days) : 1;
    return new Date(new Date().setDate(new Date().getDate() - num)).toISOString().split('T')[0];
};
exports.getPreviousDate = getPreviousDate;
const firstDayOfMonth = () => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split('T')[0];
};
exports.firstDayOfMonth = firstDayOfMonth;
const ISOString = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toISOString().split('T')[0];
};
exports.ISOString = ISOString;
const timeDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
exports.timeDuration = timeDuration;
const customTimeDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const start = new Date(1970, 0, 1, startHours, startMinutes);
    const end = new Date(1970, 0, 1, endHours, endMinutes);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}`;
};
exports.customTimeDifference = customTimeDifference;
const timeDifferenceHHMM = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}`;
};
exports.timeDifferenceHHMM = timeDifferenceHHMM;
const formatDateForDatetimeLocal = (date) => {
    try {
        const pad = (num) => num?.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    catch (e) {
        console.log('Error in formatDateForDatetimeLocal function: ', e);
        return (0, exports.formatDateForDatetimeLocal)(new Date());
    }
};
exports.formatDateForDatetimeLocal = formatDateForDatetimeLocal;
const convertUTCToLocal = (utcDateString) => {
    const utcDate = new Date(utcDateString + "Z"); // Append 'Z' to indicate UTC time
    return utcDate.toLocaleString();
};
exports.convertUTCToLocal = convertUTCToLocal;
// Event handler function - Generic version that works without React
const onlynum = (e) => {
    const value = e.target.value;
    const newValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    e.target.value = newValue;
};
exports.onlynum = onlynum;
// Number comparison functions
const isEqualNumber = (a, b) => {
    return Number(a) === Number(b);
};
exports.isEqualNumber = isEqualNumber;
const isEqualObject = (obj1, obj2) => {
    if (obj1 === obj2) {
        return true;
    }
    if (obj1 == null || typeof obj1 !== 'object' ||
        obj2 == null || typeof obj2 !== 'object') {
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
const isGraterNumber = (a, b) => {
    return Number(a) > Number(b);
};
exports.isGraterNumber = isGraterNumber;
const isGraterOrEqual = (a, b) => {
    return Number(a) >= Number(b);
};
exports.isGraterOrEqual = isGraterOrEqual;
const isLesserNumber = (a, b) => {
    return Number(a) < Number(b);
};
exports.isLesserNumber = isLesserNumber;
const isLesserOrEqual = (a, b) => {
    return Number(a) <= Number(b);
};
exports.isLesserOrEqual = isLesserOrEqual;
// Number formatting functions
const NumberFormat = (num) => {
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 2 });
};
exports.NumberFormat = NumberFormat;
const createPadString = (number, padLength = 0) => {
    const numberStr = number.toString();
    return numberStr.padStart(padLength, '0');
};
exports.createPadString = createPadString;
const limitFractionDigits = (num = 0, maxFractionDigits = 2) => {
    const factor = Math.pow(10, maxFractionDigits);
    return Math.round(Number(num) * factor) / factor;
};
exports.limitFractionDigits = limitFractionDigits;
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
const RoundNumber = (num) => {
    return (0, exports.checkIsNumber)(num) ? Number(num).toFixed(2) : 0;
};
exports.RoundNumber = RoundNumber;
// Arithmetic functions
const Addition = (a, b) => (0, exports.limitFractionDigits)(Number(a) + Number(b));
exports.Addition = Addition;
const Subraction = (a, b) => (0, exports.limitFractionDigits)(Number(a) - Number(b));
exports.Subraction = Subraction;
const Multiplication = (a, b) => (0, exports.limitFractionDigits)(Number(a || 0) * Number(b || 0));
exports.Multiplication = Multiplication;
const Division = (a, b) => (0, exports.limitFractionDigits)(b != 0 ? Number(a || 0) / Number(b || 1) : 0);
exports.Division = Division;
// String manipulation functions
const trimText = (text = '', replaceWith = '_') => String(text).trim().replace(/\s+/g, replaceWith ?? '_');
exports.trimText = trimText;
const filterableText = (text) => {
    try {
        return String((0, exports.trimText)(text, ' ')).toLowerCase();
    }
    catch (e) {
        console.log('Error while convert to filterable text:', e);
        return '';
    }
};
exports.filterableText = filterableText;
const stringCompare = (str1, str2) => (0, exports.filterableText)(str1) === (0, exports.filterableText)(str2);
exports.stringCompare = stringCompare;
const validValue = (val) => {
    return Boolean(val) ? val : '';
};
exports.validValue = validValue;
const numberToWords = (prop) => {
    const number = Number(prop);
    const singleDigits = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', ' Thousand', ' Lakhs'];
    if (number < 10) {
        return singleDigits[number];
    }
    else if (number < 20) {
        return teens[number - 10];
    }
    else if (number < 100) {
        const tenDigit = Math.floor(number / 10);
        const singleDigit = number % 10;
        return tens[tenDigit] + (singleDigit !== 0 ? ' ' + singleDigits[singleDigit] : '');
    }
    else if (number < 1000) {
        const hundredDigit = Math.floor(number / 100);
        const remainingDigits = number % 100;
        return singleDigits[hundredDigit] + ' Hundred' + (remainingDigits !== 0 ? ' and ' + (0, exports.numberToWords)(remainingDigits) : '');
    }
    else if (number < 100000) {
        const thousandDigit = Math.floor(number / 1000);
        const remainingDigits = number % 1000;
        return (0, exports.numberToWords)(thousandDigit) + thousands[1] + (remainingDigits !== 0 ? ', ' + (0, exports.numberToWords)(remainingDigits) : '');
    }
    else if (number < 10000000) {
        const lakhDigit = Math.floor(number / 100000);
        const remainingDigits = number % 100000;
        return (0, exports.numberToWords)(lakhDigit) + thousands[2] + (remainingDigits !== 0 ? ', ' + (0, exports.numberToWords)(remainingDigits) : '');
    }
    else {
        return 'Number is too large';
    }
};
exports.numberToWords = numberToWords;
const createAbbreviation = (sentence) => {
    return sentence
        .split(' ')
        .map(word => word[0])
        .filter(char => /[a-zA-Z]/.test(char))
        .join('')
        .toUpperCase();
};
exports.createAbbreviation = createAbbreviation;
// Validation functions
const checkIsNumber = (num) => {
    return (num !== '' && num !== null && num !== undefined) ? !isNaN(num) : false;
};
exports.checkIsNumber = checkIsNumber;
const isValidNumber = (num) => {
    return (0, exports.checkIsNumber)(num) && Number(num) !== 0;
};
exports.isValidNumber = isValidNumber;
const isPositiveNumber = (num) => {
    return (0, exports.checkIsNumber)(num) && Number(num) > 0;
};
exports.isPositiveNumber = isPositiveNumber;
const isNegativeNumber = (num) => {
    return (0, exports.checkIsNumber)(num) && Number(num) < 0;
};
exports.isNegativeNumber = isNegativeNumber;
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
const parseJSON = (str) => {
    try {
        const value = JSON.parse(str);
        return { isJSON: true, data: value };
    }
    catch (e) {
        return { isJSON: false };
    }
};
exports.parseJSON = parseJSON;
const isNumber = (value) => !isNaN(parseInt(value, 10)) && isFinite(value);
exports.isNumber = isNumber;
const isObject = (val) => {
    return Object.prototype.toString.call(val) === '[object Object]';
};
exports.isObject = isObject;
const isValidObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length !== 0;
};
exports.isValidObject = isValidObject;
// Constants
exports.numbersRange = [
    { min: 0, max: 500 },
    { min: 500, max: 2000 },
    { min: 2000, max: 5000 },
    { min: 5000, max: 10000 },
    { min: 10000, max: 15000 },
    { min: 15000, max: 20000 },
    { min: 20000, max: 30000 },
    { min: 30000, max: 40000 },
    { min: 40000, max: 50000 },
    { min: 50000, max: 75000 },
    { min: 75000, max: 100000 },
    { min: 100000, max: 150000 },
    { min: 150000, max: 200000 },
    { min: 200000, max: 300000 },
    { min: 300000, max: 400000 },
    { min: 400000, max: 500000 },
    { min: 500000, max: 1000000 },
    { min: 1000000, max: 1500000 },
    { min: 1500000, max: 2000000 },
    { min: 2000000, max: 1e15 },
];
// Utility functions
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
exports.getRandomColor = getRandomColor;
const getPermutations = (arr) => {
    if (arr.length === 1) {
        return [arr];
    }
    let permutations = [];
    for (let i = 0; i < arr.length; i++) {
        let currentElement = arr[i];
        let remainingElements = arr.slice(0, i).concat(arr.slice(i + 1));
        let remainingPermutations = (0, exports.getPermutations)(remainingElements);
        for (let perm of remainingPermutations) {
            permutations.push([currentElement, ...perm]);
        }
    }
    return permutations;
};
exports.getPermutations = getPermutations;
const randomString = (length = 15) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let result = '';
    if (length <= 0) {
        return '';
    }
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
};
exports.randomString = randomString;
// Fixed groupData function - corrected indexing issue
const groupData = (arr, key) => {
    if (Array.isArray(arr) && key) {
        return arr.reduce((acc, item) => {
            const groupKey = item[key];
            if (groupKey === undefined || groupKey === null) {
                return acc;
            }
            // Fix: Use type assertion for string key
            const groupIndex = acc.findIndex(group => group[String(key)] === groupKey);
            if (groupIndex === -1) {
                // Fix: Create object with proper key
                const newGroup = {
                    [String(key)]: groupKey,
                    groupedData: [{ ...item }]
                };
                acc.push(newGroup);
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
const randomNumber = (minDigits = 5, maxDigits = 8) => {
    const digits = Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randomNumber = randomNumber;
