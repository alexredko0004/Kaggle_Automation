import { Locator, expect} from "@playwright/test";
import { BaseBusinessObjectPage } from "./BaseBusinessObjectPage";

export class YourWork extends BaseBusinessObjectPage{
    listItem: Locator
    searchField: Locator

    constructor(page){
        super(page)
        this.listItem = page.locator('#site-content ul li')
        this.searchField = page.getByPlaceholder('Search Your Work')
    }

    public async checkAllItemsContainingName(name:string){
        await this.page.waitForTimeout(2000)
        await this.page.reload()
        await this.page.waitForTimeout(1500);
        const items = await this.page.locator('#site-content ul li',{hasText:`${name}`}).all();
        for(let title of items){
            await title.locator('[type="checkbox"]').check();
        }
    }
    /**
     * 
     * @param itemName - can be model title or subtitle
     */
    public async clickListItem(itemName:string){
        await this.listItem.filter({hasText:itemName}).click()
    }

    public async getListItemByNameOrSubtitle(itemNameOrSubtitle:string){
        await this.page.waitForTimeout(500)
        return this.listItem.filter({hasText:itemNameOrSubtitle})
    }

    public async getListItemSubtitle(listItem:Locator){
        await this.page.waitForTimeout(500)
        return await listItem.locator('a span').first().innerText()
    }

    public async getListItemDetailsModel(listItem:Locator): Promise<{ visibility: string, owner: string, countVariations: string, countNotebooks: string}>{
        await this.page.waitForTimeout(500);
        const details = await listItem.locator('a span').nth(1).allInnerTexts();
        const detailsArray = details[0].split(' · ');
        detailsArray[0]!=='Private'?detailsArray.unshift('Public'):detailsArray
        return {visibility: detailsArray[0], owner: detailsArray[1], countVariations: detailsArray[2], countNotebooks: detailsArray[3]}
    }

    public async searchYourWork(searchString:string){
        await this.page.waitForTimeout(500)
        await this.searchField.fill(searchString)
    }
}