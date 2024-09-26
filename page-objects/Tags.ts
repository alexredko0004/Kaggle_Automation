import { Locator} from "@playwright/test";
import { BasePage } from './BasePage'

export class Tags extends BasePage{
    applyBtn: Locator
    closeBtn: Locator
    foundItem: Locator
    searchField: Locator
    selectedTagOnPanel: Locator
    tagsPanel: Locator

    constructor(page){
        super(page)
        this.applyBtn = page.locator('.drawer-outer-container button').filter({hasText:'Apply'})
        this.closeBtn = page.locator('.drawer-outer-container').getByLabel('close')
        this.foundItem = page.locator('.drawer-outer-container [role="menuitem"]')
        this.searchField = page.locator('.drawer-outer-container input')
        this.selectedTagOnPanel = page.locator('button.selected')
        this.tagsPanel = page.locator('.drawer-outer-container')
    }
    /**
     * 
     * @param itemName - can be model title or subtitle
     */
    public async clickCloseBtn(){
        await this.closeBtn.click()
    }

    public async clickApplyBtn(){
        await this.applyBtn.click()
    }

    public async isTagsPanelOpened(){
        await this.page.waitForTimeout(500);
        return await this.tagsPanel.isVisible({timeout:1000})
    }

    public async searchAndSelectTags(tags:string[]){
        for(let e of tags){
            await this.searchField.fill(e)
            await this.page.waitForTimeout(1000)
            await this.foundItem.first().click()
            await this.page.waitForTimeout(1000)
            await this.searchField.clear()
            await this.page.waitForTimeout(1000)
        }
    }

    public async getArrayOfSelectedTags(){
        const selectedTags = await this.selectedTagOnPanel.locator('span:not([title="Close"])').allInnerTexts();
        return selectedTags
    }
}