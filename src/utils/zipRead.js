const fs = require('fs');
const { constructFileSystem } = require('../classes/folderClass');

const getZipByteData = (filePath) => {
    try {
        const fileData = fs.readFileSync(filePath);
        return fileData;
    } catch (err) {
        console.error("Error reading file:", err);
        return null;
    }
};

const findZipHeader = (byteData) => {
    const signature = 0x06054b50;
    for (let i = 0; i < byteData.length - 3; i++) {
        if (byteData.readUInt32LE(i) === signature) {
            return i;
        }
    }
    return -1;
};

const findCentralDirectoryOffset = (byteData, eocdIndex) => {
    // Ensure there is enough space for the EOCD record
    if (eocdIndex < 22 || eocdIndex >= byteData.length) {
        console.error("Invalid EOCD index.");
        return -1;
    }

    // Read the EOCD record fields
    const offsetFieldOffset = eocdIndex + 16; // Offset to start of central directory
    const offsetToStartOfCentralDirectory = byteData.readUInt32LE(offsetFieldOffset);
    return offsetToStartOfCentralDirectory;
};

const printCentralDirectory = (byteData, centralDirectoryOffset) => {
    const fileList = [];
    const signature = 0x02014b50;
    let offset = centralDirectoryOffset;

    while (offset < byteData.length - 4) {
        // Check if the next 4 bytes match the central directory file header signature
        if (byteData.readUInt32LE(offset) === signature) {
            const fileNameLength = byteData.readUInt16LE(offset + 28);
            const extraFieldLength = byteData.readUInt16LE(offset + 30);
            const commentLength = byteData.readUInt16LE(offset + 32);
            
            // Calculate the total length of the central directory file header
            const headerLength = 46 + fileNameLength + extraFieldLength + commentLength;

            // Read the file name
            const fileName = byteData.toString('utf8', offset + 46, offset + 46 + fileNameLength);
            fileList.push(fileName);
            //console.log("File:", fileName);

            // Move to the next central directory file header
            offset += headerLength;
        } else {
            // If the signature doesn't match, stop parsing
            break;
        }
    }
    return fileList;
};




const filePath = 'src/utils/temp.zip';
const byteData = getZipByteData(filePath);
const eocdIndex = findZipHeader(byteData);
const centralDirectoryOffset = findCentralDirectoryOffset(byteData, eocdIndex);
const list = printCentralDirectory(byteData, centralDirectoryOffset);

const root = constructFileSystem(list);4

console.log(root);

console.log(root.children);

for (const child of root.children)
{
    console.log(child);
    for (const sndchild of child.children)
    {
        console.log(sndchild);
        console.log(sndchild.countDistinctExtensions());
    }
}