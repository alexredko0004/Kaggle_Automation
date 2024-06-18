import {Page, Locator} from '@playwright/test'
import { BasePage } from './BasePage'

export class Header extends BasePage{
    yourWorkBtn: Locator
    newBtn: Locator
    searchField: Locator

    constructor(page){
        super(page)
        this.newBtn = page.getByRole('button', {name:'New'})
        this.yourWorkBtn = page.getByRole('button').getByText('Your Work')
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