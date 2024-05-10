import {Page, Locator} from '@playwright/test'

export class BasePage{
    page: Page
    yourWorkBtn: Locator

    constructor(page){
        this.page = page
        this.yourWorkBtn = page.getByRole('button').getByText('Your Work')
    }

    public async openYourWork(){
        await this.yourWorkBtn.click()
    }
}