import { constructFileSystem } from "./src/classes/folderClass.js";
import { findZipHeader, findCentralDirectoryOffset, printCentralDirectory } from "./src/utils/zipRead.js";
import { AuthManager } from "./src/utils/GithubAuth.js";
import { LANGUAGE_EXTENSIONS } from "./src/enums/languageExtensions.js";
import { Themes } from "./src/enums/styles.js";
import { setTheme } from "./src/classes/styleSwitcher.js";

const ext = ['.js','.py','.java','.cpp','.c','.html','.css','.php','.rb','.swift','.ts','.cs','.go','.r','.pl','.sql','.sh','.lua','.jsx','.tsx','.vue','.sass','.scss','.less','.json','.yaml','.xml','.svg','.md','.yml', '.other'];

document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("button").addEventListener("click", uploadFile);
});

const graphColors = [
  'rgba(255, 209, 220, 1)',
  'rgba(226, 222, 243, 1)',
  'rgba(204, 255, 204, 1)',
  'rgba(255, 229, 204, 1)',
  'rgba(214, 234, 248, 1)',
  'rgba(255, 204, 204, 1)',
  'rgba(238, 130, 238, 1)',
  'rgba(221, 160, 221, 1)',
  'rgba(255, 182, 193, 1)',
  'rgba(240, 230, 140, 1)',
  'rgba(152, 251, 152, 1)',
  'rgba(173, 216, 230, 1)',
  'rgba(240, 255, 255, 1)',
  'rgba(135, 206, 250, 1)',
  'rgba(255, 105, 180, 1)',
  'rgba(240, 128, 128, 1)',
  'rgba(144, 238, 144, 1)',
  'rgba(173, 216, 230, 1)',
  'rgba(255, 240, 245, 1)',
  'rgba(240, 255, 255, 1)'
];


window.expandOrCollapseFiles = expandOrCollapseFiles;
window.handleDrop = handleDrop;
window.setColorScheme = setColorScheme;

document.getElementById("burgerButton").addEventListener("click",openNav);

document.getElementById("closeBurger") .addEventListener("click",closeNav);
document.getElementById("uploadIcon")  .addEventListener("click",addFile);
document.getElementById("browseLink")  .addEventListener("click",addFile);
document.getElementById("loginLink").addEventListener('click', launchAuth, false);
document.getElementById("historyLink") .addEventListener("click",handleHistory);

async function authGithubLogin() {
  let url;
  const loginResponse = await fetch('/github-login', {
    method: 'GET'
  })
  .then( res => res.json())
  .then( (data) => {
    //console.log(data);
    url = data["url"];
  })
  .catch( err => console.log(err));
  window.open(url);
}

var a = document.getElementById('userName'); 
a.addEventListener('click', authGithubLogin, false);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.has('code')) {
  const _ = new AuthManager(urlParams.get('code'));
}
document.getElementById("homeLink").addEventListener("click",handleHome);
document.getElementById("fileInput").addEventListener("change",uploadFile);


var loginButton = document.getElementById('loginButton'); 
loginButton.addEventListener('click', launchAuth, false);


const dropArea = document.getElementById("drop-area");
  dropArea.addEventListener("dragenter", handleDrop, false);
  dropArea.addEventListener("dragleave", handleDrop, false);
  dropArea.addEventListener("dragover", handleDrop, false);
  dropArea.addEventListener("drop", handleDrop, false);


  const historyContainer = document.getElementById("historyContainer");
  const pieChartContainer = document.getElementById("pieChartContainer");
  const uploadContainer = document.getElementById("uploadContainer");
  const fileListContainer = document.getElementById("fileListContainer");
  const webDescContainer = document.getElementById("webDescContainer");
  const fileNameHolder = document.getElementById("fileNameText");
  const fileHolder = document.getElementById("displayFile");

  let userPreferredTheme = 0;
  //SET THIS FROM THE DATABASE!!!


  hideAll();
  showContainer(uploadContainer);
  showContainer(webDescContainer);


  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight(dropArea) {
    dropArea.classList.add("highlight");
    console.log("hello???/");
  }
  
  function unhighlight(dropArea) {
    dropArea.classList.remove("highlight");
  }

  function handleDrop(item) {
    console.log("????");
    const fileDataTransfer = item.dataTransfer;
    const files = fileDataTransfer.files;
  
    uploadFileSpecific(files);
  }

  function expandOrCollapseFiles(event){
    const object = event.target;
    const parent = object.parentElement;
    const spanHolder =parent.getElementsByTagName("span")[0];
    const listHolder = parent.getElementsByTagName("ul")[0];
    if(spanHolder.innerText == "expand_more"){
      spanHolder.innerText = "expand_less";
      listHolder.style.maxHeight = "30rem";
    }
    else{
      spanHolder.innerText = "expand_more";
      listHolder.style.maxHeight = "0rem";
    }
  }
  
  

