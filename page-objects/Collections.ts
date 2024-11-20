import { Locator} from "@playwright/test";
import { BasePage } from './BasePage';
import {post} from "../precs/apiRequestsFunctions";

export class Collections extends BasePage{
    private readonly addBtn: Locator
    private readonly listItem: Locator

    constructor(page){
        super(page)
        this.listItem = page.locator('.drawer-outer-container ul label')
        this.addBtn = page.locator('.drawer-outer-container button').filter({hasText:/^Add$/})
    }

    public async clickAddBtn(){
        await this.addBtn.click()
    }

    public async getAvailableCollections(){
        await this.page.waitForTimeout(500)
        const collectionNamesOnPanel = await this.listItem.locator('.MuiTypography-root').allInnerTexts()
        return collectionNamesOnPanel
    }

    public async getListOfCollectionsForUser(){
        const collectionsResponse = await post(this.page,`${process.env.LIST_COLLECTIONS_ENDPOINT}`,JSON.stringify({orderBy
            : 
            "LIST_COLLECTIONS_ORDER_BY_RECENTLY_CREATED_COLLECTION"}));
        const collections = JSON.parse(await collectionsResponse.text());
        return collections.collections
    }

    public async selectCollectionsWithNames(collections:string[]){
        for (let item of collections){
            await this.listItem.filter({hasText:item}).click({force:true})
        }
    }

}