"use strict";
let BASE_URL = "https://internal.boringnews.co/api/ReferralData/";

function clickReferralDataButton() {
  let referralCode = document.getElementById("referralCode").value;
  let email = document.getElementById("email").value;

  if (referralCode.length === 0 || email.length === 0) {
    return;
  }

  getReferralData(referralCode, email);
}

async function getReferralData(referralCode, email) {
  let consumers = [],
    response,
    verifiedContent = "",
    nonVerifiedContent = "",
    listItem = "",
    firstPartPresent;

  try {
    response = await fetch(BASE_URL + email + "/" + referralCode);
  } catch (err) {
    alert("Internet Connection Broken");
  }

  if (response && response.status == 200) {
    consumers = await response.json();
  } else if (response) {
    alert("Invalid Credentials");
  }

  for (let i = 0; i < consumers.length; i++) {
    listItem = '<li class="list-group-item ">';
    firstPartPresent = 0;

    if (consumers[i].firstName !== null && consumers[i].firstName.length > 0) {
      listItem += consumers[i].firstName + " ";
      firstPartPresent = 1;
    }
    if (consumers[i].lastName !== null && consumers[i].lastName.length > 0) {
      listItem += consumers[i].lastName;
      firstPartPresent = 1;
    }
    if (firstPartPresent === 1) {
      listItem += "<br />";
    }
    listItem += consumers[i].emailAddress + "</li>";
    if (consumers[i].isVerified) {
      verifiedContent += listItem;
    } else {
      nonVerifiedContent += listItem;
    }
  }

  document.getElementById("verified").innerHTML = verifiedContent;
  document.getElementById("nonVerified").innerHTML = nonVerifiedContent;
}

(function () {
  let params, splitedParams, referralCode, email, url;

  params = location.search;

  url = location.href;

  splitedParams = params.split("&");

  if (splitedParams.length >= 2) {
    referralCode = /referralCode=([^&]+)/.exec(url)[1];

    email = /email=([^&]+)/.exec(url)[1];

    document.getElementById("referralCode").value = referralCode;

    document.getElementById("email").value = email;

    getReferralData(referralCode, email);
  }
})();
