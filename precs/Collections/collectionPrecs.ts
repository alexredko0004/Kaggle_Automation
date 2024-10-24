import { Page, expect} from "@playwright/test";
import {post} from "../apiRequestsFunctions";


export const createCollectionViaPW = async(page:Page,collectionName: string):Promise<{collectionId:string}>=>{
    const response = await post(page,`${process.env.CREATE_COLLECTION_ENDPOINT}`,JSON.stringify({name:collectionName}))
    expect(response.ok()).toBe(true);
    console.log(response)
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