import {Page, Locator} from '@playwright/test'
import { BasePage } from './BasePage'

export class Header extends BasePage{
    yourWorkBtn: Locator
    newBtn: Locator

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
}