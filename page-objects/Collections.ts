import { Locator} from "@playwright/test";
import { BasePage } from './BasePage';
import {post} from "../precs/apiRequestsFunctions";

export class Collections extends BasePage{
    private readonly addBtn: Locator
    private readonly createButtonOnModal: Locator
    private readonly listItem: Locator

    constructor(page){
        super(page)
        this.addBtn = page.locator('.drawer-outer-container button').filter({hasText:/^Add$/})
        this.createButtonOnModal = page.getByRole('dialog').getByRole('button').nth(1)
        this.listItem = page.locator('.drawer-outer-container ul label')
    }

    public async clickAddBtn(){
        await this.addBtn.click()
    }

    public async clickCreateBtnAndGetCreatedCollectionID(){
        const createdCollectionResponsePromise = this.page.waitForResponse(response=>response.url().includes(`${process.env.CREATE_COLLECTION_ENDPOINT}`)&&response.status()===200);
        await this.createButtonOnModal.click();
        const response = await createdCollectionResponsePromise;
        const responseJson = await response.json();
        return responseJson
    }

    public async fillCollectionNameOnModal(name:string){
        await this.page.getByPlaceholder('Untitled Collection').fill(name)
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

    public async isNewCollectionModalVisible(){
        const modal = this.page.getByRole('dialog').filter({has:this.page.getByText('New Collection')});
        const isVisible = await modal.isVisible();
        return isVisible
    }

    public async isCreateButtonEnabledOnNewCollectionModal(){
        const classValue = await this.createButtonOnModal.getAttribute('class');
        return classValue?.includes('disabled')
    }

    public async selectCollectionsWithNames(collections:string[]){
        for (let item of collections){
            await this.listItem.filter({hasText:item}).click({force:true})
        }
    }

}