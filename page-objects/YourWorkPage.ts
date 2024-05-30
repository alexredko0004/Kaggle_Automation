import { Locator, expect} from "@playwright/test";
import { Header } from "./Header";

export class YourWork extends Header{
    listItem: Locator
    searchField: Locator

    constructor(page){
        super(page)
        this.listItem = page.locator('#site-content ul li a')
        this.searchField = page.getByPlaceholder('Search Your Work')
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
        return await listItem.locator('span').first().innerText()
    }

    public async searchYourWork(searchString:string){
        await this.page.waitForTimeout(500)
        await this.searchField.fill(searchString)
    }
}