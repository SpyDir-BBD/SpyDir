const { OBJECT_TYPE } = require("../enums/fileTypes");

class FileObject {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
    }

    addChildren(children)
    {
        for (const child of children)
        {
            this.addChild(child);
        }
    }

    countDistinctExtensions() {
        const extensionCount = {};
        for (const child of this.children) {
            if (child.type === OBJECT_TYPE.FILE) {
                const extension = child.name.substring(child.name.lastIndexOf('.'));
                if (extensionCount[extension]) {
                    extensionCount[extension]++;
                } else if (extension.length) {
                    extensionCount[extension] = 1;
                }
            }
        }
        return extensionCount;
    }
}

const constructFileSystem = (files) => {
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
}

module.exports = {
    constructFileSystem
}