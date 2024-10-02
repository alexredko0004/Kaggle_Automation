import { Locator} from "@playwright/test";
import { BasePage } from './BasePage'

export class Tags extends BasePage{
    applyBtn: Locator
    categoryItem: Locator
    closeBtn: Locator
    foundItem: Locator
    searchField: Locator
    selectedTagOnPanel: Locator
    tagsPanel: Locator
    tagItem: Locator

    constructor(page){
        super(page)
        this.applyBtn = page.locator('.drawer-outer-container button').filter({hasText:'Apply'})
        this.categoryItem = page.locator('.drawer-outer-container .category-select-menu_menu-items-wrapper [role="menuitem"]')
        this.closeBtn = page.locator('.drawer-outer-container').getByLabel('close')
        this.foundItem = page.locator('.drawer-outer-container [role="menuitem"]')
        this.searchField = page.locator('.drawer-outer-container input')
        this.selectedTagOnPanel = page.locator('button.selected')
        this.tagsPanel = page.locator('.drawer-outer-container')
        this.tagItem = page.locator('.drawer-outer-container [role="menuitem"]')
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
/**
 * 
 * @param categoryTag - string that follows pattern 'Category > Tag' (e.g. 'Geography And Places > Europe')
 */
    public async selectTagsFromCategory(categoryTag:string[]){
        const categoryRegex = /(?<category>(\w+\s?)+)\s\>.*/
        const tagRegex = /.*\>\s(?<tag>.*)/
        for(let e of categoryTag){
            const categoryArr = e.match(categoryRegex)
            if (categoryArr!==null&&categoryArr.groups!==undefined){
                await this.categoryItem.filter({hasText:categoryArr.groups.category}).click()
            }
            const tagArr = e.match(tagRegex)
            if (tagArr!==null&&tagArr.groups!==undefined){
                await this.tagItem.filter({hasText:tagArr.groups.tag}).click()
            }
        }
        await this.page.waitForTimeout(1000)
    }

    public async getArrayOfSelectedTags(){
        await this.tagsPanel.waitFor();
        const selectedTags = await this.selectedTagOnPanel.locator('span:not([title="Close"])').allInnerTexts();
        return selectedTags
    }

    public async removeAllTags(){
        await this.tagsPanel.waitFor();
        const selectedTags = await this.getArrayOfSelectedTags();
        for (let e of selectedTags){
            await this.selectedTagOnPanel.getByTitle('Close').first().click()
        }
    }
}