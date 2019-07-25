const fileService = AzureStorage.File.createFileService("DefaultEndpointsProtocol=https;AccountName=ccbdrecordings;AccountKey=+kpkFr9DrArYGv06L6Ivkxtp5dGuAFuLD8H2PgEwnVA0xSs7Oi9utjMXOGirpCwnryDsQWDGHw1gCw82K+Ix7g==;EndpointSuffix=core.windows.net");
let selectedDir = '';


const getDirectories = function () {
    fileService.listFilesAndDirectoriesSegmented('current', '', null, function (error, result, response) {
        const parent = document.getElementById("directories");
        const dirs = result.entries.directories;
        for(let i = 0;i < dirs.length; i++){
            let node = document.createElement("Button");
            node.setAttribute('class', 'list-group-item list-group-item-action');
            node.onclick = function(){selectDir(dirs[i].name)};
            let icon = document.createElement('span');
            icon.classList.add('icon');
            icon.classList.add('far');
            icon.classList.add('fa-folder');
            let textNode = document.createTextNode(dirs[i].name);
            node.appendChild(icon);
            node.appendChild(textNode);
            parent.appendChild(node);
        }
    });
};
const selectDir = function(dir){
    selectedDir = dir;
    getFiles();
};

let getFiles = function(){
    hideDirs();
    fileService.listFilesAndDirectoriesSegmented('current', selectedDir, null, function(error, result, response){
        const fileDiv = document.getElementById('filesDiv');
        fileDiv.classList.remove('hidden');
        const levelUp = document.getElementById('levelUp');
        levelUp.classList.remove('hidden');
        const parent = document.getElementById('files');
        let files = result.entries.files;
        for(let i = 0; i < files.length; i++){
            let node = document.createElement('li');
            node.setAttribute('class', 'list-group-item');
            let icon = document.createElement('span');
            icon.classList.add('icon');
            icon.classList.add('far');
            icon.classList.add('fa-file-audio');

            let link = document.createElement('A');
            link.title = files[i].name;
            link.href = downloadFile(selectedDir, files[i].name);
            let textNode = document.createTextNode(files[i].name);
            node.appendChild(icon);
            link.appendChild(textNode);
            node.appendChild(link);
            let size = document.createElement("span");
            size.setAttribute('class', 'badge badge-dark float-right');
            let sizeText = document.createTextNode(formatFileSize(files[i].contentLength));
            size.appendChild(sizeText);
            node.appendChild(size);
            parent.appendChild(node);
        }
    });
};

const downloadFile = function(dir, file){
    const sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: 'r',
            Start: Date.now(),
            Expiry: Date.now() + 3600000
        },
    };

    const sasToken = fileService.generateSharedAccessSignature('current', dir, file, sharedAccessPolicy);
    const result = fileService.getUrl('current', dir, file, sasToken);
    return result;
};
const hideDirs = function(){
    const dirsDiv = document.getElementById('dirsDiv');
    dirsDiv.setAttribute('class', 'hidden');
};

const showDirs = function(){
    let filesDiv = document.getElementById('filesDiv');
    let files = document.getElementById('files');
    let dirsDiv = document.getElementById('dirsDiv');
    let levelUp = document.getElementById('levelUp');
    filesDiv.classList.add('hidden');
    while(files.firstChild){
        files.removeChild(files.firstChild);
    }
    levelUp.classList.add('hidden');

    dirsDiv.classList.remove('hidden');

};

function formatFileSize(bytes,decimalPoint) {
    if(bytes == 0) return '0 Bytes';
    let k = 1000,
        dm = decimalPoint || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

$(document).ready(function(){
    getDirectories();
});
