/**
 * Author: Satyendra
 * Date: 17-May-2021
 * Purpose: This file will be common between the landing page and News application user subscribe function.
 */

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getAllCookiesStoredPreviously() {
  let previousCookies,
    cookieName = "__tbnc__";

  previousCookies = readCookie(cookieName);
  return previousCookies;
}

function getAllCookiesStoredPreviously() {
  let previousCookies,
    cookieName = "__tbnc__";

  let readCookie = function (name) {
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
  previousCookies = readCookie(cookieName);
  return previousCookies;
}

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function wrapUpPreviousCookieswithCurrentCookies() {
  // If any cookie found
  let cookies = JSON.parse(getAllCookiesStoredPreviously());
  let currentTrackingInfo = {};
  let userKeysToRead = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  for (let i = 0; i < userKeysToRead.length; i++) {
    let key = userKeysToRead[i];
    let value = getParameterByName(key);
    if (key.trim() && value) {
      currentTrackingInfo[key] = value;
    }
  }
  currentTrackingInfo["date"] = new Date().toISOString();

  if (Object.keys(currentTrackingInfo).length > 1) {
    cookies.push(currentTrackingInfo);
  }
  return JSON.stringify(cookies);
}

function subscribeUser(e) {
  e.preventDefault();
  // const baseURL = "https://localhost:44336";
  const baseURL = "https://internal.boringnews.co";
  let apiURL = `${baseURL}/api/Consumers/CreateWithAutoValidation`;

  let referredBy = getParameterByName("referral");
  let source = getParameterByName("utm_source");
  let medium = getParameterByName("utm_medium");
  let campaign = getParameterByName("utm_campaign");

  const email = $.trim($("#text-input").val());

  var data = $("form").serializeArray();
  var final_data = {
    EmailAddress: email,
  };

  // If not a valid email then send a varification email to the user and
  if (!validateEmail(final_data.EmailAddress)) {
    apiURL = `${baseURL}/api/Consumers/Create`;
  }

  // If referredBy is found add that also.
  if ($.trim(referredBy) !== "") {
    apiURL = `${baseURL}/api/Consumers/Create`;
    final_data["ReferredBy"] = referredBy;
  }
  // If any cookie found
  // include current cookie and previous cookie
  let cookies = wrapUpPreviousCookieswithCurrentCookies();
  if (cookies !== "[]") {
    // api call to send all data
    final_data["UtmHistory"] = cookies;
  }

  $("#requestLoad").removeClass("d-none");
  $("#requestLoad").addClass("d-flex");
  if (data[0].value !== "") {
    $("#invalid-message").removeClass("d-flex");
    $("#invalid-message").addClass("d-none");
    $("#error-message").removeClass("d-flex");
    $("#error-message").addClass("d-none");
    $.ajax({
      url: apiURL,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(final_data),

      statusCode: {
        200: function (res) {
          var { emailAddress, token } = res;
          var timestamp = Date.now().toString();

          if ($.trim(email) !== "" && $.trim(token) !== "") {
            // Encode the data before sending as params.
            emailAddress = encodeURIComponent(emailAddress);
            token = encodeURIComponent(token);
            timestamp = encodeURIComponent(timestamp);

            var queryParams = `emailTbnc=${emailAddress}&tokenTbnc=${token}&timestapm=${timestamp}`;
            window.open(
              `https://boringnews.co/other/index.html?${queryParams}`,
              "_blank"
            );
          } else if (res === "Resent Welcome" || res === "Already Verified") {
            window.open(
              "https://boringnews.co/other/index.html?message=resent",
              "_blank"
            );
          } else if (typeof res === "string" && $.trim(res) !== "") {
            $("#error-message")
              .text(res)
              .removeClass("d-none")
              .addClass("d-flex");
          } else {
            $("#error-message")
              .text("Some error occurred, please try again.")
              .removeClass("d-none")
              .addClass("d-flex");
          }
        },
        204: function (res) {
          $("#already-subs").removeClass("d-none");
          $("#already-subs").addClass("d-flex");
        },
      },

      error: function (res) {
        let errorMessage = "Some error occurred, please try again.";
        switch (res.status) {
          case 400:
            $("#error-message")
              .text(res.responseText)
              .removeClass("d-none")
              .addClass("d-flex");
            break;
          default:
            $("#error-message")
              .text(errorMessage)
              .removeClass("d-none")
              .addClass("d-flex");
            break;
        }
      },
    });
  } else {
    $("#invalid-message").removeClass("d-none");
    $("#invalid-message").addClass("d-flex");
  }
}

function subscriptionInitialization() {
  $("#email-submit").submit(function (evt) {
    subscribeUser(evt);
  });
}
