import { Page, expect} from "@playwright/test";
import {post} from "../apiRequestsFunctions"

export const createModelViaPW = async (page:Page,name:string,visibility:string)=>{
    const response = await post(page,`${process.env.CREATE_MODEL_ENDPOINT}`,JSON.stringify({
        "ownerSlug": "testhillel",
        "model": {
            "slug": name+'-slug',
            "title": name,
            "id": 0,
            "isPrivate": visibility==='Private'?true:false,
            "versionId": 0,
            "voters": [],
            "licenseGroups": [],
            "instances": [],
            "frameworks": [],
            "autoGeneratedSources": [],
            "authors": [],
            "moderationStatus": "PRIVATED_MODERATION_STATUS_NO_ABUSE",
            "links": [],
            "implementationModels": []
        }
    }))
    expect(response.ok()).toBe(true);
    console.log(name+' model is created')
}