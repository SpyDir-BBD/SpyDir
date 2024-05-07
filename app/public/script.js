import { constructFileSystem } from "./src/classes/folderClass.js";
import { findZipHeader, findCentralDirectoryOffset, printCentralDirectory } from "./src/utils/zipRead.js";
import { AuthManager } from "./src/utils/GithubAuth.js";
import { LANGUAGE_EXTENSIONS } from "./src/enums/languageExtensions.js";

document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("button").addEventListener("click", uploadFile);
});

document.getElementById("burgerButton").addEventListener("click",openNav);
document.getElementById("closeBurger").addEventListener("click",closeNav);
document.getElementById("uploadIcon").addEventListener("click", addFile);
document.getElementById("browseLink").addEventListener("click",addFile);
document.getElementById("historyLink").addEventListener("click",handleHistory);
document.getElementById("homeLink").addEventListener("click",handleHome);

let dropArea = document.getElementById("drop-area");
  dropArea.addEventListener("dragenter", handleDrop, false);
  dropArea.addEventListener("dragleave", handleDrop, false);
  dropArea.addEventListener("dragover", handleDrop, false);
  dropArea.addEventListener("drop", handleDrop, false);


  let historyContainer = document.getElementById("historyContainer");
  let pieChartContainer = document.getElementById("pieChartContainer");
  let uploadContainer = document.getElementById("uploadContainer");
  let fileListContainer = document.getElementById("fileListContainer");

  hideAll();
  showContainer(uploadContainer);



  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  })
  
  function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
    console.log("WHATTUPPPP");
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight(e) {
    dropArea.classList.add("highlight");
  }
  
  function unhighlight(e) {
    dropArea.classList.remove("highlight");
  }

  function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
  
    uploadFileSpecific(files);
  }
  
  

function addFile(){
  var fileInputField = document.getElementById("fileInput");
  fileInputField.click();
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // Get the first file from the input
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    if (!file.name.split('.')[1] == '.zip') {
      console.log("Not a Zip file");
      return;
    }

    const filename = file.name.split('.')[0];
    const reader = new FileReader();
    reader.onload = async (event) => {

      const byteData = new Uint8Array(event.target.result);
      const eocdIndex = findZipHeader(byteData);
      const centralDirectoryOffset = findCentralDirectoryOffset(byteData, eocdIndex);
      const list = printCentralDirectory(byteData, centralDirectoryOffset);
      const root = constructFileSystem(list);
      console.log(root);

      /******************************************************************/
      // calculate file extensions
      const extensionCounts = root.countDistinctExtensions();

      // Calculate total file count
      const totalFiles = Object.values(extensionCounts).reduce((acc, count) => acc + count, 0);

      // Calculate percentages
      const extensionPercentages = {};
      for (const extension in extensionCounts) {
        const count = extensionCounts[extension];
        const percentage = (count / totalFiles) * 100;
        extensionPercentages[extension] = percentage.toFixed(2) + '%';
      }

      // sort the extensions according the values
      const sortedExtensions = Object.keys(extensionCounts).sort((a, b) => extensionCounts[b] - extensionCounts[a]);

      let mainExtension;

      const ext = ['.js','.py','.java','.cpp','.c','.html','.css','.php','.rb','.swift','.ts','.cs','.go','.r','.pl','.sql','.sh','.lua','.jsx','.tsx','.vue','.sass','.scss','.less','.json','.yaml','.xml','.svg','.md','.yml'];

      for (const i in sortedExtensions) {
        //console.log("extension: " + sortedExtensions[e]);
        if (ext.includes(sortedExtensions[i])) {
          mainExtension = sortedExtensions[i];
          console.log("Main File Extension Type:", mainExtension);
          break;
        }
      }

      // if there are no applicable extensions
      console.log("Main File Extension Type:", mainExtension);
      if (!mainExtension) {
        mainExtension = "undefined";
      }

      console.log("Filename:", filename);
      console.log("Total Files:", totalFiles);
      console.log("Main File Extension Type:", mainExtension);
      console.log("Extension Percentages:", extensionPercentages);

      if (mainExtension !== "undefined") {
        const request = await fetch('/api/uploadfile', {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${AuthManager.instance.access_token}`, // access token is required to upload a file
          },
          body: JSON.stringify({
            "filename": `${filename}`,
            "maintype": `${mainExtension}`,
            "userid": `${AuthManager.instance.user_id}`
          })
        })
        .then( res => res.json())
        .then( (data) => {
          // data contains a json list of files that were uploaded, operations on the list can be done here
          console.log(data);
        })
        .catch( err => console.log(err));
      }

      // do not upload file if it does not contain a file extension related to our language extensions
    };
    reader.readAsArrayBuffer(file);
  };

  function uploadFileSpecific(object) {
    //const fileInput = document.getElementById('fileInput');
    const file = object[0];
    
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
    showContainer(pieChartContainer);
    showContainer(fileListContainer);
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

function handleHome(){
  hideAll();
  showContainer(uploadContainer);
}

function addHistoryRow(item) {
  let table = document.getElementById("historyTable");

  let row = table.insertRow(-1); 

  let col1 = row.insertCell(0);
  let col2 = row.insertCell(1);
  let col3 = row.insertCell(2);

  col1.innerText = item.filename; //FileName
  col2.innerText = item.mainfiletype; //MainFileType
  col3.innerText = item.datecreated; //DateUploaded
}

async function handleHistory() {
hideAll();
showContainer(historyContainer);
clearHistoryTable();
  const request = await fetch('/api/history', {
    method: 'GET', 
    headers: {
      "Authorization": `Bearer ${AuthManager.instance.access_token}`,
    },
  })
  .then( res => res.json())
  .then( (data) => {
    // data contains a json list of files that were uploaded, operations on the list can be done here
    console.log(data);
    data.forEach(addHistoryRow);

  })
  .catch( err => console.log(err));
}

var a = document.getElementById('userName'); 
a.addEventListener('click', launchAuth, false);

window.handleJSONPResponse = function(data) {
  //console.log('Response data:', data);
  const accessToken = data.access_token;

  if (accessToken) {
    AuthManager.instance.access_token = accessToken;
    AuthManager.instance.setUserInfo();
  } 
  else {
    console.error('Access token not found in the response data');
  }
};

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.has('code')) {
  const _ = new AuthManager(urlParams.get('code'));
}

function clearHistoryTable(){
  var tableHeaderRowCount = 1;
var table = document.getElementById("historyTable");
var rowCount = table.rows.length;
for (var i = tableHeaderRowCount; i < rowCount; i++) {
    table.deleteRow(tableHeaderRowCount);
}
}


function hideAll(){
  historyContainer.classList.add("hidden");
  pieChartContainer.classList.add("hidden");
  uploadContainer.classList.add("hidden");
  fileListContainer.classList.add("hidden");
}

function showContainer(container){
  container.classList.remove("hidden");
}