
export const findZipHeader = (byteData) => {
    const signature = 0x06054b50;
    for (let i = 0; i < byteData.length - 3; i++) {
        // Manually read the 32-bit unsigned integer in little-endian format
        const value = byteData[i] |
                      (byteData[i + 1] << 8) |
                      (byteData[i + 2] << 16) |
                      (byteData[i + 3] << 24);

        if (value === signature) {
            return i;
        }
    }
    return -1;
};


export const findCentralDirectoryOffset = (byteData, eocdIndex) => {
    if (eocdIndex < 22 || eocdIndex >= byteData.length) {
        console.error("Invalid EOCD index.");
        return -1;
    }

    const offsetFieldOffset = eocdIndex + 16;
    // Manually read the 32-bit unsigned integer in little-endian format
    const offsetToStartOfCentralDirectory = byteData[offsetFieldOffset] |
                                             (byteData[offsetFieldOffset + 1] << 8) |
                                             (byteData[offsetFieldOffset + 2] << 16) |
                                             (byteData[offsetFieldOffset + 3] << 24);
    
    return offsetToStartOfCentralDirectory;
};

export const printCentralDirectory = (byteData, centralDirectoryOffset) => {
    const fileList = [];
    const signature = 0x02014b50;
    let offset = centralDirectoryOffset;

    while (offset < byteData.length - 4) {
        // Manually read the 32-bit unsigned integer in little-endian format
        const value = byteData[offset] |
                      (byteData[offset + 1] << 8) |
                      (byteData[offset + 2] << 16) |
                      (byteData[offset + 3] << 24);

        if (value === signature) {
            const fileNameLength = byteData[offset + 28] |
                                   (byteData[offset + 29] << 8);
            const extraFieldLength = byteData[offset + 30] |
                                     (byteData[offset + 31] << 8);
            const commentLength = byteData[offset + 32] |
                                  (byteData[offset + 33] << 8);
            
            const headerLength = 46 + fileNameLength + extraFieldLength + commentLength;

            // Construct the file name using Array.from to convert bytes to characters
            const fileNameBytes = byteData.slice(offset + 46, offset + 46 + fileNameLength);
            const fileName = String.fromCharCode(...Array.from(fileNameBytes));

            fileList.push(fileName);
            offset += headerLength;
        } else {
            break;
        }
    }
    return fileList;
};





// const filePath = 'src/utils/temp.zip';
// const byteData = getZipByteData(filePath);
// const eocdIndex = findZipHeader(byteData);
// const centralDirectoryOffset = findCentralDirectoryOffset(byteData, eocdIndex);
// const list = printCentralDirectory(byteData, centralDirectoryOffset);

// console.log(list);

// const root = constructFileSystem(list);

// console.log(root);

// console.log(root.children);

// for (const child of root.children)
// {
//     console.log(child);
//     for (const sndchild of child.children)
//     {
//         console.log(sndchild);
//         console.log(sndchild.countDistinctExtensions());
//     }
// }