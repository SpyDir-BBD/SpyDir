import { constructFileSystem } from "./src/classes/folderClass.js";
import { findZipHeader, findCentralDirectoryOffset, printCentralDirectory } from "./src/utils/zipRead.js";

document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("button").addEventListener("click", uploadFile);
});

document.getElementById("burgerButton").addEventListener("click",openNav);
document.getElementById("closeBurger").addEventListener("click",closeNav);

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
  document.getElementById("navBar").style.width = "25rem";
};

function closeNav() {
  document.getElementById("navBar").style.width = "0";
};