function addFile(){
  var fileInputField = document.getElementById("fileInput");
  fileInputField.click();
  uploadFileSpecific(fileInputField.files);
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // Get the first file from the input

    processFile(file);
    
   
  };

  function uploadFileSpecific(object) {
    const file = object[0]; // Get the first file from the input

    processFile(file);
  };

  function processFile(file){
    
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
      fileHolder.replaceChildren();
      createFolder(root.name,root.children,fileHolder);
      showContainer(fileListContainer);

      /******************************************************************/
      // calculate file extensions
      const extensionCounts = root.countDistinctExtensions();

      // Calculate total file count
      const totalFiles = Object.values(extensionCounts).reduce((acc, count) => acc + count, 0);

      const extensionPercentages = {};
      var extensionPercentagesValues =[];
      for (const extension in extensionCounts) {
        const count = extensionCounts[extension];
        const percentage = (count / totalFiles) * 100;
        extensionPercentagesValues.push(parseFloat(percentage.toFixed(2)));
        extensionPercentages[extension] = percentage.toFixed(2) + '%';
      }

      // sort the extensions according the values
      const sortedExtensions = Object.keys(extensionCounts).sort((a, b) => extensionCounts[b] - extensionCounts[a]);
      const sortedExtensionPercentages = extensionPercentagesValues.sort(function(a, b){return b - a;});
      
      document.getElementById("fileTypeList").replaceChildren();
      let mainExtension = sortedExtensions[0];
      if (!ext.includes(mainExtension)) { // if main
        mainExtension = ".other";
        sortedExtensions[0] = ".other";
      }
      handleFileTypeDisplay(sortedExtensions, sortedExtensionPercentages);

      //for (const i in sortedExtensions) {
      //  if (ext.includes(sortedExtensions[i])) {
      //    mainExtension = sortedExtensions[i];
      //    console.log("Main File Extension Type:", mainExtension);
      //    break;
      //  }
      //}

      // if there are no applicable extensions
      //console.log("Main File Extension Type:", mainExtension);
      //if (!mainExtension) {
      //  mainExtension = "undefined";
      //}

      console.log("Filename:", filename);
      console.log("Total Files:", totalFiles);
      console.log("Main File Extension Type:", mainExtension);
      console.log("Extension Percentages:", extensionPercentages);
      document.getElementById("fileBlockHolder").classList.remove("hidden");

      fileNameHolder.replaceChildren();
      const fileTextNode = document.createTextNode(filename + ".zip");
      fileNameHolder.appendChild(fileTextNode);

      //if (mainExtension !== "undefined") {
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
      //}

      // do not upload file if it does not contain a file extension related to our language extensions
    };
    reader.readAsArrayBuffer(file);
    showContainer(pieChartContainer);
    showContainer(fileListContainer);
  }

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
  showContainer(webDescContainer);
}

function addHistoryRow(item) {
  const table = document.getElementById("historyTable");

  const row = table.insertRow(-1); 

  const col1 = row.insertCell(0);
  const col2 = row.insertCell(1);
  const col3 = row.insertCell(2);

  col1.innerText = item.filename; //FileName
  col2.innerText = item.mainfiletype; //MainFileType
  col3.innerText = item.datecreated; //DateUploaded
}

async function handleHistory() {
  hideAll();
  showContainer(historyContainer);
  clearHistoryTable();
  if (AuthManager.instance) {
    const request = await fetch('/api/history', {
      method: 'GET', 
      headers: {
        "Authorization": `Bearer ${AuthManager.instance.access_token}`,
        "user_id": AuthManager.instance.user_id
      }
    })
    .then( res => res.json())
    .then( (data) => {
      //console.log(data);
      data.map( (item) => {
        const ft = ext[item.mainfiletype-1];
        const dt = item.datecreated.split('T')[0];
        item.mainfiletype = ft;
        item.datecreated = dt;
        addHistoryRow(item);
      });
    })
    .catch( err => console.log(err));
  }
  else {
    // tell user to login before requesting history
    console.log("Tell the user to login before fetching history");
  }
}

