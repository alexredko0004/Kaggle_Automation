import { resolve } from "path";
import loggedState from "../auth/defaultStorageState.json"
import axios from 'axios';

export const createDataset = async (name:string,url:string)=>{
    const fileName = url.split('/')
    await axios.post('https://www.kaggle.com/api/i/datasets.DatasetService/CreateDataset',{
        "basicInfo": {
            "databundleVersionType": "REMOTE_URL_FILE_SET",
            "remoteUrlInfos": [
                {
                    "name": `${fileName[fileName.length-1]}`,
                    "url": `${url}`
                }
            ],
            "files": [],
            "directories": []
        },
        "title": `${name}`,
        "slug": `${name.toLowerCase()}`,
        "isPrivate": true,
        "licenseId": 4,
        "ownerUserId": 19095547,
        "referrer": "datasets_km"
    },{headers:{
        'X-Xsrf-Token':`${loggedState.cookies[7].value}`,
        'Cookie':`CSRF-TOKEN=${loggedState.cookies[2].value}; CLIENT-TOKEN=${loggedState.cookies[8].value}; __Host-KAGGLEID=${loggedState.cookies[6].value}; ka_sessionid=${loggedState.cookies[1].value}`
    }})
    console.log(name+' is done!')
}