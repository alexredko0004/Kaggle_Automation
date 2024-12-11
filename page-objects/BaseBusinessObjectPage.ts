import {Page, Locator} from '@playwright/test'
import { BasePage } from './BasePage'
import { Tags } from './Tags'
import { Collections } from './Collections'

export abstract class BaseBusinessObjectPage extends BasePage{
    private collections: Collections
    public newBtn: Locator
    private searchField: Locator
    private tags:Tags
    private yourWorkBtn: Locator

    constructor(page){
        super(page)
        this.newBtn = page.locator('#site-content').getByRole('button', {name:'New'})
        this.yourWorkBtn = page.getByRole('button').getByText('Your Work')
    }

    public async clickNewBtn(){
        await this.newBtn.click()
    }

    public collectionsPanel(){
        if (!this.collections){
           this.collections = new Collections(this.page)
        }
        return this.collections
    }

    public async getSelectedTabName(){
        const selectedTab = this.page.getByRole('tablist').locator('[aria-selected="true"]');
        const selectedTabName = await selectedTab.locator('span:not(.MuiTouchRipple-root)').innerText();
        return selectedTabName
    }

    public async openTab(tabName:string){
        await this.page.getByRole('tab',{name:tabName}).click();
        await this.page.waitForTimeout(500)
    }

    public async openYourWork(){
        await this.yourWorkBtn.click({force:true})
    }

    public tagsPanel(){
        if (!this.tags){
           this.tags = new Tags(this.page)
        }
        return this.tags
    }

}