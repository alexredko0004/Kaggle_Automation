import {Page, Locator} from '@playwright/test'
import { BasePage } from './BasePage'
import { Tags } from './Tags'

export abstract class BaseBusinessObjectPage extends BasePage{
    yourWorkBtn: Locator
    newBtn: Locator
    searchField: Locator
    private tags:Tags

    constructor(page){
        super(page)
        this.newBtn = page.locator('#site-content').getByRole('button', {name:'New'})
        this.yourWorkBtn = page.getByRole('button').getByText('Your Work')
    }

    public tagsPanel(){
        if (!this.tags){
           this.tags = new Tags(this.page)
        }
        return this.tags
    }

    public async clickNewBtn(){
        await this.newBtn.click()
    }

    public async openYourWork(){
        await this.yourWorkBtn.click()
    }

    public async openTab(tabName:string){
        await this.page.getByRole('tab',{name:tabName}).click()
    }

}