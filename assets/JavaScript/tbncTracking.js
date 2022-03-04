const tbncTracking = (function () {
  /**
   * Author - The boring news company
   * Version - 0.1
   * The purpose of this script is to keep a track of all utm param through
   * which user have passed in last N number of days
   */
  "use strict";

  const cookieExpiryInDays = 30;
  const maxCookiePerUser = 20;
  const cookieName = "__tbnc__";
  const userKeysToRead = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  const primaryKeys = ["utm_source", "utm_medium", "utm_campaign"];

  const createCookie = function (name, value, expiryInDays) {
    let date, expires;

    date = new Date();
    date.setTime(date.getTime() + expiryInDays * 24 * 60 * 60 * 1000);

    expires = "expires=" + date.toGMTString();
    document.cookie =
      name + "=" + value + ";secure;" + expires + ";domain:.boringnews.co;";
  };

  const readCookie = function (name) {
    let allCookies, cookiesData;

    if (!name) {
      return "[]";
    }

    name = name + "=";
    cookiesData = decodeURIComponent(document.cookie);
    allCookies = cookiesData.split(";");

    // Iterate the cookie data to find your key related cookie data.
    for (let i = 0; i < allCookies.length; i++) {
      let selectedCookie = allCookies[i];
      while (selectedCookie.charAt(0) == " ") {
        selectedCookie = selectedCookie.substring(1);
      }
      if (selectedCookie.indexOf(name) == 0) {
        return selectedCookie.substring(name.length, selectedCookie.length);
      }
    }
    return "[]";
  };

  const getStringValue = function (value) {
    if (value) {
      return value.trim();
    }
    return null;
  };

  const buildUserInformation = function () {
    let userInfomation = {};
    let searchParameters;

    searchParameters = new URLSearchParams(location.search);

    for (let i = 0; i < userKeysToRead.length; i++) {
      let key = userKeysToRead[i];
      let value = searchParameters.get(key);
      if (getStringValue(key) && value) {
        userInfomation[key] = value;
      }
    }

    userInfomation["date"] = new Date().toISOString();

    return userInfomation;
  };

  const trackingInfomationAlreadyExists = function (existing, current) {
    for (let i = 0; i < existing.length; i++) {
      let { utm_source, utm_medium, utm_campaign } = existing[i];
      let numberOfParameterSame = 0;
      for (let j = 0; j < primaryKeys.length; j++) {
        if (current[primaryKeys[j]] === existing[i][primaryKeys[j]]) {
          numberOfParameterSame += 1;
        }
      }
      if (numberOfParameterSame === primaryKeys.length) {
        return true;
      }
    }
    return false;
  };

  const trackUser = function () {
    let trackingCookie, existingTrackingInformation, currentTrackingInfo;

    trackingCookie = readCookie(cookieName);

    // parse the cookie data. as we are saving the json data in cookie.
    existingTrackingInformation = JSON.parse(trackingCookie);

    // get the user information
    currentTrackingInfo = buildUserInformation();
    if (
      trackingInfomationAlreadyExists(
        existingTrackingInformation,
        currentTrackingInfo
      )
    ) {
      return;
    }

    // push this to current tracking info.
    if (Object.keys(currentTrackingInfo).length > 1) {
      //It will check the maximum limit of cookie exceeds or not if it exceeds it will delete the oldest one
      if (existingTrackingInformation.length === maxCookiePerUser) {
        existingTrackingInformation.shift();
      }
      existingTrackingInformation.push(currentTrackingInfo);
    } else {
      return;
    }

    // Create or overwrite the cookie again with this new one.
    createCookie(
      cookieName,
      JSON.stringify(existingTrackingInformation),
      cookieExpiryInDays
    );
  };

  return {
    UserTracking: trackUser,
  };
})();
tbncTracking.UserTracking();
