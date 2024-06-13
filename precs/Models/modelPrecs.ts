import { Page, expect} from "@playwright/test";
import {post} from "../apiRequestsFunctions";
import { Model } from "./buildModel";

export const createModelViaPW = async (page:Page,name:string,visibility:string)=>{
        const model = Model.builder()
        .setOwnerSlug()
        .setTitle(name)
        .setSlug()
        .setIsPrivate(visibility)
        .build();

        const response = await post(page,`${process.env.CREATE_MODEL_ENDPOINT}`,JSON.stringify(model))
        expect(response.ok()).toBe(true);
        const createdModel = JSON.parse(await response.text())
        console.log(name+' model is created '+createdModel.id)
        return createdModel
    }

export const deleteModelViaPW = async (page:Page,id:number)=>{
    const response = await post(page,`${process.env.DELETE_MODEL_ENDPOINT}`,JSON.stringify({
        "modelId": id
    }))
    expect(response.ok()).toBe(true);
    console.log('id_'+id+' model is deleted')
}