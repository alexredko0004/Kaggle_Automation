import { Locator} from "@playwright/test";
import { BasePage } from './BasePage';
import {post} from "../precs/apiRequestsFunctions";

export class Collections extends BasePage{
    private readonly addBtn: Locator
    private readonly collectionModal: Locator
    private readonly mainButtonOnModal: Locator
    private readonly listItemOnPanel: Locator
    private readonly listItemOnTab: Locator

    constructor(page){
        super(page)
        this.addBtn = page.locator('.drawer-outer-container button').filter({hasText:/^Add$/})
        this.collectionModal = page.getByRole('dialog')
        this.mainButtonOnModal = page.getByRole('dialog').getByRole('button').nth(1)
        this.listItemOnPanel = page.locator('.drawer-outer-container ul label')
        this.listItemOnTab = page.locator('#site-content .km-list li:not([role="menuitem"])')
    }

    public async clickAddBtn(){
        await this.addBtn.click()
    }

    public async clickMainBtnOnPopUpAndGetCollectionID(force?:"force"){
        if(force==="force"){
            await this.mainButtonOnModal.click({force:true});
        }else{
        const createdCollectionResponsePromise = this.page.waitForResponse(response=>response.url().includes(`${process.env.CREATE_COLLECTION_ENDPOINT}`)&&response.status()===200);
        const updatedCollectionResponsePromise = this.page.waitForResponse(response=>response.url().includes(`/UpdateCollection`)&&response.status()===200);
        await this.mainButtonOnModal.click();
        const response = await Promise.race([createdCollectionResponsePromise,updatedCollectionResponsePromise]);
        const responseJson = await response.json();
        return responseJson
        }
    }

    public async clickThreeDotsButtonForCollectionWithName(name:string){
        let reg = new RegExp(String.raw`${name}\s.*List\sItem`);
        const threeDotsButtonForCollection = this.page.locator('.MuiList-root').getByLabel(reg).getByLabel('Actions for this collection');
        await threeDotsButtonForCollection.click()
    }

    public async fillCollectionNameOnModal(name:string){
        const modalType = await this.collectionModal.locator('h2').innerText();
        if(modalType==='New Collection') {
           await this.page.getByPlaceholder('Untitled Collection').fill(name)
        }
        if(modalType==='Rename Collection'){
            await this.page.getByPlaceholder('New Collection Name').fill(name)
         }
    }

    public async getAvailableCollectionsOnPanel(){
        await this.page.waitForTimeout(500)
        const collectionNamesOnPanel = await this.listItemOnPanel.locator('.MuiTypography-root').allInnerTexts()
        return collectionNamesOnPanel
    }

    public async getCollectionNamesAndNumberOFTheirContents():Promise<{name:string|undefined;itemsCount:number}[]>{
        let resultingArray:{name:string|undefined;itemsCount:number}[]=[]
        const listOfLocators = await this.listItemOnTab.all();
        for (let locator of listOfLocators){
            const collName = (await locator.getAttribute('aria-label'))?.replace(/(.*)\s\((\d+\)).*/,"$1");
            const countNumber = Number((await locator.getAttribute('aria-label'))?.replace(/(.*)\s\((\d+)\).*/,"$2"));
            resultingArray.push({name:collName,itemsCount:countNumber})
        }
        return resultingArray
    }

    public async getListOfCollectionsForUser(){
        const collectionsResponse = await post(this.page,`${process.env.LIST_COLLECTIONS_ENDPOINT}`,JSON.stringify({orderBy
            : 
            "LIST_COLLECTIONS_ORDER_BY_RECENTLY_CREATED_COLLECTION"}));
        const collections = JSON.parse(await collectionsResponse.text());
        return collections.collections
    }

    public async getNameFromRemoveCollectionModal(){
        const inputLocator = this.collectionModal.locator('input');
        const value = inputLocator.getAttribute('value');
        return value
    }

    public async getSelectedCollectionName(){
        const name = await this.page.locator('#site-content div h2').first().innerText()
        return name.replace(/folder(.*)\s/,"$1")
    }

    public async isCollectionModalWithProvidedNameVisible(name:string){
        const modal = this.collectionModal.filter({has:this.page.getByText(name)});
        await this.page.waitForTimeout(1000);
        const isVisible = await modal.isVisible();
        return isVisible
    }

    public async isMainButtonEnabledOnModal(){
        const classValue = await this.mainButtonOnModal.getAttribute('class');
        return !classValue?.includes('disabled')
    }

    public async isSelectedCollectionEmpty(){
        await this.page.waitForTimeout(500);
        const emptyStateText = await this.page.locator('#site-content div h2').nth(1).isVisible();
        return emptyStateText
    }

    public async selectCollectionsWithNames(collections:string[]){
        for (let item of collections){
            await this.listItemOnPanel.filter({hasText:item}).click({force:true})
        }
    }

    public async selectOptionFromThreeDotsMenuForCollection(optionToSelect:'Remove'|'Rename'){
        const optionLocator = this.page.locator('.mdc-menu-surface--anchor').getByRole('menuitem').getByText(optionToSelect);
        await optionLocator.click()
    }

}