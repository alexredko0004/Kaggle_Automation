// import { resolve } from "path";
import { Page, expect} from "@playwright/test";
// import loggedState from "../../auth/defaultStorageState.json";
import {post} from "../apiRequestsFunctions";
import { Dataset } from "./buildDataset";
// import axios from 'axios';

// export const createDatasetViaAxios = async (name:string,url:string)=>{
//     const fileName = url.split('/')
//     const response = await axios.post('https://www.kaggle.com/api/i/datasets.DatasetService/CreateDataset',{
//         "basicInfo": {
//             "databundleVersionType": "REMOTE_URL_FILE_SET",
//             "remoteUrlInfos": [
//                 {
//                     "name": `${fileName[fileName.length-1]}`,
//                     "url": `${url}`
//                 }
//             ],
//             "files": [],
//             "directories": []
//         },
//         "title": `${name}`,
//         "slug": `${name.toLowerCase()}`,
//         "isPrivate": true,
//         "licenseId": 4,
//         "ownerUserId": 19095547,
//         "referrer": "datasets_km"
//     },{headers:{
//         'X-Xsrf-Token':`${loggedState.cookies[7].value}`,
//         'Cookie':`CSRF-TOKEN=${loggedState.cookies[2].value}; CLIENT-TOKEN=${loggedState.cookies[8].value}; __Host-KAGGLEID=${loggedState.cookies[6].value}; ka_sessionid=${loggedState.cookies[1].value}`
//     }})
//     console.log(name+' is done!')
// }

export const createDatasetViaPW = async (page:Page,name:string,fileUrls:string[]):Promise<{datasetId:string,ownerSlug:string,datasetSlug:string}>=>{
    const dataset = Dataset.builder()
    .setTitle(name)
    .setSlug()
    .setOwnerUserId()
    .setRemoteFiles(fileUrls)
    .build()
    
    const response = await post(page,`${process.env.CREATE_DATASET_ENDPOINT}`,JSON.stringify(dataset))
    expect(response.ok()).toBe(true);
    const createdDataset = JSON.parse(await response.text())
    console.log(name+' dataset is created');
    return {
        datasetSlug:createdDataset.datasetVersionReference.slug,          
        ownerSlug:createdDataset.datasetVersionReference.ownerSlug,
        datasetId:createdDataset.datasetVersionReference.datasetId
    }
}

export const deleteDatasetViaPW = async (page:Page,datasetSlug:string,ownerSlug:string)=>{
    const response = await post(page,`${process.env.DELETE_DATASET_ENDPOINT}`,JSON.stringify({
        "datasetSlug": datasetSlug,
        "ownerSlug": ownerSlug
    }))
    expect(response.ok()).toBe(true);
    console.log(datasetSlug+' dataset is removed')
}