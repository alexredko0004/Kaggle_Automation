import {Page, Locator} from '@playwright/test'

export class BasePage{
    page: Page
    flashMessage: Locator

    constructor(page){
        this.page = page
        this.flashMessage = page.getByRole('alert')
    }


    public async getFlashMessageText(){
        return await this.flashMessage.innerText()
    }
}