function hideAll(){
  historyContainer.classList.add("hidden");
  pieChartContainer.classList.add("hidden");
  uploadContainer.classList.add("hidden");
  fileListContainer.classList.add("hidden");
  webDescContainer.classList.add("hidden");
}

function showContainer(item){
  item.classList.remove("hidden");
}

function handleFileTypeDisplay(sortedExtensions, sortedExtensionPercentages){
  for (let i = 0; i < sortedExtensions.length; i++) {

    const outerBarItemNode = document.createElement("li");
    const listHolderNode = document.createElement("ul");
    const innerExtListNode = document.createElement("li");
    const innerPercentageListNode = document.createElement("li");

    const extensionTextNode = document.createTextNode(sortedExtensions[i]);
    const percentageTextNote = document.createTextNode(sortedExtensionPercentages[i]  + "%");
    innerExtListNode.appendChild(extensionTextNode);
    innerPercentageListNode.appendChild(percentageTextNote);

    listHolderNode.appendChild(innerExtListNode);
    listHolderNode.appendChild(innerPercentageListNode);

    listHolderNode.classList.add("innerBarItem");
    outerBarItemNode.classList.add("outerBarItem");

    outerBarItemNode.appendChild(listHolderNode);
    document.getElementById("fileTypeList").appendChild(outerBarItemNode);
  }

  const dataTable = document.getElementById("fileTypeList");
  var children = dataTable.children;
  for (var i = 0; i < children.length; i++) {
    length = sortedExtensionPercentages[i]/2;
    children[i].style.width = length + "rem";
    children[i].style.backgroundColor = graphColors[i];
}
}

let currentIndex = 0; // Current index of the theme array
const themesArray = ['Light', 'Night', 'Contrast'];

// Function to switch themes
function switchTheme() {
    setTheme(Themes[themesArray[currentIndex]]);
    currentIndex = (currentIndex + 1) % themesArray.length; // Move to the next index, wrapping around
}

function changeTheme(index) {
  setTheme(Themes[themesArray[index]]);
}
// Event listener for space bar
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        switchTheme();
    }
});

changeTheme(userPreferredTheme);
//TODO: SET THIS FROM DATABASE!!!

function createFolder(folderName,items,parent) {
  //console.log("folder name: " + folderName);
  //console.log("items: " + items);
  //console.log("parent: " + parent);
  const folderHolder = document.createElement("section");
  folderHolder.classList.add("folderHolder");
  //console.log("Here!");

  const innerFolderHolder = document.createElement("section");
  innerFolderHolder.classList.add("innerFolderHolder");
  innerFolderHolder.setAttribute("onclick","expandOrCollapseFiles(event)");


  const folderListText = document.createElement("h3");
  folderListText.classList.add("folderListText");
  const folderListTextValue = document.createTextNode(folderName);
  folderListText.appendChild(folderListTextValue);


  const expandButtonIcon = document.createElement("span");
  expandButtonIcon.classList.add("material-symbols-outlined");
  expandButtonIcon.classList.add("expandClass");
  const expandIconText = document.createTextNode("expand_more");
  expandButtonIcon.appendChild(expandIconText);

  innerFolderHolder.appendChild(folderListText);
  innerFolderHolder.appendChild(expandButtonIcon);

  const fileListHolder = document.createElement("ul");
  fileListHolder.classList.add("fileList");

  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    //console.log(element);
    if(element.type == "FILE"){
      let innerFile = document.createElement("li");
      innerFile.classList.add("innerFile");

      let innerFileText = document.createTextNode(element.name);
      innerFile.appendChild(innerFileText);

      fileListHolder.appendChild(innerFile);
    }
    else{
      let fileElem = document.createElement("li");
      fileListHolder.appendChild(fileElem);
      createFolder(element.name,element.children,fileElem);
    }
  }
  folderHolder.appendChild(innerFolderHolder);
  folderHolder.appendChild(fileListHolder);
  parent.appendChild(folderHolder);
}

function setColorScheme(){
  const radioButtons = document.querySelectorAll('input[name="theme"]');
  let selectedIndex;
      for (const radioButton of radioButtons) {
          if (radioButton.checked) {
              selectedIndex = radioButton.id;
              break;
            }
          }
          changeTheme(selectedIndex);
          //set user preferredtheme in database
}

function clearHistoryTable(){
  var tableHeaderRowCount = 1;
  var table = document.getElementById("historyTable");
  var rowCount = table.rows.length;
  for (var i = tableHeaderRowCount; i < rowCount; i++) {
    table.deleteRow(tableHeaderRowCount);
  }
}



