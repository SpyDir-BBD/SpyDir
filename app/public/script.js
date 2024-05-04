import { constructFileSystem } from "./src/classes/folderClass.js";
import { findZipHeader, findCentralDirectoryOffset, printCentralDirectory } from "./src/utils/zipRead.js";
import { AuthManager } from "./src/utils/GithubAuth.js";

document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("button").addEventListener("click", uploadFile);
});

document.getElementById("burgerButton").addEventListener("click",openNav);
document.getElementById("closeBurger").addEventListener("click",closeNav);
document.getElementById("uploadIcon").addEventListener("click", addFile)
document.getElementById("browseLink").addEventListener("click",addFile);

function addFile(){
  var fileInputField = document.getElementById("fileInput");
  fileInputField.click();
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // Get the first file from the input
    
    if (!file)
    {
      console.log("No file selected");
      return;
    }

    if (!file.name.split('.')[1] == '.zip')
    {
      console.log("Not a Zip file");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      const byteData = new Uint8Array(event.target.result);

      const eocdIndex = findZipHeader(byteData);

      const centralDirectoryOffset = findCentralDirectoryOffset(byteData, eocdIndex);

      const list = printCentralDirectory(byteData, centralDirectoryOffset);

      const root = constructFileSystem(list);
      console.log(root);
    };

    reader.readAsArrayBuffer(file);
  };

function openNav() {
  document.getElementById("navBar").style.width = "15rem";
};

function closeNav() {
  document.getElementById("navBar").style.width = "0";
};
function launchAuth() {
  const clientID = 'Ov23liaDwohBlKUDcyxf';

  const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user,repo,pull_requests:write,pull_requests:read`;

  window.open(url);
}
var a = document.getElementById('userName'); 
a.addEventListener('click', launchAuth, false);

// Define the handleJSONPResponse function globally
window.handleJSONPResponse = function(data) {
  console.log('Response data:', data);
  
  // Process the response data as needed
  // For example, you can extract the access token from the data object
  const accessToken = data.access_token;

  // Call methods or perform actions based on the response data
  // For example, you might want to set the access token and fetch user information
  if (accessToken) {
      // Set the access token in the AuthManager instance
      AuthManager.instance.access_token = accessToken;
      
      // Fetch user information or perform other actions
      AuthManager.instance.setUserInfo();
  } else {
      console.error('Access token not found in the response data');
  }
};


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('code'))
{
  const _ = new AuthManager(urlParams.get('code'));
}