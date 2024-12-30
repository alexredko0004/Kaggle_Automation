import { Page, expect} from "@playwright/test";
import {post} from "../apiRequestsFunctions";


export const createCollectionViaPW = async(page:Page,collectionName: string):Promise<{collectionId:string}>=>{
    const response = await post(page,`${process.env.CREATE_COLLECTION_ENDPOINT}`,JSON.stringify({name:collectionName}))
    expect(response.ok()).toBe(true);
    const createdCollectionId = JSON.parse(await response.text());
    console.log(collectionName+' collection is created');
    return {
        collectionId:createdCollectionId.collectionId
    }
}


export const deleteCollectionViaPW = async(page:Page,collectionId: string)=>{
    const collectionsResponse = await post(page,`${process.env.LIST_COLLECTIONS_ENDPOINT}`,JSON.stringify({orderBy
        : 
        "LIST_COLLECTIONS_ORDER_BY_RECENTLY_CREATED_COLLECTION"}));
    expect(collectionsResponse.ok()).toBe(true);
    const collections = JSON.parse(await collectionsResponse.text());
    let collectionName;
    for (let collection of collections.collections){
        collectionName = collection.collectionId===collectionId?collection.name:collectionName
    }

    const response = await post(page,`${process.env.DELETE_COLLECTION_ENDPOINT}`,JSON.stringify({collectionId:collectionId}));
    expect(response.ok()).toBe(true);
    console.log(collectionName+' collection is deleted');
}

export const linkDatasetsAndModelsWithCollectionViaPW = async(page:Page,collectionId: string,arrayOfModelIDs:string[],arrayOfDatasetIDs:string[])=>{
    type ModelObject = {
        modelId: string
    }
    type DatasetObject = {
        datasetId: string
      }
    const modelsPayload:ModelObject[]=[];
    const datasetsPayload:DatasetObject[] = [];
    
    for (let model of arrayOfModelIDs){
        modelsPayload.push({modelId:model})
    }

    for (let dataset of arrayOfDatasetIDs){
        datasetsPayload.push({datasetId:dataset})
    }

    const response = await post(page,`${process.env.ADD_ITEMS_TO_COLLECTION_ENDPOINT}`,JSON.stringify({
        collectionId:parseInt(collectionId,10),
        items:[
            ...modelsPayload,
            ...datasetsPayload
        ]
    }));
    expect(response.ok()).toBe(true);
    console.log(`modelIDs:${arrayOfModelIDs} and datasetIDs:${arrayOfDatasetIDs} were added to collectionID ${collectionId}`);
}