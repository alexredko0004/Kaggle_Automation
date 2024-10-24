import {Page, Locator} from '@playwright/test'
import { BasePage } from './BasePage'
import { Tags } from './Tags'
import { Collections } from './Collections'

export abstract class BaseBusinessObjectPage extends BasePage{
    private collections: Collections
    private newBtn: Locator
    private searchField: Locator
    private tags:Tags
    private yourWorkBtn: Locator

    constructor(page){
        super(page)
        this.newBtn = page.locator('#site-content').getByRole('button', {name:'New'})
        this.yourWorkBtn = page.getByRole('button').getByText('Your Work')
    }

    public collectionsPanel(){
        if (!this.collections){
           this.collections = new Collections(this.page)
        }
        return this.collections
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