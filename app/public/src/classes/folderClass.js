import { OBJECT_TYPE } from "../enums/fileTypes.js";

export class FileObject {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
    }

    addChildren(children) {
        for (const child of children)
        {
            this.addChild(child);
        }
    }

    countDistinctExtensions() {
        // function that returns a dictionary that has file extensions as keys
        // and the value is the number of files that have that extension
        const extensionCount = {};
        //const zipFileStructure = {};

        const countExtensions = (node, folderName) => { // local recursive function within countDistinctExtensions function
            if (node.type === OBJECT_TYPE.FILE) {
                const extension = node.name.substring(node.name.lastIndexOf('.'));
                //zipFileStructure[folderName].push(node.name);
                if (extensionCount[extension]) {
                    extensionCount[extension]++;
                } 
                else {
                    extensionCount[extension] = 1;
                }
            } 
            else if (node.type === OBJECT_TYPE.FOLDER) {
                //ipFileStructure[node.name] = [];
                for (const child of node.children) {
                    countExtensions(child, node.name);
                }
            }
        };
        countExtensions(this, this.name);
        //console.log("extensions: " + JSON.stringify(extensionCount));
        //console.log("zipFileStructure: " + JSON.stringify(zipFileStructure));
        //return { extensionCounts: extensionCount, zipFileStructure: zipFileStructure };
        return extensionCount;
    }
}

export const constructFileSystem = (files) => {
    const root = new FileObject("Root", OBJECT_TYPE.FOLDER);

    for (const filePath of files) {
        let currentFolder = root;

        const parts = filePath.split('/');
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;

            let child = currentFolder.children.find(child => child.name === part);

            if (!child) {
                const type = isFile ? OBJECT_TYPE.FILE : OBJECT_TYPE.FOLDER;
                child = new FileObject(part, type);
                currentFolder.addChild(child);
            }

            currentFolder = child;
        }
    }

    return root;
};
